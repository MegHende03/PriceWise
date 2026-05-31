package com.PriceWise.backend.controller;

import com.PriceWise.backend.dto.PricePointResponse;
import com.PriceWise.backend.dto.ScrapeResult;
import com.PriceWise.backend.dto.TestScrapeRequest;
import com.PriceWise.backend.dto.TrackerRequest;
import com.PriceWise.backend.dto.TrackerResponse;
import com.PriceWise.backend.service.TrackerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/trackers")
public class TrackerController {

    private final TrackerService trackerService;

    public TrackerController(TrackerService trackerService) {
        this.trackerService = trackerService;
    }

    @GetMapping
    public List<TrackerResponse> list() {
        return trackerService.list();
    }

    @GetMapping("/{id}")
    public TrackerResponse get(@PathVariable Long id) {
        return trackerService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TrackerResponse create(@Valid @RequestBody TrackerRequest request) {
        return trackerService.create(request);
    }

    @PutMapping("/{id}")
    public TrackerResponse update(@PathVariable Long id, @Valid @RequestBody TrackerRequest request) {
        return trackerService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        trackerService.delete(id);
    }

    /** Ad-hoc test scrape from the Add-Tracker form (nothing is persisted). */
    @PostMapping("/test")
    public ScrapeResult test(@Valid @RequestBody TestScrapeRequest request) {
        return trackerService.testAdHoc(request);
    }

    /** Test scrape using a saved tracker's selectors (nothing is persisted). */
    @PostMapping("/{id}/test")
    public ScrapeResult testExisting(@PathVariable Long id) {
        return trackerService.testExisting(id);
    }

    /** Run a real check now: scrape and persist the result. */
    @PostMapping("/{id}/check")
    public ScrapeResult check(@PathVariable Long id) {
        return trackerService.runCheck(id);
    }

    @PostMapping("/{id}/pause")
    public TrackerResponse pause(@PathVariable Long id) {
        return trackerService.pause(id);
    }

    @PostMapping("/{id}/resume")
    public TrackerResponse resume(@PathVariable Long id) {
        return trackerService.resume(id);
    }

    @GetMapping("/{id}/price-history")
    public List<PricePointResponse> priceHistory(@PathVariable Long id) {
        return trackerService.priceHistory(id);
    }
}
