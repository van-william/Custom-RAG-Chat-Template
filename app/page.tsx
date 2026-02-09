import Link from 'next/link';
import { ArrowRight, MessageSquare, Shield, Database } from 'lucide-react';

/**
 * 🛠️ Developer Note:
 * This is the main landing page of the application.
 * You should update the branding, copy, and features below to match your specific use case.
 * The navigation bar and footer are also defined in this file.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">AI</div>
            RAG Template
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/chat" className="bg-white text-black px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors">
              Launch Chat
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-neutral-900/0 to-neutral-900/0" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Live Demo
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            Your Custom AI <br />
            Knowledge Agent.
          </h1>

          <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            A powerful RAG chat template leveraging Supabase and Vercel AI SDK.
            Connect your data and start asking questions instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/chat"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full font-medium transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
            >
              Start Chatting <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-24 px-6 border-t border-white/5 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <Card
            icon={<MessageSquare className="text-indigo-400" />}
            title="Natural Conversation"
            description="Engage users with a natural, conversational interface powered by advanced LLMs."
          />
          <Card
            icon={<Database className="text-purple-400" />}
            title="Grounded Data"
            description="Eliminate hallucinations. Every answer is backed by your curated knowledge base."
          />
          <Card
            icon={<Shield className="text-emerald-400" />}
            title="Admin Controls"
            description="Manage your knowledge base, system prompts, and view analytics from a dedicated admin panel."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-sm text-neutral-600 border-t border-white/5 flex flex-col items-center gap-4">
        <p>&copy; {new Date().getFullYear()} RAG Template. Built with Next.js.</p>
        <Link href="/admin" className="text-neutral-700 hover:text-neutral-500 transition-colors text-xs">
          Admin Portal
        </Link>
      </footer>
    </div>
  );
}

function Card({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-neutral-400 leading-relaxed">{description}</p>
    </div>
  );
}
