package com.PriceWise.backend.dto;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifies the scraper service's JSON maps cleanly onto {@link ScrapeResult}, including
 * Instant and BigDecimal parsing and tolerance of unknown fields.
 */
@JsonTest
class ScrapeResultJsonTest {

    @Autowired
    private JacksonTester<ScrapeResult> json;

    @Test
    void deserialisesSuccessPayload() throws IOException {
        String payload = """
                {
                  "success": true,
                  "price": 51.77,
                  "priceRaw": "£51.77",
                  "currency": "GBP",
                  "availability": "In stock (22 available)",
                  "title": "A Light in the Attic",
                  "url": "http://books.toscrape.com/x",
                  "scrapedAt": "2026-05-31T20:13:06.134Z",
                  "proxyUsed": false,
                  "somethingUnknown": "ignored"
                }
                """;

        ScrapeResult result = json.parseObject(payload);

        assertThat(result.success()).isTrue();
        assertThat(result.price()).isEqualByComparingTo(new BigDecimal("51.77"));
        assertThat(result.currency()).isEqualTo("GBP");
        assertThat(result.availability()).isEqualTo("In stock (22 available)");
        assertThat(result.scrapedAt()).isEqualTo(Instant.parse("2026-05-31T20:13:06.134Z"));
        assertThat(result.proxyUsed()).isFalse();
    }

    @Test
    void deserialisesFailurePayload() throws IOException {
        String payload = """
                {
                  "success": false,
                  "error": "Price selector not found within 3000ms: .nope",
                  "errorType": "selector_not_found",
                  "httpStatus": 200,
                  "url": "http://books.toscrape.com/x",
                  "scrapedAt": "2026-05-31T20:13:59.431Z",
                  "proxyUsed": false
                }
                """;

        ScrapeResult result = json.parseObject(payload);

        assertThat(result.success()).isFalse();
        assertThat(result.errorType()).isEqualTo("selector_not_found");
        assertThat(result.httpStatus()).isEqualTo(200);
        assertThat(result.price()).isNull();
        assertThat(result.currency()).isNull();
    }
}
