/**
 * layouts/DashboardLayout.jsx
 *
 * The main shell for all authenticated pages.
 * Contains: Sidebar navigation + Top header + Content area
 *
 * LAYOUT ARCHITECTURE:
 * ┌─────────┬──────────────────────────────────┐
 * │         │  Top Header (user info, alerts)   │
 * │ Sidebar ├──────────────────────────────────┤
 * │  Nav    │                                    │
 * │         │   <Outlet /> (page content)        │
 * │         │                                    │
 * └─────────┴──────────────────────────────────┘
 *
 * WHY OUTLET?
 * React Router's <Outlet /> renders the matched child route's component.
 * DashboardLayout wraps every protected page without re-mounting the layout
 * on navigation. This is more efficient than rendering layout inside each page.
 */

import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, Truck, UserCheck, Package,
    Receipt, BarChart3, FileText, Bell, Settings,
    LogOut, Menu, X, MapPin, Bot, ChevronRight,
    Building2, Zap, Sun, Moon
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';

// ─── NAVIGATION ITEMS ─────────────────────────────────────────────────────────
// Each item specifies which roles can see it
const NAV_ITEMS = [
    {
        group: 'Overview',
        items: [
            { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.DASHBOARD, roles: ['admin', 'operations', 'accounts', 'driver'] },
        ],
    },
    {
        group: 'Masters',
        items: [
            { label: 'Clients', icon: Building2, path: ROUTES.CLIENTS, roles: ['admin', 'operations', 'accounts'] },
            { label: 'Truck Owners', icon: Users, path: ROUTES.TRUCK_OWNERS, roles: ['admin', 'operations'] },
            { label: 'Drivers', icon: UserCheck, path: ROUTES.DRIVERS, roles: ['admin', 'operations'] },
            { label: 'Vehicles', icon: Truck, path: ROUTES.VEHICLES, roles: ['admin', 'operations'] },
        ],
    },
    {
        group: 'Operations',
        items: [
            { label: 'Shipments', icon: Package, path: ROUTES.SHIPMENTS, roles: ['admin', 'operations'] },
            { label: 'GPS Tracking', icon: MapPin, path: ROUTES.GPS_TRACKING, roles: ['admin', 'operations', 'driver'] },
        ],
    },
    {
        group: 'Finance',
        items: [
            { label: 'Billing & Invoices', icon: Receipt, path: ROUTES.BILLING, roles: ['admin', 'accounts'] },
        ],
    },
    {
        group: 'Intelligence',
        items: [
            { label: 'Analytics', icon: BarChart3, path: ROUTES.ANALYTICS, roles: ['admin', 'accounts'] },
            { label: 'Reports', icon: FileText, path: ROUTES.REPORTS, roles: ['admin', 'accounts'] },
            { label: 'AI Assistant', icon: Bot, path: ROUTES.AI_ASSISTANT, roles: ['admin', 'operations', 'accounts'] },
        ],
    },
    {
        group: 'System',
        items: [
            { label: 'Notifications', icon: Bell, path: ROUTES.NOTIFICATIONS, roles: ['admin', 'operations', 'accounts', 'driver'] },
            { label: 'User Management', icon: Users, path: ROUTES.USERS, roles: ['admin'] },
            { label: 'Settings', icon: Settings, path: ROUTES.SETTINGS, roles: ['admin'] },
        ],
    },
];

// Role badge colors
const ROLE_COLORS = {
    admin: { bg: 'rgba(244, 63, 94, 0.15)', color: '#F43F5E', border: 'rgba(244, 63, 94, 0.3)' },
    operations: { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
    accounts: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: 'rgba(16, 185, 129, 0.3)' },
    driver: { bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' },
};

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [theme, setTheme] = useState('dark');
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
    }, [theme]);

    const handleLogout = async () => {
        await logout();
        navigate(ROUTES.LOGIN);
    };

    const roleStyle = ROLE_COLORS[user?.role] || ROLE_COLORS.operations;

    // Filter nav items by user role
    const filteredNav = NAV_ITEMS.map(group => ({
        ...group,
        items: group.items.filter(item => item.roles.includes(user?.role)),
    })).filter(group => group.items.length > 0);

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-4 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}
                    >
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-base leading-none">LogiTrack</p>
                        <p className="text-[10px] font-medium mt-0.5" style={{ color: '#60a5fa' }}>AI Platform</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-3 px-2">
                {filteredNav.map((group) => (
                    <div key={group.group} className="mb-4">
                        <p
                            className="text-[10px] font-bold uppercase tracking-widest px-3 mb-1"
                            style={{ color: 'rgba(100, 116, 139, 0.8)' }}
                        >
                            {group.group}
                        </p>
                        {group.items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group mb-0.5 ${isActive
                                        ? 'text-white'
                                        : 'text-slate-400 hover:text-slate-200'
                                    }`
                                }
                                style={({ isActive }) =>
                                    isActive
                                        ? {
                                            background: 'rgba(59, 130, 246, 0.15)',
                                            borderLeft: '3px solid #3b82f6',
                                            paddingLeft: '0.625rem',
                                        }
                                        : {}
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon
                                            className="w-4 h-4 flex-shrink-0"
                                            style={{ color: isActive ? '#60a5fa' : undefined }}
                                        />
                                        <span>{item.label}</span>
                                        {isActive && (
                                            <ChevronRight className="w-3 h-3 ml-auto text-blue-400" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* User Profile Footer */}
            <div
                className="p-3 border-t"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
                <div
                    className="flex items-center gap-3 p-2.5 rounded-lg transition-colors cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                    {/* Avatar */}
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}
                    >
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                        <div
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold mt-0.5"
                            style={{ background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}` }}
                        >
                            {user?.role?.toUpperCase()}
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-1.5 rounded-md transition-colors flex-shrink-0"
                        style={{ color: '#64748b' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#F43F5E'}
                        onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-slate-950">

            {/* ── DESKTOP SIDEBAR ───────────────────────────────────── */}
            <aside
                className="hidden lg:flex w-60 flex-shrink-0 flex-col sidebar"
            >
                <SidebarContent />
            </aside>

            {/* ── MOBILE SIDEBAR OVERLAY ────────────────────────────── */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 z-40 lg:hidden"
                            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                        />
                        <motion.aside
                            className="fixed inset-y-0 left-0 z-50 w-60 flex flex-col lg:hidden sidebar"
                            initial={{ x: -240 }}
                            animate={{ x: 0 }}
                            exit={{ x: -240 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ── MAIN CONTENT AREA ─────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top Header */}
                <header
                    className="flex-shrink-0 flex items-center justify-between px-4 lg:px-6 h-14 border-b bg-slate-900 border-slate-800"
                >
                    {/* Mobile hamburger */}
                    <button
                        className="lg:hidden p-2 rounded-md text-slate-400 hover:text-white"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Page title placeholder — pages can override via document.title */}
                    <div className="hidden lg:block" />

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {/* Live indicator */}
                        <div className="hidden md:flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs text-slate-400 font-medium">Live</span>
                        </div>

                        <div className="h-4 w-px bg-slate-700" />

                        {/* Theme Toggle Button */}
                        <button
                            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                            className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                            style={{ background: 'rgba(255,255,255,0.04)' }}
                            title="Toggle Light/Dark Theme"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-400" />}
                        </button>

                        {/* Notification bell */}
                        <button className="relative p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                            style={{ background: 'rgba(255,255,255,0.04)' }}>
                            <Bell className="w-4 h-4" />
                            <span
                                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                                style={{ background: '#F43F5E' }}
                            />
                        </button>

                        {/* User avatar */}
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer"
                            style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}
                            title={user?.name}
                        >
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
