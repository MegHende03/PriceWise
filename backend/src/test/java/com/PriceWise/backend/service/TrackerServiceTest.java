package com.PriceWise.backend.service;

import org.junit.jupiter.api.RepeatedTest;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for the scheduling jitter. Plain JUnit (no Spring context / DB): the helper is
 * pure and deterministic in its bounds, so repeated runs exercise the randomness.
 */
class TrackerServiceTest {

    @RepeatedTest(100)
    void jitterStaysWithinFifteenPercentForLongIntervals() {
        Instant now = Instant.now();
        int freqMinutes = 360; // 6 hours
        long interval = 360L * 60L;
        long cap = Math.round(interval * 0.15); // 3240s

        long delay = TrackerService.nextCheckAt(now, freqMinutes).getEpochSecond() - now.getEpochSecond();

        assertThat(delay).isBetween(interval - cap, interval + cap);
    }

    @RepeatedTest(100)
    void jitterUsesMinimumFloorForShortIntervalsAndStaysPositive() {
        Instant now = Instant.now();
        int freqMinutes = 15;
        long interval = 15L * 60L; // 900s
        long cap = Math.max(120L, Math.round(interval * 0.15)); // 135s

        long delay = TrackerService.nextCheckAt(now, freqMinutes).getEpochSecond() - now.getEpochSecond();

        assertThat(delay).isBetween(Math.max(60L, interval - cap), interval + cap);
    }
}
