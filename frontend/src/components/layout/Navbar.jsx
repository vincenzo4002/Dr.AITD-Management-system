import React from 'react';
import { Menu, Bell, User, ChevronDown } from 'lucide-react';

const Navbar = ({ onMenuClick, userRole, viewRole, setViewRole }) => {
    return (
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-sm transition-all duration-300">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 rounded-xl text-text-secondary hover:bg-gray-100 lg:hidden transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                    aria-label="Toggle menu"
                >
                    <Menu size={24} />
                </button>

                {/* Breadcrumbs or Page Title could go here */}
                <h2 className="text-lg font-bold text-secondary hidden sm:block capitalize tracking-tight font-heading">
                    {userRole ? `${userRole} Portal` : 'Dashboard'}
                </h2>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-6">
                {userRole === 'admin' && viewRole !== 'admin' && (
                    <button
                        onClick={() => {
                            setViewRole('admin');
                            window.location.href = '/admin/dashboard';
                        }}
                        className="px-4 py-2 bg-secondary text-white text-sm font-semibold rounded-xl hover:bg-secondary-hover transition-all shadow-lg shadow-secondary/20 focus:outline-none focus:ring-2 focus:ring-secondary/20"
                    >
                        Back to Admin
                    </button>
                )}

                <button className="p-2.5 rounded-full text-text-muted hover:text-primary hover:bg-primary/5 transition-all relative group focus:outline-none focus:ring-2 focus:ring-primary/20" aria-label="Notifications">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-danger rounded-full border-2 border-white group-hover:scale-110 transition-transform"></span>
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                    <div className="hidden md:block text-right">
                        <p className="text-sm font-bold text-secondary capitalize leading-none mb-1">{userRole || 'User'}</p>
                        <p className="text-xs text-text-muted font-medium">
                            {userRole === 'admin' && viewRole !== 'admin' ? `Viewing as ${viewRole}` : 'Online'}
                        </p>
                    </div>
                    <button className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-blue-600 p-[2px] shadow-lg shadow-primary/20 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-primary">
                            <User size={20} />
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
