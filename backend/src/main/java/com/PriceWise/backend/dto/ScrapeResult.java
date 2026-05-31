package com.PriceWise.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Result of a scrape. Doubles as (a) the shape the {@code ScraperClient} deserialises the
 * Node service's JSON into and (b) the response returned to the frontend's test textbox,
 * so the user sees exactly what was scraped before saving a tracker.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ScrapeResult(
        boolean success,
        BigDecimal price,
        String priceRaw,
        String currency,
        String availability,
        String title,
        String url,
        Instant scrapedAt,
        Boolean proxyUsed,
        String error,
        String errorType,
        Integer httpStatus
) {
}
