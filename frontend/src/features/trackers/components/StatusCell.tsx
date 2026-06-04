import type { ICellRendererParams } from 'ag-grid-community';
import type { Status, Tracker } from '../types';

const COLORS: Record<Status, string> = {
    ACTIVE: 'rgb(26, 127, 55)',
    PAUSED: '#9a6700',
    FAILED: '#cf222e',
    BLOCKED: '#8250df',
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
