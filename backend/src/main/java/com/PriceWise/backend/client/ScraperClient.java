package com.PriceWise.backend.client;

import com.PriceWise.backend.dto.ScrapeResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Instant;

/**
 * Thin HTTP client over the Node scraper service. The scraper returns a JSON body for both
 * success (200) and failure (502); a non-2xx status is therefore not treated as an error
 * here. If the service is unreachable, a synthetic failure result is returned so callers
 * never have to deal with exceptions from the scrape path.
 */
@Component
public class ScraperClient {

    private static final Logger log = LoggerFactory.getLogger(ScraperClient.class);

    private final RestClient restClient;

    public ScraperClient(RestClient scraperRestClient) {
        this.restClient = scraperRestClient;
    }

    public ScrapeResult scrape(ScrapeApiRequest request) {
        try {
            ScrapeResult result = restClient.post()
                    .uri("/scrape")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        // The scraper returns a structured JSON failure body on 502; read it below.
                    })
                    .body(ScrapeResult.class);

            if (result != null) {
                return result;
            }
            return unavailable(request.url(), "Empty response from scraper service");
        } catch (Exception ex) {
            log.warn("Scraper service call failed for {}: {}", request.url(), ex.getMessage());
            return unavailable(request.url(), "Scraper service unavailable: " + ex.getMessage());
        }
    }

    private static ScrapeResult unavailable(String url, String message) {
        return new ScrapeResult(false, null, null, null, null, null, url,
                Instant.now(), false, message, "error", null);
    }

    /** Request body POSTed to the scraper's /scrape endpoint. */
    public record ScrapeApiRequest(
            String url,
            String priceSelector,
            String availabilitySelector,
            Integer waitTimeMs,
            boolean proxyEnabled
    ) {
    }
}
