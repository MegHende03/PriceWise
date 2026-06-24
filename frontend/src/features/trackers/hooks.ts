import { useMemo } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { alertsApi, trackerListsApi, trackersApi } from './api';
import { ApiError } from '../../api/client';
import type { ManualPriceRequest, NotificationAlert, NotificationAlertRequest, PricePoint, TestScrapeRequest, TrackerRequest } from './types';

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

export interface TotalPricePoint {
    time: number;
    price: number;
}

/**
 * Combines several trackers' price histories into a single "total value over time"
 * series. At each observed timestamp the total is the sum of every tracker's most
 * recent price up to that point, so the line behaves like a running portfolio value.
 */
function aggregateTotalHistory(histories: PricePoint[][]): TotalPricePoint[] {
    const series = histories
        .filter((h) => h.length > 0)
        .map((h) => h.map((p) => ({ time: new Date(p.scrapedAt).getTime(), price: p.price })));
    if (series.length === 0) return [];

    const times = Array.from(new Set(series.flat().map((p) => p.time))).sort((a, b) => a - b);

    return times.map((time) => {
        let price = 0;
        for (const points of series) {
            let latest: number | null = null;
            for (const point of points) {
                if (point.time <= time) latest = point.price;
                else break;
            }
            if (latest != null) price += latest;
        }
        return { time, price };
    });
}

/** Fetches every given tracker's price history and folds them into one total series. */
export function useTotalPriceHistory(ids: number[]) {
    const results = useQueries({
        queries: ids.map((id) => ({
            queryKey: ['price-history', id],
            queryFn: () => trackersApi.priceHistory(id),
        })),
    });

    const isLoading = results.some((r) => r.isLoading);
    const error = results.find((r) => r.error)?.error ?? null;

    // Recompute only when the underlying data actually changes, not on every render.
    const signature = results
        .map((r) => `${r.data?.length ?? 0}:${r.data?.at(-1)?.scrapedAt ?? ''}`)
        .join('|');
    const points = useMemo(
        () => aggregateTotalHistory(results.map((r) => r.data ?? [])),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [signature],
    );

    return { points, isLoading, error };
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

export function useRecordManualPrice() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: ManualPriceRequest }) =>
            trackersApi.recordPrice(id, body),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: TRACKERS_KEY });
            qc.invalidateQueries({ queryKey: ['price-history', id] });
        },
    });
}

/** Per-domain scrape success rates, for the Add-Tracker reliability hint. */
export function useScrapeStats() {
    return useQuery({
        queryKey: ['scrape-stats'],
        queryFn: trackersApi.scrapeStats,
        staleTime: 5 * 60_000,
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

export function useAlert(trackerId: number | null) {
    return useQuery<NotificationAlert | null>({
        queryKey: ['alert', trackerId],
        queryFn: async () => {
            try {
                return await alertsApi.get(trackerId as number);
            } catch (err) {
                if (err instanceof ApiError && err.status === 404) return null;
                throw err;
            }
        },
        enabled: trackerId != null,
    });
}

export function useSaveAlert() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ trackerId, body }: { trackerId: number; body: NotificationAlertRequest }) =>
            alertsApi.upsert(trackerId, body),
        onSuccess: (_, { trackerId }) => qc.invalidateQueries({ queryKey: ['alert', trackerId] }),
    });
}

export function useDeleteAlert() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (trackerId: number) => alertsApi.remove(trackerId),
        onSuccess: (_, trackerId) => qc.invalidateQueries({ queryKey: ['alert', trackerId] }),
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
