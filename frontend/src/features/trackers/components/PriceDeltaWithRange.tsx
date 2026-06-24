import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { PriceChange } from '../../../components/PriceChange';
import type { TimeRange } from '../../../lib/format';

export type { TimeRange };

export const RANGE_LABELS: Record<TimeRange, string> = {
    prev: 'Prev',
    '1d': '1D',
    '1w': '1W',
    '1m': '1M',
    '3m': '3M',
    '6m': '6M',
    '1y': '1Y',
    all: 'All',
};

/** Verbose phrasing for modal summary lines (the compact RANGE_LABELS sit on the buttons). */
export const SUMMARY_LABELS: Record<TimeRange, string> = {
    prev: 'Since last check',
    '1d': 'Past 24 hours',
    '1w': 'Past week',
    '1m': 'Past month',
    '3m': 'Past 3 months',
    '6m': 'Past 6 months',
    '1y': 'Past year',
    all: 'Since first tracked',
};

// Approximate rendered height of the 8-option menu; used to decide up/down placement.
const ESTIMATED_DROPDOWN_HEIGHT = 280;

export const RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
    { value: 'prev', label: 'Last check' },
    { value: '1d', label: '1 day' },
    { value: '1w', label: '1 week' },
    { value: '1m', label: '1 month' },
    { value: '3m', label: '3 months' },
    { value: '6m', label: '6 months' },
    { value: '1y', label: '1 year' },
    { value: 'all', label: 'Forever' },
];

interface Props {
    currentPrice: number | null | undefined;
    previousPrice: number | null | undefined;
    currency: string | null | undefined;
    range: TimeRange;
    onRangeChange: (range: TimeRange) => void;
    /** Point the trigger arrow up instead of down (e.g. the totals bar, where the menu opens upward). */
    arrowUp?: boolean;
}

export function PriceDeltaWithRange({ currentPrice, previousPrice, currency, range, onRangeChange, arrowUp = false }: Props) {
    const [open, setOpen] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    function handleOpen() {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Flip the menu above the trigger when there isn't room below (e.g. the
            // totals bar pinned to the bottom of the screen), so it isn't clipped.
            const spaceBelow = window.innerHeight - rect.bottom;
            const openUp = spaceBelow < ESTIMATED_DROPDOWN_HEIGHT && rect.top > spaceBelow;
            setDropdownStyle({
                position: 'fixed',
                left: rect.left,
                zIndex: 9999,
                ...(openUp
                    ? { bottom: window.innerHeight - rect.top + 4 }
                    : { top: rect.bottom + 4 }),
            });
        }
        setOpen((o) => !o);
    }

    useEffect(() => {
        if (!open) return;
        function onMouseDown(e: MouseEvent) {
            if (
                !triggerRef.current?.contains(e.target as Node) &&
                !dropdownRef.current?.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', onMouseDown);
        return () => document.removeEventListener('mousedown', onMouseDown);
    }, [open]);

    return (
        <div className="pw-delta-wrap">
            <button
                ref={triggerRef}
                className="pw-range-trigger"
                onClick={handleOpen}
                aria-label="Change time range"
                title="Change time range"
                type="button"
            >
                {arrowUp ? '▴' : '▾'}
            </button>
            <span className="pw-delta-label">{RANGE_LABELS[range]} Δ:</span>
            <PriceChange current={currentPrice} previous={previousPrice} currency={currency} />
            {open &&
                createPortal(
                    <div ref={dropdownRef} className="pw-range-dropdown" style={dropdownStyle} role="menu">
                        {RANGE_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                className={`pw-range-option ${range === opt.value ? 'pw-range-option-active' : ''}`}
                                onClick={() => {
                                    onRangeChange(opt.value);
                                    setOpen(false);
                                }}
                                role="menuitem"
                                type="button"
                            >
                                <span className="pw-range-check" aria-hidden="true">
                                    {range === opt.value ? '✓' : ' '}
                                </span>
                                {opt.label}
                            </button>
                        ))}
                    </div>,
                    document.body,
                )}
        </div>
    );
}
