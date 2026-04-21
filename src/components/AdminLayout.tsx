import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
    activeView: string;
    setActiveView: (view: string) => void;
    onLogout?: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeView, setActiveView, onLogout }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen bg-[#02060c] text-white overflow-hidden font-sans">
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                activeView={activeView}
                setActiveView={setActiveView}
            />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Navbar */}
                <Navbar toggleSidebar={toggleSidebar} onLogout={onLogout} />

                {/* Dynamic Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
