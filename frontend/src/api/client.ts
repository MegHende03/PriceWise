const API_BASE =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080';

const CREDENTIALS_KEY = 'pricewise_credentials';

export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export function getStoredCredentials(): { username: string; password: string } | null {
    const stored = localStorage.getItem(CREDENTIALS_KEY);
    return stored ? JSON.parse(stored) : null;
}

export function setStoredCredentials(username: string, password: string): void {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ username, password }));
}

export function clearStoredCredentials(): void {
    localStorage.removeItem(CREDENTIALS_KEY);
}

function getBasicAuthHeader(): string | null {
    const creds = getStoredCredentials();
    if (!creds) return null;
    return 'Basic ' + btoa(`${creds.username}:${creds.password}`);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const headers = { 'Content-Type': 'application/json', ...(options?.headers ?? {}) };
    const authHeader = getBasicAuthHeader();
    if (authHeader) {
        headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${API_BASE}${path}`, {
        headers,
        ...options,
    });

    if (!response.ok) {
        let message = `Request failed with status ${response.status}`;
        try {
            // Spring's ProblemDetail puts the human-readable reason in `detail`.
            const body = (await response.json()) as { detail?: string; message?: string };
            message = body.detail ?? body.message ?? message;
        } catch {
            // non-JSON error body; keep the default message
        }
        throw new ApiError(response.status, message);
    }

    if (response.status === 204) {
        return undefined as T;
    }
    return (await response.json()) as T;
}

export const apiClient = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
        request<T>(path, {
            method: 'POST',
            body: body !== undefined ? JSON.stringify(body) : undefined,
        }),
    put: <T>(path: string, body: unknown) =>
        request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
    del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
