package com.PriceWise.backend.service;

import com.PriceWise.backend.client.ScraperClient;
import com.PriceWise.backend.client.ScraperClient.ScrapeApiRequest;
import com.PriceWise.backend.dto.ScrapeResult;
import org.springframework.stereotype.Service;

/**
 * Translates tracker/scrape parameters into a scraper-service call.
 */
@Service
public class ScrapeService {

    private final ScraperClient scraperClient;

    public ScrapeService(ScraperClient scraperClient) {
        this.scraperClient = scraperClient;
    }

    public ScrapeResult scrape(String url, String priceSelector, String availabilitySelector,
                               int waitTimeMs, boolean proxyEnabled) {
        ScrapeApiRequest request = new ScrapeApiRequest(
                url,
                priceSelector,
                (availabilitySelector != null && !availabilitySelector.isBlank()) ? availabilitySelector : null,
                waitTimeMs > 0 ? waitTimeMs : null,
                proxyEnabled
        );
        return scraperClient.scrape(request);
    }
}
