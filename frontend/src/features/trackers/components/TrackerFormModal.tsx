import { useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../../../components/Modal';
import { FREQUENCY_PRESETS } from '../../../lib/format';
import { useCreateTracker, useTestScrape, useUpdateTracker } from '../hooks';
import type { ScrapeResult, Tracker, TrackerRequest } from '../types';
import { ScrapeResultView } from './ScrapeResultView';

interface Props {
    mode: 'create' | 'edit';
    tracker?: Tracker;
    onClose: () => void;
}

interface FormState {
    productUrl: string;
    productName: string;
    priceSelector: string;
    availabilitySelector: string;
    waitTimeMs: number;
    checkFrequencyMinutes: number;
    proxyEnabled: boolean;
}

// Changing any of these invalidates a prior test result (selectors no longer proven).
const SCRAPE_AFFECTING: ReadonlyArray<keyof FormState> = [
    'productUrl',
    'priceSelector',
    'availabilitySelector',
    'waitTimeMs',
    'proxyEnabled',
];

export function TrackerFormModal({ mode, tracker, onClose }: Props) {
    const [form, setForm] = useState<FormState>(() => ({
        productUrl: tracker?.productUrl ?? '',
        productName: tracker?.productName ?? '',
        priceSelector: tracker?.priceSelector ?? '',
        availabilitySelector: tracker?.availabilitySelector ?? '',
        waitTimeMs: tracker?.waitTimeMs ?? 10_000,
        checkFrequencyMinutes: tracker?.checkFrequencyMinutes ?? 1440,
        proxyEnabled: tracker?.proxyEnabled ?? false,
    }));
    const [testResult, setTestResult] = useState<ScrapeResult | null>(null);

    const testScrape = useTestScrape();
    const createTracker = useCreateTracker();
    const updateTracker = useUpdateTracker();
    const [saveError, setSaveError] = useState<string | null>(null);

    const canTest = form.productUrl.trim() !== '' && form.priceSelector.trim() !== '';
    const formValid = canTest && form.productName.trim() !== '' && form.checkFrequencyMinutes > 0;
    const testPassed = testResult?.success === true;
    // Creating requires a passing test so broken selectors can't be saved; editing does not.
    const canSave = formValid && (mode === 'edit' || testPassed);
    const saving = createTracker.isPending || updateTracker.isPending;

    function update<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (SCRAPE_AFFECTING.includes(key)) {
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
            priceSelector: form.priceSelector.trim(),
            availabilitySelector: form.availabilitySelector.trim() || null,
            waitTimeMs: form.waitTimeMs,
            checkFrequencyMinutes: form.checkFrequencyMinutes,
            proxyEnabled: form.proxyEnabled,
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

                <label className="pw-field">
                    <span>Product Name *</span>
                    <input
                        type="text"
                        value={form.productName}
                        onChange={(e) => update('productName', e.target.value)}
                        placeholder="Auto-filled from the page title after a test"
                        required
                    />
                </label>

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

                <div className="pw-form-actions">
                    <button type="button" onClick={handleTest} disabled={!canTest || testScrape.isPending}>
                        {testScrape.isPending ? 'Testing…' : 'Test tracker'}
                    </button>
                    <button type="submit" className="pw-primary" disabled={!canSave || saving}>
                        {saving ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Save tracker'}
                    </button>
                </div>

                {mode === 'create' && !testPassed && (
                    <p className="pw-hint">Run a successful test before saving to confirm your selectors work.</p>
                )}
                {saveError && <p className="pw-result-fail">{saveError}</p>}

                <ScrapeResultView
                    result={testResult}
                    loading={testScrape.isPending}
                    error={testScrape.error as Error | null}
                />
            </form>
        </Modal>
    );
}
