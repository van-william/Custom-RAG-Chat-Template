import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ArrowLeft, CheckCircle, ExternalLink, Plus } from 'lucide-react';
import Link from 'next/link';
import DocumentForm from './document-form';

export default async function EditDocumentPage({ params, searchParams }: { params: any, searchParams: any }) {
    const { id } = await params;
    const { success } = await searchParams;
    const isNew = id === 'new';

    let doc: any = {};

    const supabase = await createServerSupabaseClient();
    if (!isNew) {
        const { data } = await supabase
            .from('kb_documents')
            .select('*')
            .eq('id', id)
            .single();
        doc = data || {};
    }

    // Fetch List A (Categories/Neighborhoods)
    const { data: listA } = await supabase
        .from('list_a')
        .select('id, name')
        .order('name');

    // Fetch List B (Items/Listings) (limit 100 recent for MVP)
    const { data: listB } = await supabase
        .from('list_b')
        .select('id, title')
        .order('created_at', { ascending: false })
        .limit(100);

    return (
        <div className="bg-neutral-50 min-h-full p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/admin/embeddings"
                        className="p-2 -ml-2 text-neutral-500 hover:text-neutral-900 hover:bg-white rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">
                            {isNew ? 'New Document' : 'Edit Document'}
                        </h1>
                        <p className="text-neutral-500">
                            {isNew ? 'Create a new knowledge base entry' : `Editing ${doc.title}`}
                        </p>
                    </div>
                </div>

                {success && (
                    <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                        <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-emerald-900">Document Created & Embedded Successfully!</h3>
                            <p className="text-emerald-700 text-sm mt-1 mb-3">
                                The content is now live in the knowledge base and ready for retrieval.
                            </p>
                            <div className="flex gap-3">
                                <Link
                                    href="/admin/embeddings/new"
                                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 font-medium"
                                >
                                    <Plus size={14} /> Create Another
                                </Link>
                                <Link
                                    href="/admin/embeddings"
                                    className="text-xs bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
                                >
                                    Return to List
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                    <DocumentForm
                        doc={doc}
                        listA={listA || []}
                        listB={listB || []}
                    />
                </div>
            </div>
        </div>
    );
}
