'use client';

import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DeleteDocumentButtonProps {
    documentId: string;
    documentTitle: string;
    deleteAction: (id: string) => Promise<void>;
}

export function DeleteDocumentButton({ documentId, documentTitle, deleteAction }: DeleteDocumentButtonProps) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        try {
            setError(null);
            await deleteAction(documentId);
            router.refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to delete');
            throw e;
        }
    };

    return (
        <div className="relative">
            <ConfirmDialog
                trigger={
                    <button
                        type="button"
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                }
                title="Delete Document"
                description={`Are you sure you want to delete "${documentTitle}"? This action cannot be undone and will remove all associated embeddings.`}
                confirmText="Delete"
                onConfirm={handleDelete}
                variant="danger"
            />
            {error && (
                <div className="absolute top-full right-0 mt-1 p-2 bg-red-100 text-red-700 text-xs rounded-lg whitespace-nowrap">
                    {error}
                </div>
            )}
        </div>
    );
}
