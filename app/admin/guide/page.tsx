import { BookOpen, Database, MessageSquare, Bug, Settings, ShieldCheck, BarChart3 } from 'lucide-react';

export default function AdminGuidePage() {
    return (
        <div className="flex flex-col h-full bg-slate-50 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Admin Guide</h1>
                    <p className="text-slate-500 mt-1">Standard Operating Procedures & User Manual.</p>
                </div>

                <div className="space-y-12">
                    {/* Introduction */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <BookOpen size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900">Getting Started</h2>
                        </div>
                        <div className="prose prose-neutral max-w-none text-neutral-600">
                            <p>
                                Welcome to the Becker AI Admin Panel. This dashboard gives you full control over the AI agent's knowledge, behavior, and performance monitoring.
                                Use the sidebar on the left to navigate between different tools.
                            </p>
                        </div>
                    </section>

                    {/* Knowledge Base */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <Database size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900">Managing Knowledge (RAG)</h2>
                        </div>
                        <div className="prose prose-neutral max-w-none text-neutral-600 space-y-4">
                            <p>
                                The <strong>Knowledge Base</strong> is the brain of the AI. Data flows in two ways:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>
                                    <strong>Manual Creation:</strong> Create individual documents for specific topics (e.g., "Pet Policy", "Late Fees"). These are indexed immediately upon saving.
                                </li>
                                <li>
                                    <strong>Transcript Ingestion (Bulk):</strong> Helper tool to turn raw text (emails, chat logs) into knowledge.
                                    <div className="bg-neutral-50 p-2 mt-1 rounded text-sm font-mono text-neutral-600 border border-neutral-200">
                                        Raw Text &rarr; AI Extraction &rarr; Review Facts &rarr; Publish &rarr; Knowledge Base
                                    </div>
                                </li>
                                <li>
                                    <strong>Testing:</strong> Use "Broadcast Search" to verify the AI can find your new documents.
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* System Prompts */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                <Settings size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900">System Prompts</h2>
                        </div>
                        <div className="prose prose-neutral max-w-none text-neutral-600">
                            <p>
                                Control how the AI behaves by editing the <strong>System Prompt</strong>.
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li><strong>Persona:</strong> Define the tone and personality (e.g., "Helpful assistant", "Strict auditor").</li>
                                <li><strong>Constraints:</strong> Set rules for what the AI should NOT do (e.g., "Do not answer non-work questions").</li>
                                <li><strong>Format:</strong> Instruct the AI on how to format responses (e.g., "Always use bullet points").</li>
                            </ul>
                        </div>
                    </section>

                    {/* Analytics */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
                                <BarChart3 size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900">Monitoring Performance</h2>
                        </div>
                        <div className="prose prose-neutral max-w-none text-neutral-600">
                            <p>
                                Use the <strong>Analytics</strong> dashboard to track how well the AI is performing.
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li><strong>Content Gaps:</strong> See questions where the AI couldn't find good matches. Prioritize writing new content for these topics.</li>
                                <li><strong>Top Documents:</strong> Identify your most useful knowledge.</li>
                                <li><strong>Cold Documents:</strong> Find content that hasn't been used in a long time.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Feature Requests */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                                <Bug size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900">Reporting Issues</h2>
                        </div>
                        <div className="prose prose-neutral max-w-none text-neutral-600">
                            <p>
                                Found a bug or have an idea? Use the <strong>Requests</strong> page.
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li><strong>Bugs:</strong> Report functionality that is broken or behaving unexpectedly.</li>
                                <li><strong>Features:</strong> Suggest new tools or improvements to the admin panel.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Security */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <ShieldCheck size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900">Security & Access</h2>
                        </div>
                        <div className="prose prose-neutral max-w-none text-neutral-600">
                            <p>
                                <strong>Public Chat:</strong> The public chat route (<code>/chat</code>) is protected and requires authentication.
                                Unauthenticated users will be redirected to login.
                            </p>
                            <p className="mt-2">
                                <strong>Admin Access:</strong> Only users with the <code>admin</code> role in Clerk can access this panel.
                            </p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
