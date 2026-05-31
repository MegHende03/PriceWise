package com.PriceWise.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

/**
 * RestClient pointed at the Node scraper service. The read timeout is generous because a
 * live scrape (browser launch + navigation + wait) can take tens of seconds.
 */
@Configuration
public class ScraperConfig {

    @Bean
    public RestClient scraperRestClient(@Value("${scraper.base-url:http://localhost:4000}") String baseUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(120));
        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }
}
