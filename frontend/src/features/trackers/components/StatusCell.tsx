import type { ICellRendererParams } from 'ag-grid-community';
import type { Status, Tracker } from '../types';

const COLORS: Record<Status, string> = {
    ACTIVE: 'rgb(40, 180, 110)',
    PAUSED: 'rgb(180, 120, 0)',
    FAILED: 'rgb(210, 50, 70)',
    BLOCKED: 'rgb(130, 80, 220)',
};

export function StatusCell(params: ICellRendererParams<Tracker>) {
    const status = params.value as Status | undefined;
    if (!status) return null;
    const title = params.data?.lastError ?? undefined;
    return (
        <span className="pw-badge" style={{ backgroundColor: COLORS[status] ?? '#57606a' }} title={title}>
            {status}
        </span>
    );
}
