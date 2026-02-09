'use client';

import { Trash } from 'lucide-react';
import { ConfirmDialog } from '../../../components/ui/confirm-dialog'; // Fixing import path if needed, or keeping existing
import { useRouter } from 'next/navigation';

interface DeleteListItemButtonProps {
    id: string;
    name: string;
    type: 'list_a' | 'list_b';
    deleteAction: (id: string) => Promise<void>;
}

export function DeleteListItemButton({ id, name, type, deleteAction }: DeleteListItemButtonProps) {
    const router = useRouter();

    const handleDelete = async () => {
        await deleteAction(id);
        router.refresh();
    };

    const typeLabel = type === 'list_a' ? 'item from List A' : 'item from List B';

    return (
        <ConfirmDialog
            trigger={
                <button
                    type="button"
                    className="text-neutral-400 hover:text-red-600 p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Trash size={16} />
                </button>
            }
            title={`Delete ${typeLabel}?`}
            description={`Are you sure you want to delete "${name}"? Any documents scoped to this ${typeLabel} may become orphaned.`}
            confirmText="Delete"
            onConfirm={handleDelete}
            variant="danger"
        />
    );
}
