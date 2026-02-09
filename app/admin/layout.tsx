import { AdminSidebar } from './AdminSidebar';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-neutral-50 text-neutral-900">
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <ErrorBoundary>
                    {children}
                </ErrorBoundary>
            </main>
        </div>
    );
}



