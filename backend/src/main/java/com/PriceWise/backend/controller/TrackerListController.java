package com.PriceWise.backend.controller;

import com.PriceWise.backend.dto.TrackerListRequest;
import com.PriceWise.backend.dto.TrackerListResponse;
import com.PriceWise.backend.service.TrackerListService;
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
@RequestMapping("/api/tracker-lists")
public class TrackerListController {

    private final TrackerListService trackerListService;

    public TrackerListController(TrackerListService trackerListService) {
        this.trackerListService = trackerListService;
    }

    @GetMapping
    public List<TrackerListResponse> list() {
        return trackerListService.list();
    }

    @GetMapping("/{id}")
    public TrackerListResponse get(@PathVariable Long id) {
        return trackerListService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TrackerListResponse create(@Valid @RequestBody TrackerListRequest request) {
        return trackerListService.create(request);
    }

    @PutMapping("/{id}")
    public TrackerListResponse rename(@PathVariable Long id, @Valid @RequestBody TrackerListRequest request) {
        return trackerListService.rename(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        trackerListService.delete(id);
    }
}
