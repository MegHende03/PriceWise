package com.PriceWise.backend.dto;

import com.PriceWise.backend.entity.TrackerList;

import java.time.Instant;

public record TrackerListResponse(
        Long id,
        String name,
        Instant createdAt,
        Instant updatedAt
) {
    public static TrackerListResponse from(TrackerList list) {
        return new TrackerListResponse(
                list.getId(),
                list.getName(),
                list.getCreatedAt(),
                list.getUpdatedAt()
        );
    }
}
