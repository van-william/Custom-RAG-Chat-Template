import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Plus, Edit, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { deleteDocument } from '../actions/documents';
import EmbeddingTester from './EmbeddingTester';
import { DeleteDocumentButton } from './DeleteDocumentButton';
import type { KbDocument } from '@/lib/types';

interface PageProps {
    searchParams: Promise<{ updated?: string; title?: string; version?: string }>;
}

export default async function EmbeddingsPage({ searchParams }: PageProps) {
    const { updated, title, version } = await searchParams;

    const supabase = await createServerSupabaseClient();
    const { data: docs } = await supabase
        .from('kb_documents')
        .select('*')
        .order('updated_at', { ascending: false });

    return (
        <div className="flex flex-col h-full bg-neutral-50 p-8 overflow-y-auto">
            {/* Success Toast */}
            {updated && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <CheckCircle className="text-emerald-600 shrink-0" size={20} />
                    <div className="flex-1">
                        <p className="font-medium text-emerald-900">
                            Document updated successfully!
                        </p>
                        <p className="text-emerald-700 text-sm">
                            &quot;{String(title || '').replace(/[<>"'&]/g, '')}&quot; is now at version {version}
                        </p>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Knowledge Base</h2>
                    <p className="text-neutral-500">Manage documents and embeddings</p>
                </div>
                <Link
                    href="/admin/embeddings/new"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={16} />
                    New Document
                </Link>
            </div>

            <EmbeddingTester />

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-xs uppercase text-neutral-500 tracking-wider">Title</th>
                            <th className="px-6 py-4 font-semibold text-xs uppercase text-neutral-500 tracking-wider">Scope</th>
                            <th className="px-6 py-4 font-semibold text-xs uppercase text-neutral-500 tracking-wider">Version</th>
                            <th className="px-6 py-4 font-semibold text-xs uppercase text-neutral-500 tracking-wider">Updated</th>
                            <th className="px-6 py-4 font-semibold text-xs uppercase text-neutral-500 tracking-wider">Status</th>
                            <th className="px-6 py-4 font-semibold text-xs uppercase text-neutral-500 tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {docs?.map((doc) => (
                            <tr key={doc.id} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-neutral-900">{doc.title}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                        {doc.scope_type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-neutral-500 font-mono text-xs">v{doc.version}</td>
                                <td className="px-6 py-4 text-neutral-500 text-sm">
                                    {new Date(doc.updated_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                        {doc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/admin/embeddings/${doc.id}`}
                                            className="p-2 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        >
                                            <Edit size={16} />
                                        </Link>
                                        <DeleteDocumentButton
                                            documentId={doc.id}
                                            documentTitle={doc.title}
                                            deleteAction={deleteDocument}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {(!docs || docs.length === 0) && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-neutral-400">
                                    No documents found. Start by creating one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
