import React from 'react';
import {
    Search,
    Bell,
    Menu,
    User,
    ChevronDown,
    Globe,
    Command
} from 'lucide-react';

interface NavbarProps {
    toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
    return (
        <header className="h-16 border-b border-white/5 bg-[#09090b]/50 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors md:hidden"
                >
                    <Menu size={20} className="text-zinc-400" />
                </button>

                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl w-64 group focus-within:ring-1 focus-within:ring-white/20 transition-all">
                    <Search size={16} className="text-zinc-500 group-focus-within:text-zinc-300" />
                    <input
                        type="text"
                        placeholder="Search dashboard..."
                        className="bg-transparent border-none outline-none text-sm w-full text-zinc-300 placeholder:text-zinc-500"
                    />
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-zinc-500">
                        <Command size={10} /> K
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors relative">
                    <Globe size={20} className="text-zinc-400" />
                </button>

                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors relative">
                    <Bell size={20} className="text-zinc-400" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border-2 border-[#09090b]"></span>
                </button>

                <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block"></div>

                <button className="flex items-center gap-3 pl-2 pr-1 py-1 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10 group">
                    <div className="items-end hidden sm:flex flex-col">
                        <span className="text-sm font-medium text-zinc-200">Admin User</span>
                        <span className="text-[10px] text-zinc-500">Super Admin</span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold shadow-lg shadow-amber-500/10">
                        <User size={18} />
                    </div>
                    <ChevronDown size={14} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </button>
            </div>
        </header>
    );
};

export default Navbar;
