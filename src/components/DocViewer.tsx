import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
    BookOpen,
    ArrowLeft,
    Share2,
    Bookmark,
    MoreHorizontal
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
    onBack?: () => void;
}

const DocViewer: React.FC<DocViewerProps> = ({ docId, onBack }) => {
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

    if (isLoading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center text-slate-500 gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-[#00d1ff]/10 border-t-[#00d1ff] rounded-full animate-spin"></div>
                    <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#00d1ff]" size={24} />
                </div>
                <p className="text-lg font-medium tracking-wide animate-pulse">Opening story...</p>
            </div>
        );
    }

    if (error || !doc) {
        return (
            <div className="h-[60vh] rounded-4xl bg-[#0c1524] border border-dashed border-rose-500/20 flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6">
                    <ArrowLeft size={36} />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Story Not Found</h3>
                <p className="text-slate-400 max-w-xs mb-8">{error || "The requested document could not be found."}</p>
                <button 
                    onClick={onBack}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-white font-bold transition-all border border-white/5"
                >
                    Return to Library
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32">
            {/* Minimalist Top Nav */}
            <div className="flex items-center justify-between mb-16">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back</span>
                </button>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-zinc-500 hover:text-white transition-colors"><Share2 size={18} /></button>
                    <button className="p-2 text-zinc-500 hover:text-white transition-colors"><Bookmark size={18} /></button>
                    <button className="p-2 text-zinc-500 hover:text-white transition-colors"><MoreHorizontal size={18} /></button>
                </div>
            </div>

            {/* Content Header */}
            <header className="mb-12 space-y-8">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00d1ff]"></div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-[#00d1ff]/80">
                        {doc.category}
                    </span>
                </div>

                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
                    {doc.title}
                </h1>

                <div className="flex items-center gap-4 pt-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-slate-800 to-slate-900 border border-[#1e293b] flex items-center justify-center text-[#00d1ff] font-black text-xl shadow-xl">
                        A
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white tracking-wide">Admin Editor</span>
                            <span className="text-slate-600">·</span>
                            <button className="text-xs font-bold text-[#00d1ff] hover:text-[#00e5ff]">Follow</button>
                        </div>
                        <div className="flex items-center gap-3 text-zinc-500 mt-0.5">
                            <span className="text-xs font-medium">5 min read</span>
                            <span className="text-zinc-700">·</span>
                            <span className="text-xs font-medium">
                                {new Date(doc.created_at).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Article Body */}
            <article className="prose prose-invert prose-lg prose-cyan max-w-none">
                <div 
                    dangerouslySetInnerHTML={{ __html: doc.content }} 
                    className="text-zinc-300 leading-[1.8] font-serif ql-viewer" 
                />
            </article>

            <style>{`
                .ql-viewer h1,
                .ql-viewer h2 {
                    color: white !important;
                    margin-top: 2.5rem !important;
                    margin-bottom: 1rem !important;
                    font-weight: 800 !important;
                    font-size: 2.25rem !important;
                    letter-spacing: -0.02em !important;
                    line-height: 1.3 !important;
                }
                
                .ql-viewer h3 {
                    color: #f4f4f5 !important;
                    margin-top: 2rem !important;
                    margin-bottom: 0.75rem !important;
                    font-weight: 700 !important;
                    font-size: 1.75rem !important;
                }

                .ql-viewer p {
                    font-size: 1.2rem !important;
                    line-height: 1.8 !important;
                    margin-bottom: 1.5rem !important;
                    color: #d4d4d8 !important;
                }

                .ql-viewer p:has(br) {
                    margin-bottom: 0.5rem !important;
                }

                .ql-viewer img {
                    border-radius: 1rem;
                    margin: 2.5rem 0;
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
                }

                .ql-viewer pre.ql-syntax,
                .ql-viewer .ql-code-block {
                    background-color: #0c1524 !important;
                    color: #00f2ff !important;
                    border: 1px solid rgba(255, 255, 255, 0.05) !important;
                    border-radius: 12px !important;
                    padding: 24px !important;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
                    font-size: 1rem !important;
                    line-height: 1.6 !important;
                    margin: 2rem 0 !important;
                    overflow-x: auto;
                    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
                }
            `}</style>

            {/* Article Footer */}
            <footer className="mt-24 pt-12 border-t border-white/5 space-y-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
                            <Share2 size={18} />
                            <span className="text-sm font-medium">Share story</span>
                        </button>
                    </div>
                    <button 
                         onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                         className="text-sm font-bold text-[#00d1ff] hover:text-[#00e5ff] transition-colors"
                    >
                        Back to top
                    </button>
                </div>

                <div className="p-8 rounded-3xl bg-white/2 border border-[#1e293b] flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-[#00d1ff]/20 to-[#00b8d4]/20 border border-[#00d1ff]/10 flex items-center justify-center text-[#00d1ff] font-black text-3xl">
                        TP
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-lg font-bold text-white mb-2">Written by TotalPMP Admin</h4>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Professional project management guidelines and technical documentation for modern development teams.
                        </p>
                    </div>
                    <button className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all active:scale-95">
                        Follow
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default DocViewer;

