import type { ICellRendererParams } from 'ag-grid-community';
import type { Status, Tracker } from '../types';

const COLORS: Record<Status, string> = {
    ACTIVE: 'rgb(40, 180, 110)',
    PAUSED: 'rgb(180, 120, 0)',
    FAILED: 'rgb(210, 50, 70)',
    BLOCKED: 'rgb(130, 80, 220)',
};

const MANUAL_COLOR = 'rgb(70, 110, 200)';

export function StatusCell(params: ICellRendererParams<Tracker>) {
    const status = params.value as Status | undefined;
    if (!status) return null;
    // Manual trackers aren't scheduled, so the scrape lifecycle status doesn't apply —
    // show a "MANUAL" badge instead, which reads more meaningfully in the grid.
    if (params.data?.trackingMode === 'MANUAL') {
        return (
            <div className="pw-badge pw-badge--full" style={{ backgroundColor: MANUAL_COLOR }} title="Price entered manually">
                MANUAL
            </div>
        );
    }
    const title = params.data?.lastError ?? undefined;
    return (
        <div className="pw-badge pw-badge--full" style={{ backgroundColor: COLORS[status] ?? '#57606a' }} title={title}>
            {status}
        </div>
    );
}
