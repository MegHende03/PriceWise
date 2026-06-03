import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trackerListsApi, trackersApi } from './api';
import type { TestScrapeRequest, TrackerRequest } from './types';

const TRACKERS_KEY = ['trackers'] as const;
const LISTS_KEY = ['tracker-lists'] as const;

export function useTrackers() {
    return useQuery({
        queryKey: TRACKERS_KEY,
        queryFn: trackersApi.list,
        refetchInterval: 30_000, // reflect scheduler-driven updates without a manual refresh
    });
}

export function usePriceHistory(id: number | null) {
    return useQuery({
        queryKey: ['price-history', id],
        queryFn: () => trackersApi.priceHistory(id as number),
        enabled: id != null,
    });
}

export function useCreateTracker() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: TrackerRequest) => trackersApi.create(body),
        onSuccess: () => qc.invalidateQueries({ queryKey: TRACKERS_KEY }),
    });
}

export function useUpdateTracker() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: TrackerRequest }) => trackersApi.update(id, body),
        onSuccess: () => qc.invalidateQueries({ queryKey: TRACKERS_KEY }),
    });
}

export function useDeleteTracker() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => trackersApi.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: TRACKERS_KEY }),
    });
}

export function usePauseTracker() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => trackersApi.pause(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: TRACKERS_KEY }),
    });
}

export function useResumeTracker() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => trackersApi.resume(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: TRACKERS_KEY }),
    });
}

export function useTrackerLists() {
    return useQuery({
        queryKey: LISTS_KEY,
        queryFn: trackerListsApi.list,
    });
}

export function useCreateTrackerList() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (name: string) => trackerListsApi.create({ name }),
        onSuccess: () => qc.invalidateQueries({ queryKey: LISTS_KEY }),
    });
}

export function useDeleteTrackerList() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => trackerListsApi.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: LISTS_KEY });
            qc.invalidateQueries({ queryKey: TRACKERS_KEY });
        },
    });
}

/** Non-persisting test of the form's selectors (Add-Tracker form). */
export function useTestScrape() {
    return useMutation({
        mutationFn: (body: TestScrapeRequest) => trackersApi.test(body),
    });
}

/** Non-persisting test of a saved tracker's selectors (row action). */
export function useTestExisting() {
    return useMutation({
        mutationFn: (id: number) => trackersApi.testExisting(id),
    });
}
