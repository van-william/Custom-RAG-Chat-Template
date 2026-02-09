'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming standard utils exist

interface Item {
    id: string;
    label: string;
}

interface Props {
    items: Item[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function SearchableSelect({ items, value, onChange, placeholder = 'Select...', className, disabled }: Props) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const filteredItems = items.filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase())
    );

    const selectedItem = items.find(item => item.id === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (disabled) {
        return (
            <div className={cn("w-full px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-100 text-neutral-500", className)}>
                {selectedItem ? selectedItem.label : placeholder}
            </div>
        )
    }

    return (
        <div className={cn("relative", className)} ref={wrapperRef}>
            <div
                className={cn(
                    "w-full px-3 py-2 border border-neutral-300 rounded-lg flex items-center justify-between cursor-pointer bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all",
                    open && "ring-2 ring-indigo-500/20 border-indigo-500"
                )}
                onClick={() => setOpen(!open)}
            >
                <span className={cn("block truncate", !selectedItem && "text-neutral-500")}>
                    {selectedItem ? selectedItem.label : placeholder}
                </span>
                <ChevronsUpDown className="w-4 h-4 text-neutral-500 shrink-0 ml-2" />
            </div>

            {open && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-neutral-100 sticky top-0 bg-white">
                        <input
                            type="text"
                            className="w-full px-2 py-1.5 text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                        {filteredItems.length === 0 ? (
                            <div className="px-2 py-2 text-sm text-neutral-500 text-center">No results found.</div>
                        ) : (
                            filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={cn(
                                        "flex items-center justify-between px-2 py-2 text-sm rounded-md cursor-pointer hover:bg-neutral-100",
                                        value === item.id && "bg-indigo-50 text-indigo-700 font-medium"
                                    )}
                                    onClick={() => {
                                        onChange(item.id);
                                        setOpen(false);
                                        setSearch('');
                                    }}
                                >
                                    <span>{item.label}</span>
                                    {value === item.id && <Check className="w-4 h-4 ml-2 text-indigo-600" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
