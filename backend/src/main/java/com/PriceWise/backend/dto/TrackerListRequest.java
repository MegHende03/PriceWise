package com.PriceWise.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TrackerListRequest(
        @NotBlank @Size(max = 100) String name
) {
}
