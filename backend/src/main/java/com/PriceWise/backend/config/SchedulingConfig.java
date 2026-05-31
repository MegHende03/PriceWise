package com.PriceWise.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Enables the {@code @Scheduled} sweep that runs due tracker checks.
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
