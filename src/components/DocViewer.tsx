import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
    Calendar,
    Loader2,
    BookOpen,
    ArrowLeft,
    Clock,
    User
} from 'lucide-react';

interface Doc {
    id: string;
    title: string;
    content: string;
    category: string;
    created_at: string;
}

interface DocViewerProps {
    docId: string;
}

const DocViewer: React.FC<DocViewerProps> = ({ docId }) => {
    const [doc, setDoc] = useState<Doc | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDoc();
    }, [docId]);

    const fetchDoc = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('docs')
                .select('*')
                .eq('id', docId)
                .single();

            if (error) throw error;
            setDoc(data);
        } catch (err: any) {
            console.error('Error fetching doc:', err.message);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = (content: string) => {
        // Simple markdown parsing logic similar to DocsEditor preview
        const blocks = content.split('\n\n');
        return blocks.map((block, index) => {
            if (block.startsWith('## ')) {
                return (
                    <h3 key={index} className="text-xl font-semibold text-white mt-8 mb-4 border-l-4 border-amber-400 pl-4 py-1">
                        {block.replace('## ', '')}
                    </h3>
                );
            }
            if (block.startsWith('```')) {
                const code = block.replace(/```/g, '').trim();
                return (
                    <pre key={index} className="p-6 bg-black/50 rounded-2xl border border-white/5 font-mono text-sm overflow-x-auto my-6 shadow-inner ring-1 ring-white/5">
                        <code className="text-zinc-300">{code}</code>
                    </pre>
                );
            }
            return (
                <p key={index} className="text-zinc-400 leading-relaxed mb-4 text-lg">
                    {block}
                </p>
            );
        });
    };

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-zinc-500 gap-4">
                <Loader2 className="animate-spin text-amber-400" size={48} />
                <p className="text-lg font-medium animate-pulse">Loading documentation...</p>
            </div>
        );
    }

    if (error || !doc) {
        return (
            <div className="h-[60vh] rounded-3xl bg-[#121214] border border-dashed border-rose-500/20 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4">
                    <ArrowLeft size={30} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Document Not Found</h3>
                <p className="text-zinc-500 max-w-xs">{error || "The requested document could not be found."}</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header / Meta */}
            <header className="mb-12 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                        {doc.category}
                    </div>
                </div>

                <h1 className="text-5xl font-black text-white tracking-tight leading-tight">
                    {doc.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-zinc-500 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-amber-400/60" />
                        <span className="text-sm font-medium">
                            {new Date(doc.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-amber-400/60" />
                        <span className="text-sm font-medium">5 min read</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <User size={16} className="text-amber-400/60" />
                        <span className="text-sm font-medium">Admin</span>
                    </div>
                </div>
            </header>

            {/* Content Section */}
            <article className="p-8 md:p-12 rounded-4xl bg-[#121214]/50 border border-white/5 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
                <div className="relative z-10">
                    {renderContent(doc.content)}
                </div>
            </article>

            {/* Footer Navigation */}
            <footer className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4 text-zinc-500">
                    <BookOpen size={20} />
                    <span className="text-sm font-medium">Documentation Repository</span>
                </div>
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5 group"
                >
                    <ArrowLeft size={20} className="rotate-90 group-hover:-translate-y-1 transition-transform" />
                </button>
            </footer>
        </div>
    );
};

export default DocViewer;
