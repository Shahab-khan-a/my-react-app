import React, { useState, useEffect } from 'react';
import {
    Activity,
    FileText,
    Clock,
    Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState([
        { label: 'Docs Published', value: '0', icon: FileText, color: 'text-emerald-400' },
    ]);
    const [recentDocs, setRecentDocs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                console.log('Fetching dashboard data...');
                // Fetch Total Docs
                const { count, error: countError } = await supabase
                    .from('docs')
                    .select('*', { count: 'exact', head: true });

                console.log('Count result:', { count, countError });

                if (countError) throw countError;

                // Update Stats
                setStats([{ label: 'Docs Published', value: (count || 0).toString(), icon: FileText, color: 'text-emerald-400' }]);

                // Fetch Recent Activity (Latest 5 docs)
                const { data: latestDocs, error: docsError } = await supabase
                    .from('docs')
                    .select('title, created_at')
                    .order('created_at', { ascending: false })
                    .limit(5);

                console.log('Latest docs result:', { latestDocs, docsError });

                if (docsError) throw docsError;
                setRecentDocs(latestDocs || []);

            } catch (error: any) {
                console.error('Error fetching dashboard data:', error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        Dashboard
                    </h1>
                    <p className="text-zinc-500 mt-1">Welcome back, here's what's happening today.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="p-6 rounded-2xl bg-[#121214] border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
                            <h3 className="text-2xl font-bold mt-1 text-white">
                                {isLoading ? '...' : stat.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3 p-6 rounded-2xl bg-[#121214] border border-white/5 min-h-100 flex flex-col">
                    <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
                        <Activity size={20} className="text-amber-400" />
                        Recent Activity
                    </h3>
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="animate-spin text-zinc-600" size={24} />
                            </div>
                        ) : recentDocs.length > 0 ? (
                            recentDocs.map((doc, idx) => (
                                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white/2 border border-white/5 hover:bg-white/4 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-400/20">
                                        <FileText size={18} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm text-zinc-300 truncate">
                                            <span className="font-bold text-white">New doc created:</span> {doc.title}
                                        </p>
                                        <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(doc.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic">
                                <Activity size={48} className="mb-4 opacity-10" />
                                No recent activity
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
