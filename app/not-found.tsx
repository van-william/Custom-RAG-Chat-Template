import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-neutral-900 text-white">
            <h2 className="text-4xl font-bold mb-4">404 - Not Found</h2>
            <p className="text-neutral-400 mb-8">Could not find requested resource</p>
            <Link
                href="/chat"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-full transition-colors font-medium"
            >
                Return to Chat
            </Link>
        </div>
    );
}
