import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { FileText, Calendar, Trash2, Search, ExternalLink, Loader2, BookOpen, Edit3 } from 'lucide-react';

interface Doc {
    id: string;
    title: string;
    content: string;
    category: string;
    created_at: string;
}

interface DocsListProps {
    setActiveView: (view: string) => void;
}

const DocsList: React.FC<DocsListProps> = ({ setActiveView }) => {
    const [docs, setDocs] = useState<Doc[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDocs();
    }, []);

    const fetchDocs = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('docs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDocs(data || []);
        } catch (error: any) {
            console.error('Error fetching docs:', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            const { data, error } = await supabase
                .from('docs')
                .delete()
                .eq('id', id)
                .select();

            if (error) throw error;
            if (!data || data.length === 0) {
                throw new Error("Deletion was blocked by Row Level Security (RLS) policies.");
            }
            setDocs(docs.filter(doc => doc.id !== id));
        } catch (error: any) {
            console.error('Error deleting doc:', error.message);
            alert('Failed to delete document: ' + error.message + '\n\nPlease check your Supabase RLS policies.');
        }
    };

    const filteredDocs = docs.filter(doc =>
        (doc.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <BookOpen className="text-[#00d1ff]" size={32} />
                        Your Documentation
                    </h1>
                    <p className="text-zinc-500 mt-1">Manage and view all your published guide and documentation.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search documentation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0c1524] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-[#00d1ff]/50 outline-none transition-all"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
                    <Loader2 className="animate-spin text-[#00d1ff]" size={40} />
                    <p className="text-sm font-medium">Fetching documentation from Supabase...</p>
                </div>
            ) : filteredDocs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocs.map((doc) => (
                        <div key={doc.id} className="p-6 rounded-3xl bg-[#0c1524] border border-white/5 hover:border-[#00d1ff]/20 transition-all group relative overflow-hidden flex flex-col">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00d1ff]/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-[#00d1ff]/10 transition-colors"></div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-[#00d1ff]/10 text-[#00d1ff]">
                                    <FileText size={20} />
                                </div>
                                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold bg-white/5 text-zinc-400`}>
                                    {doc.category || 'General'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{doc.title}</h3>
                            <p className="text-sm text-zinc-500 mb-6 line-clamp-3 flex-1">{doc.content.replace(/<[^>]*>/g, '').trim()}</p>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <div className="flex items-center gap-2 text-zinc-600">
                                    <Calendar size={14} />
                                    <span className="text-[10px] font-bold">
                                        {new Date(doc.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg text-zinc-500 transition-all"
                                        title="Delete document"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => setActiveView(`edit-doc:${doc.id}`)}
                                        className="p-2 hover:bg-[#00d1ff]/10 hover:text-[#00d1ff] rounded-lg text-slate-500 transition-all"
                                        title="Edit document"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button className="p-2 hover:bg-blue-400/10 hover:text-blue-400 rounded-lg text-zinc-500 transition-all">
                                        <ExternalLink size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-64 rounded-3xl bg-[#0c1524] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center text-slate-400 mb-4">
                        <BookOpen size={30} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No Documentation Found</h3>
                    <p className="text-sm text-zinc-500 max-w-xs">
                        {searchTerm ? `No results found for "${searchTerm}". Try a different search term.` : "You haven't added any documentation yet. Go to 'Add Documentation' to get started."}
                    </p>
                    {!searchTerm && (
                        <button className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all border border-white/5">
                            Learn more
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default DocsList;
