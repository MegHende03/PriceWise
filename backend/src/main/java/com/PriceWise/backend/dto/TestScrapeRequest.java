package com.PriceWise.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Payload for an ad-hoc test scrape from the Add-Tracker form (nothing is persisted).
 */
public record TestScrapeRequest(
        @NotBlank String productUrl,
        @NotBlank String priceSelector,
        String availabilitySelector,
        @PositiveOrZero int waitTimeMs,
        boolean proxyEnabled
) {
}
