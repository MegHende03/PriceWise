package com.PriceWise.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * A single successful price observation for a {@link TrackedProduct}. Backs the
 * {@code price_history} table, which the price-history chart reads from. Only
 * successful scrapes are recorded here; failures update the parent product's
 * status/last_error instead, keeping this series clean.
 */
@Entity
@Table(
        name = "price_history",
        indexes = @Index(name = "idx_price_history_product_time", columnList = "tracked_product_id, scraped_at")
)
public class PriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tracked_product_id", nullable = false)
    private TrackedProduct trackedProduct;

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "currency", length = 8)
    private String currency;

    @Column(name = "availability", length = 64)
    private String availability;

    @Column(name = "scraped_at", nullable = false)
    private Instant scrapedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TrackedProduct getTrackedProduct() {
        return trackedProduct;
    }

    public void setTrackedProduct(TrackedProduct trackedProduct) {
        this.trackedProduct = trackedProduct;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public Instant getScrapedAt() {
        return scrapedAt;
    }

    public void setScrapedAt(Instant scrapedAt) {
        this.scrapedAt = scrapedAt;
    }
}
