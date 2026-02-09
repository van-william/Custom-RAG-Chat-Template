'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateFactStatus, updateFactContent, type ExtractedFact } from '../actions';
import { Check, X, MessageSquare, Lightbulb, Home, MapPin, User, Pencil, Save } from 'lucide-react';

const factTypeConfig = {
    qa: { icon: MessageSquare, label: 'Q&A', color: 'text-blue-600', bg: 'bg-blue-50' },
    fact: { icon: Lightbulb, label: 'Fact', color: 'text-amber-600', bg: 'bg-amber-50' },
    property_detail: { icon: Home, label: 'Property', color: 'text-green-600', bg: 'bg-green-50' },
    neighborhood_info: { icon: MapPin, label: 'Neighborhood', color: 'text-purple-600', bg: 'bg-purple-50' },
    personal_insight: { icon: User, label: 'Personal', color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

interface FactCardProps {
    fact: ExtractedFact;
}

export function FactCard({ fact }: FactCardProps) {
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(fact.title || '');
    const [editedContent, setEditedContent] = useState(fact.content);
    const [editedScope, setEditedScope] = useState(fact.suggested_scope);

    const config = factTypeConfig[fact.fact_type as keyof typeof factTypeConfig] || factTypeConfig.fact;
    const Icon = config.icon;

    const handleAction = async (action: 'approve' | 'reject') => {
        setIsUpdating(true);
        try {
            await updateFactStatus(fact.id, action);
            router.refresh();
        } catch (err) {
            console.error('Failed to update fact:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveEdit = async () => {
        setIsUpdating(true);
        try {
            await updateFactContent(fact.id, editedTitle, editedContent, editedScope);
            setIsEditing(false);
            router.refresh();
        } catch (err) {
            console.error('Failed to save edit:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelEdit = () => {
        setEditedTitle(fact.title || '');
        setEditedContent(fact.content);
        setEditedScope(fact.suggested_scope);
        setIsEditing(false);
    };

    const isActioned = fact.is_approved || fact.is_rejected;
    const canEdit = !fact.published_doc_id;

    return (
        <div className={`bg-white border rounded-xl p-4 ${fact.is_approved ? 'border-green-300 bg-green-50/30' :
                fact.is_rejected ? 'border-neutral-200 opacity-50' :
                    'border-neutral-200'
            }`}>
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${config.bg}`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        /* Edit Mode */
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    className="w-full px-3 py-1.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter title..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">Content</label>
                                <textarea
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-1.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">Scope</label>
                                <select
                                    value={editedScope}
                                    onChange={(e) => setEditedScope(e.target.value)}
                                    className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="global">Global</option>
                                    <option value="neighborhood">Neighborhood</option>
                                    <option value="listing">Listing</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={isUpdating || !editedContent.trim()}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    Save
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={isUpdating}
                                    className="px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* View Mode */
                        <>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                                    {config.label}
                                </span>
                                {fact.title && (
                                    <span className="text-sm font-medium text-neutral-700">{fact.title}</span>
                                )}
                                {fact.published_doc_id && (
                                    <span className="text-xs text-green-600">✓ Published</span>
                                )}
                            </div>
                            <p className="text-sm text-neutral-600 whitespace-pre-wrap">{fact.content}</p>
                            <p className="text-xs text-neutral-400 mt-2">
                                Scope: {fact.suggested_scope}
                            </p>
                        </>
                    )}
                </div>

                {!isEditing && (
                    <div className="flex items-center gap-1">
                        {canEdit && (
                            <button
                                onClick={() => setIsEditing(true)}
                                disabled={isUpdating}
                                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}

                        {!isActioned && !fact.published_doc_id && (
                            <>
                                <button
                                    onClick={() => handleAction('approve')}
                                    disabled={isUpdating}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Approve"
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleAction('reject')}
                                    disabled={isUpdating}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Reject"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </>
                        )}

                        {fact.is_approved && !fact.published_doc_id && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                Approved
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
