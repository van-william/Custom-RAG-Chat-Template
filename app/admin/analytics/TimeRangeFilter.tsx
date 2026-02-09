'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';

const TIME_RANGES = [
    { value: '1', label: 'Today' },
    { value: '7', label: '7 Days' },
    { value: '14', label: '14 Days' },
    { value: '30', label: '30 Days' },
    { value: '90', label: '90 Days' },
];

export function TimeRangeFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentRange = searchParams.get('days') || '14';

    const handleChange = (days: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('days', days);
        router.push(`/admin/analytics?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <div className="flex bg-neutral-100 rounded-lg p-1">
                {TIME_RANGES.map((range) => (
                    <button
                        key={range.value}
                        onClick={() => handleChange(range.value)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${currentRange === range.value
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                    >
                        {range.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
