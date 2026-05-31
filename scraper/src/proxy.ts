import { ProxyConfiguration } from 'crawlee';

/**
 * Builds a Crawlee ProxyConfiguration from the comma-separated PROXY_URLS env var.
 * Returns undefined when no proxies are configured, in which case scrapes run from
 * the direct IP and any per-tracker proxyEnabled flag is a no-op.
 */
export function buildProxyConfiguration(): ProxyConfiguration | undefined {
    const raw = process.env.PROXY_URLS?.trim();
    if (!raw) return undefined;

    const proxyUrls = raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    if (proxyUrls.length === 0) return undefined;
    return new ProxyConfiguration({ proxyUrls });
}
