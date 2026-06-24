package com.PriceWise.backend.service;

import com.PriceWise.backend.dto.TrackerListRequest;
import com.PriceWise.backend.dto.TrackerListResponse;
import com.PriceWise.backend.entity.TrackerList;
import com.PriceWise.backend.exception.NotFoundException;
import com.PriceWise.backend.repository.TrackerListRepository;
import com.PriceWise.backend.repository.TrackerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TrackerListService {

    private final TrackerListRepository trackerListRepository;
    private final TrackerRepository trackerRepository;

    public TrackerListService(TrackerListRepository trackerListRepository,
                              TrackerRepository trackerRepository) {
        this.trackerListRepository = trackerListRepository;
        this.trackerRepository = trackerRepository;
    }

    @Transactional(readOnly = true)
    public List<TrackerListResponse> list() {
        return trackerListRepository.findAll().stream()
                .map(TrackerListResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TrackerListResponse get(Long id) {
        return TrackerListResponse.from(find(id));
    }

    @Transactional
    public TrackerListResponse create(TrackerListRequest req) {
        TrackerList list = new TrackerList();
        list.setName(req.name().trim());
        return TrackerListResponse.from(trackerListRepository.save(list));
    }

    @Transactional
    public TrackerListResponse rename(Long id, TrackerListRequest req) {
        TrackerList list = find(id);
        list.setName(req.name().trim());
        return TrackerListResponse.from(trackerListRepository.save(list));
    }

    @Transactional
    public void delete(Long id) {
        if (!trackerListRepository.existsById(id)) {
            throw new NotFoundException("List " + id + " not found");
        }
        // Unassign all trackers that belong to this list before deleting it
        trackerRepository.findByTrackerList_Id(id).forEach(t -> {
            t.setTrackerList(null);
            trackerRepository.save(t);
        });
        trackerListRepository.deleteById(id);
    }

    private TrackerList find(Long id) {
        return trackerListRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("List " + id + " not found"));
    }
}
