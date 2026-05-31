import type { ICellRendererParams } from 'ag-grid-community';
import type { Tracker } from '../types';

export function ProductUrlCell(params: ICellRendererParams<Tracker>) {
    const url = params.value as string | undefined;
    if (!url) return null;
    return (
        <a className="pw-url" href={url} target="_blank" rel="noreferrer" title={url}>
            {url}
        </a>
    );
}
