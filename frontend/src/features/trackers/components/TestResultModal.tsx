import { useEffect } from 'react';
import { Modal } from '../../../components/Modal';
import { useTestExisting } from '../hooks';
import type { Tracker } from '../types';
import { ScrapeResultView } from './ScrapeResultView';

interface Props {
    tracker: Tracker;
    onClose: () => void;
}

export function TestResultModal({ tracker, onClose }: Props) {
    const testExisting = useTestExisting();
    const { mutate } = testExisting;

    useEffect(() => {
        mutate(tracker.id);
    }, [mutate, tracker.id]);

    return (
        <Modal title={`Test scrape — ${tracker.productName}`} onClose={onClose} width={640}>
            <p className="pw-hint">Runs the saved selectors now without changing stored data.</p>
            <ScrapeResultView
                result={testExisting.data ?? null}
                loading={testExisting.isPending}
                error={testExisting.error as Error | null}
            />
        </Modal>
    );
}
