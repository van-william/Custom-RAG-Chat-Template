import { createServerSupabaseClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Bot, Database, ArrowRight, Activity, Users, Clock, MessageSquare, FileText, BarChart3, UserCheck, UserPlus, TrendingUp, BookOpen, Bug } from 'lucide-react';
import { clerkClient } from '@clerk/nextjs/server';
import SystemHealthList from './SystemHealthList';

// Helper function to format relative time
function formatRelativeTime(date: Date | null): string {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export default async function AdminPage() {
    console.log('AdminPage: Rendering started...');
    const supabase = await createServerSupabaseClient();

    // Quick Stats
    const { count: docCount } = await supabase.from('kb_documents').select('*', { count: 'exact', head: true });

    const { count: promptCount } = await supabase.from('prompt_versions').select('*', { count: 'exact', head: true }).eq('is_active', true);

    // Clerk Stats
    const client = await clerkClient();
    const { totalCount: userCount, data: allUsers } = await client.users.getUserList({
        orderBy: '-last_sign_in_at',
        limit: 100, // Get more users for metrics
    });

    // Calculate user metrics
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const activeToday = allUsers.filter(u => u.lastSignInAt && new Date(u.lastSignInAt) > oneDayAgo).length;
    const newThisWeek = allUsers.filter(u => u.createdAt && new Date(u.createdAt) > oneWeekAgo).length;

    // Get chat message counts per user from Supabase
    const { data: chatCounts } = await supabase
        .from('chat_messages')
        .select('user_id')
        .eq('role', 'user')
        .neq('user_id', 'anonymous');

    // Aggregate chat counts by user
    const userChatCounts: Record<string, number> = {};
    chatCounts?.forEach(msg => {
        userChatCounts[msg.user_id] = (userChatCounts[msg.user_id] || 0) + 1;
    });

    const usersWithChats = Object.keys(userChatCounts).length;

    // Enrich user data with chat counts
    const enrichedUsers = allUsers
        .slice(0, 10) // Show top 10 in the table
        .map(u => ({
            id: u.id,
            name: u.firstName || u.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User',
            email: u.emailAddresses[0]?.emailAddress || '',
            imageUrl: u.imageUrl,
            lastSignInAt: u.lastSignInAt ? new Date(u.lastSignInAt) : null,
            createdAt: u.createdAt ? new Date(u.createdAt) : null,
            chatCount: userChatCounts[u.id] || 0,
        }));

    return (
        <div className="flex flex-col h-full bg-neutral-50 p-8 overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
                <p className="text-neutral-500 mt-1">Manage your AI agent and knowledge base from one place.</p>
            </div>

            {/* Template Developer Tips */}
            <div className="bg-gradient-to-r from-violet-100 to-indigo-100 border border-indigo-200 rounded-xl p-5 mb-8">
                <h3 className="flex items-center gap-2 font-bold text-indigo-900 mb-2">
                    <span className="text-xl">🚀</span> Getting Started with the Template
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-indigo-800">
                    <li><strong>Define your Data:</strong> Go to <Link href="/admin/lists" className="underline hover:text-indigo-900">Manage Lists</Link> to rename "List A" and "List B" to your domain's needs.</li>
                    <li><strong>Add Knowledge:</strong> Upload transcripts or manually create documents in <Link href="/admin/embeddings" className="underline hover:text-indigo-900">Knowledge Base</Link>.</li>
                    <li><strong>Customize AI:</strong> Edit the <Link href="/admin/prompts" className="underline hover:text-indigo-900">System Prompts</Link> to change the agent's personality.</li>
                    <li><strong>Branding:</strong> Update the landing page in <code className="bg-white/50 px-1 rounded">app/page.tsx</code>.</li>
                </ul>
            </div>

            {/* Template Developer Tips */}
            <div className="bg-gradient-to-r from-violet-100 to-indigo-100 border border-indigo-200 rounded-xl p-5 mb-8">
                <h3 className="flex items-center gap-2 font-bold text-indigo-900 mb-2">
                    <span className="text-xl">🚀</span> Getting Started with the Template
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-indigo-800">
                    <li><strong>Define your Data:</strong> Go to <Link href="/admin/lists" className="underline hover:text-indigo-900">Manage Lists</Link> to rename "List A" and "List B" to your domain's needs.</li>
                    <li><strong>Add Knowledge:</strong> Upload transcripts or manually create documents in <Link href="/admin/embeddings" className="underline hover:text-indigo-900">Knowledge Base</Link>.</li>
                    <li><strong>Customize AI:</strong> Edit the <Link href="/admin/prompts" className="underline hover:text-indigo-900">System Prompts</Link> to change the agent's personality.</li>
                    <li><strong>Branding:</strong> Update the landing page in <code className="bg-white/50 px-1 rounded">app/page.tsx</code>.</li>
                </ul>
            </div>

            {/* RAG & Auth Status Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700 shrink-0">
                    <Database size={18} />
                </div>
                <div>
                    <h3 className="font-semibold text-yellow-900 text-sm">RAG & Authentication Update</h3>
                    <p className="text-yellow-800 text-sm mt-1">
                        Authentication is now enforced on the public chat to ensuring valid embeddings retrieval.
                        Source citations have been hidden from the chat context to provide a more natural conversation flow.
                    </p>
                </div>
            </div>

            {/* User Metrics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <MetricCard
                    title="Total Users"
                    value={userCount || 0}
                    icon={<Users className="text-indigo-600" size={20} />}
                    color="indigo"
                />
                <MetricCard
                    title="Active Today"
                    value={activeToday}
                    icon={<UserCheck className="text-green-600" size={20} />}
                    color="green"
                />
                <MetricCard
                    title="New This Week"
                    value={newThisWeek}
                    icon={<UserPlus className="text-blue-600" size={20} />}
                    color="blue"
                />
                <MetricCard
                    title="Users with Chats"
                    value={usersWithChats}
                    icon={<MessageSquare className="text-purple-600" size={20} />}
                    color="purple"
                />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
                {/* Chat Agent Card */}
                <Link href="/admin/chat" className="group rounded-2xl bg-white border border-neutral-200 p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                            <Bot size={24} />
                        </div>
                        <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-full">
                            Active
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">AI Agent Chat</h2>
                    <p className="text-neutral-500 mb-2">
                        Chat with the AI agent to make changes conversationally.
                    </p>
                    <p className="text-xs text-neutral-400 mb-4">Propose prompt updates, ask questions, or trigger re-embeddings via chat.</p>
                    <div className="flex items-center text-indigo-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                        Launch Chat <ArrowRight size={16} className="ml-1" />
                    </div>
                </Link>

                {/* Knowledge Base Card */}
                <Link href="/admin/embeddings" className="group rounded-2xl bg-white border border-neutral-200 p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <Database size={24} />
                        </div>
                        <span className="bg-neutral-100 text-neutral-600 text-xs font-semibold px-2 py-1 rounded-full">
                            {docCount} Docs
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">Knowledge Base</h2>
                    <p className="text-neutral-500 mb-2">
                        Add, edit, or re-embed documents. The AI retrieves from here.
                    </p>
                    <p className="text-xs text-neutral-400 mb-4">Manage List A/B data and global policies.</p>
                    <div className="flex items-center text-emerald-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                        Manage Data <ArrowRight size={16} className="ml-1" />
                    </div>
                </Link>

                {/* System Prompts Card */}
                <Link href="/admin/prompts" className="group rounded-2xl bg-white border border-neutral-200 p-6 shadow-sm hover:shadow-md hover:border-purple-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                            <FileText size={24} />
                        </div>
                        <span className="bg-purple-50 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                            {promptCount} Active
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">System Prompts</h2>
                    <p className="text-neutral-500 mb-2">
                        Define the AI's personality and behavior rules.
                    </p>
                    <p className="text-xs text-neutral-400 mb-4">Edit the system prompts for both the public chat and admin agent.</p>
                    <div className="flex items-center text-purple-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                        Edit Prompts <ArrowRight size={16} className="ml-1" />
                    </div>
                </Link>

                {/* Logs Card */}
                <Link href="/admin/logs" className="group rounded-2xl bg-white border border-neutral-200 p-6 shadow-sm hover:shadow-md hover:border-orange-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                            <MessageSquare size={24} />
                        </div>
                        <span className="bg-orange-50 text-orange-700 text-xs font-semibold px-2 py-1 rounded-full">
                            Spy Glass
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">Live Chat Logs</h2>
                    <p className="text-neutral-500 mb-2">
                        See real-time user questions. Use this to find knowledge gaps.
                    </p>
                    <p className="text-xs text-neutral-400 mb-4">Analyze what users are asking to improve the knowledge base.</p>
                    <div className="flex items-center text-orange-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                        View History <ArrowRight size={16} className="ml-1" />
                    </div>
                </Link>

                {/* Insights Card */}
                <Link href="/admin/analytics" className="group rounded-2xl bg-white border border-neutral-200 p-6 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
                            <BarChart3 size={24} />
                        </div>
                        <span className="bg-cyan-50 text-cyan-700 text-xs font-semibold px-2 py-1 rounded-full">
                            Analytics
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">Usage Insights</h2>
                    <p className="text-neutral-500 mb-2">
                        See how users are interacting with the AI.
                    </p>
                    <p className="text-xs text-neutral-400 mb-4">Track message counts, top users, and chat activity over time.</p>
                    <div className="flex items-center text-cyan-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                        View Analytics <ArrowRight size={16} className="ml-1" />
                    </div>
                </Link>

                {/* Admin Guide */}
                <Link href="/admin/guide" className="group rounded-2xl bg-white border border-neutral-200 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <BookOpen size={24} />
                        </div>
                        <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                            Documentation
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">Admin Guide</h2>
                    <p className="text-neutral-500 mb-2">
                        Instructions and SOPs for admins.
                    </p>
                    <p className="text-xs text-neutral-400 mb-4">Learn how to manage data, prompts, and users effectively.</p>
                    <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                        Read Guide <ArrowRight size={16} className="ml-1" />
                    </div>
                </Link>
            </div>

            {/* System Health */}
            <div className="bg-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <Activity className="text-indigo-300" />
                        <div>
                            <h3 className="font-semibold text-lg">System Status</h3>
                            <p className="text-indigo-200 text-sm mt-1">
                                Real-time operational status.
                            </p>
                        </div>
                    </div>

                    <SystemHealthList />
                </div>
            </div>

            {/* User Activity Table */}
            <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between">
                    <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                        <TrendingUp className="text-indigo-600" size={18} />
                        User Activity
                    </h3>
                    <span className="text-xs font-medium bg-indigo-100 px-2 py-1 rounded-full text-indigo-700">
                        {userCount} Total Users
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase tracking-wide">
                            <tr>
                                <th className="px-4 py-3 text-left">User</th>
                                <th className="px-4 py-3 text-left">Last Login</th>
                                <th className="px-4 py-3 text-left">Joined</th>
                                <th className="px-4 py-3 text-right"># Chats</th>
                                <th className="px-4 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {enrichedUsers.map(user => {
                                const isActive = user.lastSignInAt && user.lastSignInAt > oneDayAgo;
                                return (
                                    <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-full bg-neutral-100" />
                                                <div>
                                                    <div className="font-medium text-neutral-900">{user.name}</div>
                                                    <div className="text-xs text-neutral-400">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-600">
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} className="text-neutral-400" />
                                                {formatRelativeTime(user.lastSignInAt)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-500">
                                            {user.createdAt?.toLocaleDateString() || 'Unknown'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`font-semibold ${user.chatCount > 0 ? 'text-indigo-600' : 'text-neutral-400'}`}>
                                                {user.chatCount}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-neutral-400'}`}></span>
                                                {isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {enrichedUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function MetricCard({
    title,
    value,
    icon,
    color
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                    {title}
                </span>
            </div>
            <div className="text-2xl font-bold text-neutral-900">
                {value.toLocaleString()}
            </div>
        </div>
    );
}

