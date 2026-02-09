import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Plus, List, Layers } from 'lucide-react';
import { addListA, deleteListA, addListB, deleteListB } from './actions';
import { DeleteListItemButton } from './DeleteListItemButton';

export default async function ListsPage() {
    const supabase = await createServerSupabaseClient();

    const { data: listA } = await supabase
        .from('list_a')
        .select('*')
        .order('name');

    const { data: listB } = await supabase
        .from('list_b')
        .select('*')
        .order('title');

    return (
        <div className="bg-neutral-50 min-h-full p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Manage Lists</h1>
                    <p className="text-neutral-500">
                        Configure your two primary lists here.
                    </p>
                </div>

                {/* Scoping Explanation */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5">
                        <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                            <Layers size={18} /> What are these lists for?
                        </h3>
                        <p className="text-sm text-indigo-800 mb-2">
                            These lists define the <strong>Scopes</strong> for your Knowledge Base. When you add a document
                            (like a transcript or fact), you can tag it as belonging to a specific item in List A or List B.
                        </p>
                        <p className="text-sm text-indigo-800">
                            <strong>Example:</strong> If List A is "Neighborhoods", you can upload a document and scope it
                            to "Downtown". The AI will prioritize that document when users ask about Downtown.
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
                        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <List size={18} /> Developer Guide: Renaming
                        </h3>
                        <div className="text-sm text-blue-800 space-y-2">
                            <p>
                                <strong>UI Labels:</strong> You can strictly rename the labels in this file
                                (`app/admin/lists/page.tsx`) to match your domain (e.g., change "List A" to "Categories").
                            </p>
                            <p>
                                <strong>Database:</strong> The underlying SQL tables are named <code>list_a</code> and <code>list_b</code>.
                                It is highly recommended to <strong>keep these table names as-is</strong> to maintain compatibility with the template's
                                retrieval logic (`match_kb_chunks`), but you can treat them as whatever you like in your application code.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* List A Section */}
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col h-[800px]">
                    <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers size={18} className="text-neutral-500" />
                            <h2 className="font-semibold text-neutral-900">List A (Categories)</h2>
                        </div>
                        <span className="text-xs font-medium text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded-full">
                            {listA?.length || 0}
                        </span>
                    </div>

                    <div className="p-4 border-b border-neutral-100">
                        <form action={addListA} className="flex gap-2">
                            <input
                                name="name"
                                placeholder="Add new item to List A..."
                                className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                required
                            />
                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-colors">
                                <Plus size={18} />
                            </button>
                        </form>
                    </div>

                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {listA?.map((item) => (
                            <div key={item.id} className="group flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all">
                                <span className="text-sm text-neutral-700 font-medium">{item.name}</span>
                                <DeleteListItemButton
                                    id={item.id}
                                    name={item.name}
                                    type="list_a"
                                    deleteAction={deleteListA}
                                />
                            </div>
                        ))}
                        {(!listA || listA.length === 0) && (
                            <p className="text-center text-neutral-400 text-sm py-8">No items in List A.</p>
                        )}
                    </div>
                </div>

                {/* List B Section */}
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col h-[800px]">
                    <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <List size={18} className="text-neutral-500" />
                            <h2 className="font-semibold text-neutral-900">List B (Items)</h2>
                        </div>
                        <span className="text-xs font-medium text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded-full">
                            {listB?.length || 0}
                        </span>
                    </div>

                    <div className="p-4 border-b border-neutral-100">
                        <form action={addListB} className="flex gap-2">
                            <input
                                name="title"
                                placeholder="Add new item to List B..."
                                className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                required
                            />
                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-colors">
                                <Plus size={18} />
                            </button>
                        </form>
                    </div>

                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {listB?.map((item) => (
                            <div key={item.id} className="group flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all">
                                <span className="text-sm text-neutral-700 font-medium">{item.title}</span>
                                <DeleteListItemButton
                                    id={item.id}
                                    name={item.title}
                                    type="list_b"
                                    deleteAction={deleteListB}
                                />
                            </div>
                        ))}
                        {(!listB || listB.length === 0) && (
                            <p className="text-center text-neutral-400 text-sm py-8">No items in List B.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
