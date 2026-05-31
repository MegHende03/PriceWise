import type { ReactNode } from 'react';

interface ModalProps {
    title: string;
    onClose: () => void;
    children: ReactNode;
    width?: number;
}

export function Modal({ title, onClose, children, width = 560 }: ModalProps) {
    return (
        <div className="pw-modal-overlay" onClick={onClose}>
            <div
                className="pw-modal"
                style={{ width }}
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="pw-modal-header">
                    <h2>{title}</h2>
                    <button className="pw-icon-btn" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>
                <div className="pw-modal-body">{children}</div>
            </div>
        </div>
    );
}
