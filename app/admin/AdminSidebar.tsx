'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, BarChart3, ScrollText, Database, Settings, ExternalLink, BookOpen, MessageSquareQuote } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

export function AdminSidebar() {
    return (
        <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
            <div className="p-6 border-b border-neutral-100">
                <h1 className="font-bold text-xl text-neutral-900 tracking-tight">Admin Panel</h1>
                <p className="text-xs text-neutral-500 mt-1">Control Center</p>
            </div>

            <nav className="flex-1 p-4 space-y-8 overflow-y-auto">
                {/* Overview */}
                <div>
                    <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Overview
                    </div>
                    <div className="space-y-1">
                        <NavItem href="/admin" exact icon={<LayoutDashboard size={18} />} label="Dashboard" />
                        <NavItem href="/admin/analytics" icon={<BarChart3 size={18} />} label="Analytics" />
                        <NavItem href="/admin/logs" icon={<ScrollText size={18} />} label="Chat Logs" />
                    </div>
                </div>

                {/* Management */}
                <div>
                    <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Tools
                    </div>
                    <div className="space-y-1">
                        <NavItem href="/admin/embeddings" icon={<Database size={18} />} label="Knowledge Base" />
                        <NavItem href="/admin/transcripts" icon={<MessageSquareQuote size={18} />} label="Transcripts" />
                        <NavItem href="/admin/lists" icon={<ScrollText size={18} />} label="Lists (A & B)" />
                        <NavItem href="/admin/prompts" icon={<Settings size={18} />} label="System Prompts" />
                    </div>
                </div>

                {/* Project */}
                <div>
                    <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Project
                    </div>
                    <div className="space-y-1">
                        <NavItem href="/admin/guide" icon={<BookOpen size={18} />} label="Guide" />
                    </div>
                </div>

                {/* External */}
                <div>
                    <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        App
                    </div>
                    <div className="space-y-1">
                        <NavItem href="/chat" icon={<ExternalLink size={18} />} label="Public View" />
                    </div>
                </div>
            </nav>

            <div className="p-4 border-t border-neutral-100">
                <div className="flex items-center gap-3 px-3 py-2">
                    <UserButton />
                    <span className="text-sm font-medium">Admin</span>
                </div>
            </div>
        </aside>
    );
}

function NavItem({
    href,
    icon,
    label,
    exact = false
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    exact?: boolean;
}) {
    const pathname = usePathname();
    const isActive = exact ? pathname === href : pathname?.startsWith(href);

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
        >
            {icon}
            {label}
        </Link>
    );
}
