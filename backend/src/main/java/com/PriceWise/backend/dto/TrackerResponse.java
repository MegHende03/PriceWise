package com.PriceWise.backend.dto;

import com.PriceWise.backend.entity.Status;
import com.PriceWise.backend.entity.TrackedProduct;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Tracker projection the Ag Grid reads from. Includes the editable fields so the Edit
 * form can be pre-populated without a second request.
 */
public record TrackerResponse(
        Long id,
        String productName,
        String website,
        String productUrl,
        String priceSelector,
        String availabilitySelector,
        int waitTimeMs,
        int checkFrequencyMinutes,
        boolean proxyEnabled,
        Status status,
        BigDecimal currentPrice,
        String currency,
        Instant lastCheckedAt,
        Instant nextCheckAt,
        String lastError
) {
    public static TrackerResponse from(TrackedProduct p) {
        return new TrackerResponse(
                p.getId(),
                p.getProductName(),
                p.getWebsite(),
                p.getProductUrl(),
                p.getPriceSelector(),
                p.getAvailabilitySelector(),
                p.getWaitTimeMs(),
                p.getCheckFrequencyMinutes(),
                p.isProxyEnabled(),
                p.getStatus(),
                p.getCurrentPrice(),
                p.getCurrency(),
                p.getLastCheckedAt(),
                p.getNextCheckAt(),
                p.getLastError()
        );
    }
}
