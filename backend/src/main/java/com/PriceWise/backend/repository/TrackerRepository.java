package com.PriceWise.backend.repository;

import com.PriceWise.backend.entity.Status;
import com.PriceWise.backend.entity.TrackedProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface TrackerRepository extends JpaRepository<TrackedProduct, Long> {

    /**
     * Trackers that are due for a scheduled check: in the given status and with a
     * {@code next_check_at} at or before the supplied instant. Used by the scheduler sweep.
     */
    List<TrackedProduct> findByStatusAndNextCheckAtLessThanEqual(Status status, Instant cutoff);

    /** All trackers assigned to a specific list. Used when deleting a list to unassign them. */
    List<TrackedProduct> findByTrackerList_Id(Long listId);
}
