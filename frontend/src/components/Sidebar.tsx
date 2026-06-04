import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { TrackerList } from '../features/trackers/types';

interface SidebarProps {
    lists: TrackerList[];
    activeListId: number | null;
    isOpen: boolean;
    onToggle: () => void;
    onAddList: (name: string) => void;
    onDeleteList: (id: number) => void;
    onSelectList: (id: number | null) => void;
}

export function Sidebar({ lists, activeListId, isOpen, onToggle, onAddList, onDeleteList, onSelectList }: SidebarProps) {
    const [adding, setAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (adding && inputRef.current) {
            inputRef.current.focus();
        }
    }, [adding]);

    function startAdding() {
        setNewName('');
        setAdding(true);
    }

    function confirmAdd() {
        const trimmed = newName.trim();
        if (trimmed) {
            onAddList(trimmed);
        }
        setAdding(false);
        setNewName('');
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') confirmAdd();
        if (e.key === 'Escape') {
            setAdding(false);
            setNewName('');
        }
    }

    return (
        <aside className={`pw-sidebar${isOpen ? '' : ' pw-sidebar--collapsed'}`}>
            <div className="pw-sidebar-header">
                <button
                    className="pw-sidebar-toggle"
                    onClick={onToggle}
                    title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    {isOpen ? '◀' : '▶'}
                </button>
                {isOpen && <span className="pw-sidebar-title">Lists</span>}
            </div>

            <nav className="pw-sidebar-nav">
                <button
                    className={`pw-sidebar-item${activeListId === null ? ' pw-sidebar-item--active' : ''}`}
                    onClick={() => onSelectList(null)}
                    title="All Trackers"
                >
                    <span className="pw-sidebar-icon">≡</span>
                    {isOpen && <span className="pw-sidebar-label">All Trackers</span>}
                </button>

                {lists.map((list) => (
                    <div
                        key={list.id}
                        className={`pw-sidebar-item${activeListId === list.id ? ' pw-sidebar-item--active' : ''}`}
                        onClick={() => onSelectList(list.id)}
                        title={list.name}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onSelectList(list.id)}
                    >
                        <span className="pw-sidebar-icon">▣</span>
                        {isOpen && <span className="pw-sidebar-label">{list.name}</span>}
                        {isOpen && (
                            <button
                                className="pw-sidebar-delete"
                                title={`Delete "${list.name}"`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Delete list "${list.name}"? Trackers in it will become unassigned.`)) {
                                        onDeleteList(list.id);
                                    }
                                }}
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}
            </nav>

            <div className="pw-sidebar-footer">
                {isOpen ? (
                    adding ? (
                        <input
                            ref={inputRef}
                            className="pw-sidebar-new-input"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={confirmAdd}
                            placeholder="List name…"
                            maxLength={40}
                        />
                    ) : (
                        <button className="pw-sidebar-add-btn" onClick={startAdding}>
                            + New list
                        </button>
                    )
                ) : (
                    <button
                        className="pw-sidebar-item pw-sidebar-add-icon"
                        onClick={onToggle}
                        title="Expand to add a new list"
                    >
                        <span className="pw-sidebar-icon">+</span>
                    </button>
                )}
            </div>
        </aside>
    );
}
