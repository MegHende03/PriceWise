package com.PriceWise.backend.service;

import com.PriceWise.backend.dto.PricePointResponse;
import com.PriceWise.backend.dto.ScrapeResult;
import com.PriceWise.backend.dto.TestScrapeRequest;
import com.PriceWise.backend.dto.TrackerRequest;
import com.PriceWise.backend.dto.TrackerResponse;
import com.PriceWise.backend.entity.PriceHistory;
import com.PriceWise.backend.entity.Status;
import com.PriceWise.backend.entity.TrackedProduct;
import com.PriceWise.backend.exception.NotFoundException;
import com.PriceWise.backend.repository.PriceHistoryRepository;
import com.PriceWise.backend.repository.TrackerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class TrackerService {

    private final TrackerRepository trackerRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final ScrapeService scrapeService;

    public TrackerService(TrackerRepository trackerRepository,
                          PriceHistoryRepository priceHistoryRepository,
                          ScrapeService scrapeService) {
        this.trackerRepository = trackerRepository;
        this.priceHistoryRepository = priceHistoryRepository;
        this.scrapeService = scrapeService;
    }

    @Transactional(readOnly = true)
    public List<TrackerResponse> list() {
        return trackerRepository.findAll().stream().map(TrackerResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public TrackerResponse get(Long id) {
        return TrackerResponse.from(find(id));
    }

    @Transactional
    public TrackerResponse create(TrackerRequest req) {
        TrackedProduct p = new TrackedProduct();
        apply(p, req);
        p.setStatus(Status.ACTIVE);
        // Due immediately so the next scheduler sweep fetches an initial price.
        p.setNextCheckAt(Instant.now());
        return TrackerResponse.from(trackerRepository.save(p));
    }

    @Transactional
    public TrackerResponse update(Long id, TrackerRequest req) {
        TrackedProduct p = find(id);
        apply(p, req);
        return TrackerResponse.from(trackerRepository.save(p));
    }

    @Transactional
    public void delete(Long id) {
        if (!trackerRepository.existsById(id)) {
            throw new NotFoundException("Tracker " + id + " not found");
        }
        trackerRepository.deleteById(id);
    }

    @Transactional
    public TrackerResponse pause(Long id) {
        TrackedProduct p = find(id);
        p.setStatus(Status.PAUSED);
        return TrackerResponse.from(trackerRepository.save(p));
    }

    @Transactional
    public TrackerResponse resume(Long id) {
        TrackedProduct p = find(id);
        p.setStatus(Status.ACTIVE);
        p.setLastError(null);
        p.setNextCheckAt(Instant.now());
        return TrackerResponse.from(trackerRepository.save(p));
    }

    /** Non-persisting test of arbitrary selectors from the Add-Tracker form. */
    public ScrapeResult testAdHoc(TestScrapeRequest req) {
        return scrapeService.scrape(req.productUrl(), req.priceSelector(),
                req.availabilitySelector(), req.waitTimeMs(), req.proxyEnabled());
    }

    /** Non-persisting test using a saved tracker's selectors. */
    public ScrapeResult testExisting(Long id) {
        TrackedProduct p = find(id);
        return scrapeService.scrape(p.getProductUrl(), p.getPriceSelector(),
                p.getAvailabilitySelector(), p.getWaitTimeMs(), p.isProxyEnabled());
    }

    @Transactional(readOnly = true)
    public List<PricePointResponse> priceHistory(Long id) {
        if (!trackerRepository.existsById(id)) {
            throw new NotFoundException("Tracker " + id + " not found");
        }
        return priceHistoryRepository.findByTrackedProduct_IdOrderByScrapedAtAsc(id)
                .stream().map(PricePointResponse::from).toList();
    }

    /**
     * Runs a real check: scrapes, and on success records a price_history row and refreshes
     * the product's current price/status; on failure records the error and a FAILED/BLOCKED
     * status. The scrape is performed outside any transaction so a slow HTTP call does not
     * hold a database connection open; each save is its own short transaction.
     */
    public ScrapeResult runCheck(Long id) {
        TrackedProduct p = find(id);
        ScrapeResult result = scrapeService.scrape(p.getProductUrl(), p.getPriceSelector(),
                p.getAvailabilitySelector(), p.getWaitTimeMs(), p.isProxyEnabled());

        Instant now = Instant.now();
        p.setLastCheckedAt(now);
        p.setNextCheckAt(nextCheckAt(now, p.getCheckFrequencyMinutes()));

        if (result.success() && result.price() != null) {
            p.setCurrentPrice(result.price());
            p.setCurrency(result.currency());
            p.setLastError(null);
            p.setStatus(Status.ACTIVE);

            PriceHistory point = new PriceHistory();
            point.setTrackedProduct(p);
            point.setPrice(result.price());
            point.setCurrency(result.currency());
            point.setAvailability(truncate(result.availability(), 64));
            point.setScrapedAt(result.scrapedAt() != null ? result.scrapedAt() : now);
            priceHistoryRepository.save(point);
        } else {
            p.setLastError(truncate(result.error() != null ? result.error() : "Scrape failed", 2048));
            p.setStatus("blocked".equalsIgnoreCase(result.errorType()) ? Status.BLOCKED : Status.FAILED);
        }

        trackerRepository.save(p);
        return result;
    }

    private TrackedProduct find(Long id) {
        return trackerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tracker " + id + " not found"));
    }

    private void apply(TrackedProduct p, TrackerRequest req) {
        p.setProductName(req.productName().trim());
        p.setProductUrl(req.productUrl().trim());
        p.setWebsite(deriveWebsite(req.productUrl()));
        p.setPriceSelector(req.priceSelector().trim());
        p.setAvailabilitySelector(
                req.availabilitySelector() != null && !req.availabilitySelector().isBlank()
                        ? req.availabilitySelector().trim() : null);
        p.setWaitTimeMs(req.waitTimeMs());
        p.setCheckFrequencyMinutes(req.checkFrequencyMinutes());
        p.setProxyEnabled(req.proxyEnabled());
    }

    private static String deriveWebsite(String url) {
        try {
            String host = URI.create(url.trim()).getHost();
            if (host == null) {
                return null;
            }
            return host.startsWith("www.") ? host.substring(4) : host;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Next check time = now + interval, plus a random jitter of up to ±15% of the interval
     * (at least ±2 minutes), so recurring checks don't fire at exact, robotic intervals.
     * Package-private for testing.
     */
    static Instant nextCheckAt(Instant now, int freqMinutes) {
        long intervalSeconds = (long) freqMinutes * 60L;
        long jitterCap = Math.max(120L, Math.round(intervalSeconds * 0.15));
        long offset = ThreadLocalRandom.current().nextLong(-jitterCap, jitterCap + 1);
        long delaySeconds = Math.max(60L, intervalSeconds + offset);
        return now.plusSeconds(delaySeconds);
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return null;
        }
        return value.length() <= max ? value : value.substring(0, max);
    }
}
