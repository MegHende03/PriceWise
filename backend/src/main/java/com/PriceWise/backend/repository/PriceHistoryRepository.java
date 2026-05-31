package com.PriceWise.backend.repository;

import com.PriceWise.backend.entity.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {

    /** Full price series for a product, oldest first, for the history chart. */
    List<PriceHistory> findByTrackedProduct_IdOrderByScrapedAtAsc(Long trackedProductId);
}
