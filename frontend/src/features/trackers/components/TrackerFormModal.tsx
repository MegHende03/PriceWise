import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../../../components/Modal';
import { FREQUENCY_PRESETS } from '../../../lib/format';
import { useCreateTracker, useScrapeStats, useTestScrape, useUpdateTracker } from '../hooks';
import type { ScrapeResult, Tracker, TrackerRequest, TrackingMode } from '../types';
import { ScrapeResultView } from './ScrapeResultView';

interface Props {
    mode: 'create' | 'edit';
    tracker?: Tracker;
    onClose: () => void;
    /** Active list to assign a new tracker to, or the existing tracker's list on edit. */
    listId?: number | null;
}

interface FormState {
    productUrl: string;
    productName: string;
    priceSelector: string;
    availabilitySelector: string;
    waitTimeMs: number;
    checkFrequencyMinutes: number;
    proxyEnabled: boolean;
    trackingMode: TrackingMode;
}

// Changing any of these invalidates a prior test result (selectors no longer proven).
const SCRAPE_AFFECTING: ReadonlyArray<keyof FormState> = [
    'productUrl',
    'priceSelector',
    'availabilitySelector',
    'waitTimeMs',
    'proxyEnabled',
];

// Retailers known for aggressive anti-bot protection; we nudge toward manual entry for
// these even before any scrape stats have accumulated.
const HIGH_SECURITY_DOMAINS = [
    'amazon.', 'walmart.', 'target.', 'bestbuy.', 'costco.',
    'homedepot.', 'lowes.', 'nike.', 'adidas.', 'apple.',
];

function hostOf(url: string): string | null {
    try {
        const h = new URL(url.trim()).hostname.toLowerCase();
        return h.startsWith('www.') ? h.slice(4) : h;
    } catch {
        return null;
    }
}

export function TrackerFormModal({ mode, tracker, onClose, listId }: Props) {
    const [form, setForm] = useState<FormState>(() => ({
        productUrl: tracker?.productUrl ?? '',
        productName: tracker?.productName ?? '',
        priceSelector: tracker?.priceSelector ?? '',
        availabilitySelector: tracker?.availabilitySelector ?? '',
        waitTimeMs: tracker?.waitTimeMs ?? 10_000,
        checkFrequencyMinutes: tracker?.checkFrequencyMinutes ?? 1440,
        proxyEnabled: tracker?.proxyEnabled ?? false,
        trackingMode: tracker?.trackingMode ?? 'SCRAPED',
    }));
    const [testResult, setTestResult] = useState<ScrapeResult | null>(null);

    const testScrape = useTestScrape();
    const createTracker = useCreateTracker();
    const updateTracker = useUpdateTracker();
    const { data: scrapeStats } = useScrapeStats();
    const [saveError, setSaveError] = useState<string | null>(null);

    const isManual = form.trackingMode === 'MANUAL';
    const canTest = !isManual && form.productUrl.trim() !== '' && form.priceSelector.trim() !== '';
    const baseValid = form.productName.trim() !== '' && form.productUrl.trim() !== '';
    const testPassed = testResult?.success === true;
    // Manual trackers save with just a name + URL. Scraped trackers need a selector, and on
    // create a passing test so broken selectors can't be saved; editing does not.
    const canSave = isManual
        ? baseValid
        : baseValid && form.priceSelector.trim() !== '' && (mode === 'edit' || testPassed);
    const saving = createTracker.isPending || updateTracker.isPending;

    // Per-domain reliability hint for the entered URL (scraped mode only).
    const host = useMemo(() => hostOf(form.productUrl), [form.productUrl]);
    const domainStat = useMemo(
        () => (host ? scrapeStats?.find((s) => s.website === host) ?? null : null),
        [scrapeStats, host],
    );
    const isHighSecurity = host != null && HIGH_SECURITY_DOMAINS.some((d) => host.includes(d));
    const lowSuccess =
        domainStat != null && domainStat.sampleSize >= 3 && (domainStat.successRate ?? 1) < 0.5;

    function update<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (key === 'trackingMode' || SCRAPE_AFFECTING.includes(key)) {
            setTestResult(null);
        }
    }

    async function handleTest() {
        setSaveError(null);
        const result = await testScrape.mutateAsync({
            productUrl: form.productUrl.trim(),
            priceSelector: form.priceSelector.trim(),
            availabilitySelector: form.availabilitySelector.trim() || null,
            waitTimeMs: form.waitTimeMs,
            proxyEnabled: form.proxyEnabled,
        });
        setTestResult(result);
        if (!form.productName.trim() && result.title) {
            setForm((prev) => ({ ...prev, productName: result.title as string }));
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!canSave) return;
        setSaveError(null);
        const body: TrackerRequest = {
            productName: form.productName.trim(),
            productUrl: form.productUrl.trim(),
            priceSelector: isManual ? null : form.priceSelector.trim(),
            availabilitySelector: isManual ? null : form.availabilitySelector.trim() || null,
            waitTimeMs: form.waitTimeMs,
            checkFrequencyMinutes: form.checkFrequencyMinutes,
            proxyEnabled: form.proxyEnabled,
            trackingMode: form.trackingMode,
            listId: listId ?? null,
        };
        try {
            if (mode === 'edit' && tracker) {
                await updateTracker.mutateAsync({ id: tracker.id, body });
            } else {
                await createTracker.mutateAsync(body);
            }
            onClose();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Failed to save tracker');
        }
    }

    return (
        <Modal title={mode === 'edit' ? 'Edit tracker' : 'Add tracker'} onClose={onClose} width={640}>
            <form className="pw-form" onSubmit={handleSubmit}>
                <div className="pw-mode-toggle" role="radiogroup" aria-label="Tracking mode">
                    <button
                        type="button"
                        role="radio"
                        aria-checked={!isManual}
                        className={`pw-mode-btn${!isManual ? ' pw-mode-btn--active' : ''}`}
                        onClick={() => update('trackingMode', 'SCRAPED')}
                    >
                        <span className="pw-mode-btn-title">Automatic</span>
                        <span className="pw-mode-btn-sub">Scrape the price on a schedule</span>
                    </button>
                    <button
                        type="button"
                        role="radio"
                        aria-checked={isManual}
                        className={`pw-mode-btn${isManual ? ' pw-mode-btn--active' : ''}`}
                        onClick={() => update('trackingMode', 'MANUAL')}
                    >
                        <span className="pw-mode-btn-title">Manual entry</span>
                        <span className="pw-mode-btn-sub">Enter the price yourself</span>
                    </button>
                </div>

                <label className="pw-field">
                    <span>Product URL *</span>
                    <input
                        type="url"
                        value={form.productUrl}
                        onChange={(e) => update('productUrl', e.target.value)}
                        placeholder="https://www.example.com/product/123"
                        required
                    />
                </label>

                {!isManual && lowSuccess && (
                    <div className="pw-reliability pw-reliability--warn">
                        <span>
                            ⚠️ <strong>{host}</strong> scrapes succeed only{' '}
                            {Math.round((domainStat!.successRate ?? 0) * 100)}% of the time
                            ({domainStat!.successCount}/{domainStat!.sampleSize}). Consider switching to manual entry.
                        </span>
                        <button type="button" className="pw-link-btn" onClick={() => update('trackingMode', 'MANUAL')}>
                            Use manual entry
                        </button>
                    </div>
                )}
                {!isManual && !lowSuccess && isHighSecurity && (
                    <div className="pw-reliability pw-reliability--warn">
                        <span>
                            ⚠️ <strong>{host}</strong> often blocks automated scrapers. Manual entry may be more reliable.
                        </span>
                        <button type="button" className="pw-link-btn" onClick={() => update('trackingMode', 'MANUAL')}>
                            Use manual entry
                        </button>
                    </div>
                )}
                {!isManual && !lowSuccess && !isHighSecurity && domainStat && domainStat.sampleSize >= 3 && (
                    <p className="pw-reliability pw-reliability--ok">
                        ✓ <strong>{host}</strong> scrapes succeed {Math.round((domainStat.successRate ?? 0) * 100)}% of the time.
                    </p>
                )}

                <label className="pw-field">
                    <span>Product Name *</span>
                    <input
                        type="text"
                        value={form.productName}
                        onChange={(e) => update('productName', e.target.value)}
                        placeholder={isManual ? 'e.g. Sony WH-1000XM5' : 'Auto-filled from the page title after a test'}
                        required
                    />
                </label>

                {isManual ? (
                    <p className="pw-hint">
                        Manual trackers aren't checked automatically. After saving, use <strong>Update price</strong> on
                        the row to record a price — it's added to the price-history chart and totals.
                    </p>
                ) : (
                    <>
                        <label className="pw-field">
                            <span>Price Selector *</span>
                            <input
                                type="text"
                                value={form.priceSelector}
                                onChange={(e) => update('priceSelector', e.target.value)}
                                placeholder=".price, #priceblock_ourprice, …"
                                required
                            />
                        </label>

                        <label className="pw-field">
                            <span>Availability Selector</span>
                            <input
                                type="text"
                                value={form.availabilitySelector}
                                onChange={(e) => update('availabilitySelector', e.target.value)}
                                placeholder="Optional, e.g. #availability"
                            />
                        </label>

                        <div className="pw-field-row">
                            <label className="pw-field">
                                <span>Wait Time (ms)</span>
                                <input
                                    type="number"
                                    min={0}
                                    step={500}
                                    value={form.waitTimeMs}
                                    onChange={(e) => update('waitTimeMs', Number(e.target.value))}
                                />
                            </label>

                            <label className="pw-field">
                                <span>Check Frequency</span>
                                <select
                                    value={form.checkFrequencyMinutes}
                                    onChange={(e) => update('checkFrequencyMinutes', Number(e.target.value))}
                                >
                                    {FREQUENCY_PRESETS.map((preset) => (
                                        <option key={preset.minutes} value={preset.minutes}>
                                            {preset.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <label className="pw-field pw-checkbox">
                            <input
                                type="checkbox"
                                checked={form.proxyEnabled}
                                onChange={(e) => update('proxyEnabled', e.target.checked)}
                            />
                            <span>Route this tracker through the proxy pool</span>
                        </label>
                    </>
                )}

                <div className="pw-form-actions">
                    {!isManual && (
                        <button type="button" onClick={handleTest} disabled={!canTest || testScrape.isPending}>
                            {testScrape.isPending ? 'Testing…' : 'Test tracker'}
                        </button>
                    )}
                    <button type="submit" className="pw-primary" disabled={!canSave || saving}>
                        {saving ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Save tracker'}
                    </button>
                </div>

                {mode === 'create' && !isManual && !testPassed && (
                    <p className="pw-hint">Run a successful test before saving to confirm your selectors work.</p>
                )}
                {saveError && <p className="pw-result-fail">{saveError}</p>}

                {!isManual && (
                    <ScrapeResultView
                        result={testResult}
                        loading={testScrape.isPending}
                        error={testScrape.error as Error | null}
                    />
                )}
            </form>
        </Modal>
    );
}
