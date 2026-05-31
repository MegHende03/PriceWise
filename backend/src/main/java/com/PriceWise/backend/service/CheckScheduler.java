package com.PriceWise.backend.service;

import com.PriceWise.backend.entity.Status;
import com.PriceWise.backend.entity.TrackedProduct;
import com.PriceWise.backend.repository.TrackerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

/**
 * Periodically sweeps for ACTIVE trackers whose next check is due and runs them. A single
 * sweep runs checks sequentially, which is fine for a single-user local deployment.
 */
@Component
public class CheckScheduler {

    private static final Logger log = LoggerFactory.getLogger(CheckScheduler.class);

    private final TrackerRepository trackerRepository;
    private final TrackerService trackerService;

    public CheckScheduler(TrackerRepository trackerRepository, TrackerService trackerService) {
        this.trackerRepository = trackerRepository;
        this.trackerService = trackerService;
    }

    @Scheduled(fixedDelayString = "${scraper.check-sweep-ms:60000}")
    public void sweep() {
        List<TrackedProduct> due =
                trackerRepository.findByStatusAndNextCheckAtLessThanEqual(Status.ACTIVE, Instant.now());
        if (due.isEmpty()) {
            return;
        }
        log.info("Running scheduled checks for {} tracker(s)", due.size());
        for (TrackedProduct p : due) {
            try {
                trackerService.runCheck(p.getId());
            } catch (Exception e) {
                log.warn("Scheduled check failed for tracker {}: {}", p.getId(), e.getMessage());
            }
        }
    }
}
