import { apiClient } from '../../api/client';
import type { NotificationAlert, NotificationAlertRequest, PricePoint, ScrapeResult, TestScrapeRequest, Tracker, TrackerList, TrackerRequest } from './types';

export const trackersApi = {
    list: () => apiClient.get<Tracker[]>('/api/trackers'),
    create: (body: TrackerRequest) => apiClient.post<Tracker>('/api/trackers', body),
    update: (id: number, body: TrackerRequest) => apiClient.put<Tracker>(`/api/trackers/${id}`, body),
    remove: (id: number) => apiClient.del<void>(`/api/trackers/${id}`),
    test: (body: TestScrapeRequest) => apiClient.post<ScrapeResult>('/api/trackers/test', body),
    testExisting: (id: number) => apiClient.post<ScrapeResult>(`/api/trackers/${id}/test`),
    check: (id: number) => apiClient.post<ScrapeResult>(`/api/trackers/${id}/check`),
    pause: (id: number) => apiClient.post<Tracker>(`/api/trackers/${id}/pause`),
    resume: (id: number) => apiClient.post<Tracker>(`/api/trackers/${id}/resume`),
    priceHistory: (id: number) => apiClient.get<PricePoint[]>(`/api/trackers/${id}/price-history`),
};

export const alertsApi = {
    get: (trackerId: number) => apiClient.get<NotificationAlert>(`/api/trackers/${trackerId}/alert`),
    upsert: (trackerId: number, body: NotificationAlertRequest) =>
        apiClient.put<NotificationAlert>(`/api/trackers/${trackerId}/alert`, body),
    remove: (trackerId: number) => apiClient.del<void>(`/api/trackers/${trackerId}/alert`),
};

export const trackerListsApi = {
    list: () => apiClient.get<TrackerList[]>('/api/tracker-lists'),
    create: (body: { name: string }) => apiClient.post<TrackerList>('/api/tracker-lists', body),
    rename: (id: number, body: { name: string }) => apiClient.put<TrackerList>(`/api/tracker-lists/${id}`, body),
    remove: (id: number) => apiClient.del<void>(`/api/tracker-lists/${id}`),
};
