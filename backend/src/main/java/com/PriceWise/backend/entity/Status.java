package com.PriceWise.backend.entity;

/**
 * Lifecycle state of a tracked product.
 *
 * <ul>
 *   <li>{@code ACTIVE}  - scheduled checks run normally.</li>
 *   <li>{@code PAUSED}  - checks are suspended by the user.</li>
 *   <li>{@code FAILED}  - the last scrape failed (e.g. selector not found, timeout).</li>
 *   <li>{@code BLOCKED} - the target site appears to be blocking the scraper (e.g. CAPTCHA / 403).</li>
 * </ul>
 */
public enum Status {
    ACTIVE,
    PAUSED,
    FAILED,
    BLOCKED
}