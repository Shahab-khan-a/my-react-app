import React, { useEffect, useState } from 'react';
import {
    Settings,
    FileText,
    LogOut,
    ChevronLeft,
    Sparkles,
    Book,
    ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    activeView: string;
    setActiveView: (view: string) => void;
}

interface DocNav {
    id: string;
    title: string;
}

const menuItems = [
    { icon: FileText, label: 'Dashboard', id: 'dashboard' },
    { icon: FileText, label: 'Add Documentation', id: 'docs-editor' },
    { icon: Sparkles, label: 'View Documentation', id: 'docs-list' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, activeView, setActiveView }) => {
    const [docs, setDocs] = useState<DocNav[]>([]);

    useEffect(() => {
        fetchDocs();

        // Subscribe to changes to refresh the sidebar
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'docs'
                },
                () => {
                    fetchDocs();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchDocs = async () => {
        try {
            const { data, error } = await supabase
                .from('docs')
                .select('id, title')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDocs(data || []);
        } catch (error: any) {
            console.error('Error fetching docs for sidebar:', error.message);
        }
    };

    return (
        <aside className={`
      relative h-full bg-[#09090b] border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out z-40
      ${isOpen ? 'w-64' : 'w-20'}
      fixed md:relative ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
            {/* Brand Logo */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-black font-black text-lg shadow-lg shadow-amber-400/20">
                        S
                    </div>
                    {isOpen && (
                        <span className="font-bold text-lg tracking-tight whitespace-nowrap">
                            Dev<span className="text-amber-400">Doc</span>
                        </span>
                    )}
                </div>
                <button
                    onClick={toggleSidebar}
                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors hidden md:block"
                >
                    <ChevronLeft size={18} className={`text-zinc-500 transition-transform ${!isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Main Nav */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 custom-scrollbar">
                <div className="space-y-1">
                    <div className="px-3 mb-2">
                        {isOpen && <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">General</p>}
                    </div>
                    {menuItems.map((item, index) => {
                        const isActive = activeView === item.id;
                        return (
                            <button
                                key={index}
                                onClick={() => setActiveView(item.id)}
                                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
                  ${isActive
                                        ? 'bg-amber-400/10 text-amber-400 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.1)]'
                                        : 'text-zinc-500 hover:text-white hover:bg-white/5'}
                `}
                            >
                                <item.icon size={20} className={isActive ? 'text-amber-400' : 'group-hover:scale-110 transition-transform'} />
                                {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                            </button>
                        );
                    })}
                </div>

                {/* Documentation List Section */}
                {docs.length > 0 && (
                    <div className="space-y-1">
                        <div className="px-3 mb-2 flex items-center justify-between">
                            {isOpen && <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Documentation</p>}
                            {isOpen && <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse"></div>}
                        </div>
                        {docs.map((doc) => {
                            const docId = `doc:${doc.id}`;
                            const isActive = activeView === docId;
                            return (
                                <button
                                    key={doc.id}
                                    onClick={() => setActiveView(docId)}
                                    className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group
                    ${isActive
                                            ? 'text-amber-400 bg-amber-400/5'
                                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}
                  `}
                                >
                                    <Book size={16} className={isActive ? 'text-amber-400' : 'text-zinc-700 group-hover:text-zinc-500 group-hover:scale-110 transition-all'} />
                                    {isOpen && (
                                        <span className="text-xs font-medium truncate flex-1 text-left">
                                            {doc.title}
                                        </span>
                                    )}
                                    {isOpen && isActive && <ChevronRight size={12} className="text-amber-400" />}
                                </button>
                            );
                        })}
                    </div>
                )}
            </nav>


            {/* Footer Nav */}
            <div className="p-3 border-t border-white/5 space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all group">
                    <Settings size={20} className="group-hover:rotate-45 transition-transform" />
                    {isOpen && <span className="text-sm font-medium">Settings</span>}
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all group">
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    {isOpen && <span className="text-sm font-medium">Log Out</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
