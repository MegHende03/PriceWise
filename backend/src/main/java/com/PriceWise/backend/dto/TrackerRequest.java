package com.PriceWise.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Create/update payload sent from the Add-Tracker / Edit form.
 */
public record TrackerRequest(
        @NotBlank String productName,
        @NotBlank String productUrl,
        @NotBlank String priceSelector,
        String availabilitySelector,
        @PositiveOrZero int waitTimeMs,
        @Min(1) int checkFrequencyMinutes,
        boolean proxyEnabled,
        Long listId
) {
}
