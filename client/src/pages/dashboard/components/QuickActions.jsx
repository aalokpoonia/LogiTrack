/**
 * QuickActions.jsx — Dynamic Dashboard Shortcuts
 *
 * Clickable shortcuts for common actions: new shipment booking,
 * client onboard, tracking vehicle, printing report, etc.
 */

import { Plus, Users, Search, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

const QuickActions = () => {
    const navigate = useNavigate();

    const actions = [
        {
            title: 'Book Shipment',
            desc: 'Create new LR details',
            icon: Plus,
            color: '#3b82f6',
            bg: 'rgba(59, 130, 246, 0.1)',
            path: ROUTES.SHIPMENTS,
        },
        {
            title: 'Add Client',
            desc: 'Register new company',
            icon: Users,
            color: '#10B981',
            bg: 'rgba(16, 185, 129, 0.1)',
            path: ROUTES.CLIENTS,
        },
        {
            title: 'Track Vehicle',
            desc: 'Check live driver GPS',
            icon: Search,
            color: '#F59E0B',
            bg: 'rgba(245, 158, 11, 0.1)',
            path: ROUTES.GPS_TRACKING,
        },
        {
            title: 'Billing Report',
            desc: 'Outstanding payments list',
            icon: FileText,
            color: '#8B5CF6',
            bg: 'rgba(139, 92, 246, 0.1)',
            path: ROUTES.ANALYTICS,
        },
    ];

    return (
        <div className="glass-card p-5">
            <h2 className="text-white font-semibold text-sm mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {actions.map((act) => (
                    <button
                        key={act.title}
                        onClick={() => navigate(act.path)}
                        className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-150 border border-transparent hover:border-slate-800"
                        style={{ background: 'rgba(255,255,255,0.02)' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        }}
                    >
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: act.bg }}
                        >
                            <act.icon className="w-4 h-4" style={{ color: act.color }} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-slate-200 text-xs font-semibold truncate">
                                {act.title}
                            </p>
                            <p className="text-slate-500 text-[10px] truncate mt-0.5">
                                {act.desc}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;
