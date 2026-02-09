'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { saveDocument } from '../../actions/documents';
import { SearchableSelect } from '@/components/ui/searchable-select';

type Props = {
    doc?: any;
    listA: any[];
    listB: any[];
};

export default function DocumentForm({ doc = {}, listA = [], listB = [] }: Props) {
    const isNew = !doc.id;
    const [scopeType, setScopeType] = useState(doc.scope_type || 'global');
    // We need to manage these IDs in state to pass them to hidden inputs or the select
    const [listAId, setListAId] = useState(doc.list_a_id || '');
    const [listBId, setListBId] = useState(doc.list_b_id || '');

    return (
        <form action={saveDocument} className="p-6 space-y-6">
            <input type="hidden" name="id" value={isNew ? '' : doc.id} />
            {/* Hidden inputs to carry the values for form submission */}
            <input type="hidden" name="list_a_id" value={listAId} />
            <input type="hidden" name="list_b_id" value={listBId} />

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Title</label>
                    <input
                        name="title"
                        defaultValue={doc.title}
                        required
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        placeholder="e.g., Guide to Category X"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Scope Type</label>
                    <select
                        name="scope_type"
                        value={scopeType}
                        onChange={(e) => setScopeType(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    >
                        <option value="global">Global</option>
                        <option value="list_a">List A (Category)</option>
                        <option value="list_b">List B (Item)</option>
                    </select>
                </div>

                {/* Conditional Fields based on Scope */}
                {scopeType === 'list_a' && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">List A Item</label>
                        <SearchableSelect
                            items={listA.map(item => ({ id: item.id, label: item.name }))}
                            value={listAId}
                            onChange={(val) => setListAId(val)}
                            placeholder="Select List A Item..."
                        />
                    </div>
                )}

                {scopeType === 'list_b' && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">List B Item</label>
                        <SearchableSelect
                            items={listB.map(item => ({ id: item.id, label: item.title }))}
                            value={listBId}
                            onChange={(val) => setListBId(val)}
                            placeholder="Select List B Item..."
                        />
                    </div>
                )}

                <input type="hidden" name="visibility" value="public" />

                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Status</label>
                    <select
                        name="status"
                        defaultValue={doc.status || 'active'}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                    </select>
                    <p className="text-xs text-neutral-500">Only <strong>Active</strong> documents are used by the AI Agent.</p>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Content</label>
                <textarea
                    name="content"
                    defaultValue={doc.content}
                    required
                    rows={15}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono text-sm resize-y min-h-[300px]"
                    placeholder="# Markdown content supported..."
                />
            </div>

            <div className="sticky bottom-0 bg-white flex justify-end py-4 border-t border-neutral-100 z-10 mt-auto">
                <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Save size={18} />
                    {isNew ? 'Create Document' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}

