package com.PriceWise.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * A product whose price is being tracked. Backs the {@code tracked_product} table,
 * which is what the Ag Grid on the frontend reads from. The latest scraped price is
 * denormalised onto this row ({@link #currentPrice}); the full series lives in
 * {@code price_history}.
 */
@Entity
@Table(name = "tracked_product")
public class TrackedProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Human-readable name of the tracked item. */
    @Column(name = "product_name", nullable = false)
    private String productName;

    /** Retailer label derived from the product URL host (e.g. "amazon.com"). */
    @Column(name = "website")
    private String website;

    /** Link to the product page. */
    @Column(name = "product_url", nullable = false, length = 2048)
    private String productUrl;

    /** CSS/XPath selector locating the price element. */
    @Column(name = "price_selector", nullable = false, length = 1024)
    private String priceSelector;

    /** Optional selector locating an availability/stock element. */
    @Column(name = "availability_selector", length = 1024)
    private String availabilitySelector;

    /** How long the scraper waits for the price element to appear (milliseconds). */
    @Column(name = "wait_time_ms", nullable = false)
    private int waitTimeMs;

    /** How often the tracker runs, in minutes. */
    @Column(name = "check_frequency_minutes", nullable = false)
    private int checkFrequencyMinutes;

    /** Whether scrapes for this product should route through the proxy pool. */
    @Column(name = "proxy_enabled", nullable = false)
    private boolean proxyEnabled;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private Status status = Status.ACTIVE;

    /** Latest scraped price (denormalised from the most recent price_history row). */
    @Column(name = "current_price", precision = 12, scale = 2)
    private BigDecimal currentPrice;

    @Column(name = "currency", length = 8)
    private String currency;

    /** When the scraper last checked the product. */
    @Column(name = "last_checked_at")
    private Instant lastCheckedAt;

    /** When the scheduler should next check the product. */
    @Column(name = "next_check_at")
    private Instant nextCheckAt;

    /** Message from the most recent failed/blocked scrape, if any. */
    @Column(name = "last_error", length = 2048)
    private String lastError;

    /** The list this tracker belongs to, or {@code null} if unassigned. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tracker_list_id")
    private TrackerList trackerList;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getProductUrl() {
        return productUrl;
    }

    public void setProductUrl(String productUrl) {
        this.productUrl = productUrl;
    }

    public String getPriceSelector() {
        return priceSelector;
    }

    public void setPriceSelector(String priceSelector) {
        this.priceSelector = priceSelector;
    }

    public String getAvailabilitySelector() {
        return availabilitySelector;
    }

    public void setAvailabilitySelector(String availabilitySelector) {
        this.availabilitySelector = availabilitySelector;
    }

    public int getWaitTimeMs() {
        return waitTimeMs;
    }

    public void setWaitTimeMs(int waitTimeMs) {
        this.waitTimeMs = waitTimeMs;
    }

    public int getCheckFrequencyMinutes() {
        return checkFrequencyMinutes;
    }

    public void setCheckFrequencyMinutes(int checkFrequencyMinutes) {
        this.checkFrequencyMinutes = checkFrequencyMinutes;
    }

    public boolean isProxyEnabled() {
        return proxyEnabled;
    }

    public void setProxyEnabled(boolean proxyEnabled) {
        this.proxyEnabled = proxyEnabled;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Instant getLastCheckedAt() {
        return lastCheckedAt;
    }

    public void setLastCheckedAt(Instant lastCheckedAt) {
        this.lastCheckedAt = lastCheckedAt;
    }

    public Instant getNextCheckAt() {
        return nextCheckAt;
    }

    public void setNextCheckAt(Instant nextCheckAt) {
        this.nextCheckAt = nextCheckAt;
    }

    public String getLastError() {
        return lastError;
    }

    public void setLastError(String lastError) {
        this.lastError = lastError;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public TrackerList getTrackerList() {
        return trackerList;
    }

    public void setTrackerList(TrackerList trackerList) {
        this.trackerList = trackerList;
    }
}