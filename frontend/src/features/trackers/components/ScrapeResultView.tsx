import type { ScrapeResult } from '../types';

interface Props {
    result: ScrapeResult | null;
    loading?: boolean;
    error?: Error | null;
}

/** Renders the outcome of a test scrape: a status line plus the raw JSON in a textbox. */
export function ScrapeResultView({ result, loading, error }: Props) {
    if (loading) {
        return <div className="pw-result pw-result-pending">Running scrape… this can take several seconds.</div>;
    }
    if (error) {
        return <div className="pw-result pw-result-fail">Request error: {error.message}</div>;
    }
    if (!result) {
        return null;
    }

    const headline = result.success
        ? `✓ Scraped ${result.priceRaw ?? result.price ?? '(no price text)'}`
        : `✗ ${result.errorType ?? 'error'}: ${result.error ?? 'Unknown error'}`;

    return (
        <div className={`pw-result ${result.success ? 'pw-result-ok' : 'pw-result-fail'}`}>
            <div className="pw-result-head">{headline}</div>
            <textarea className="pw-json" readOnly value={JSON.stringify(result, null, 2)} rows={12} />
        </div>
    );
}
