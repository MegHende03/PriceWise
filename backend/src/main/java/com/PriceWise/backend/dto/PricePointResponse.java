package com.PriceWise.backend.dto;

import com.PriceWise.backend.entity.PriceHistory;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * A single point on the price-history chart.
 */
public record PricePointResponse(
        BigDecimal price,
        String currency,
        String availability,
        Instant scrapedAt
) {
    public static PricePointResponse from(PriceHistory h) {
        return new PricePointResponse(h.getPrice(), h.getCurrency(), h.getAvailability(), h.getScrapedAt());
    }
}
