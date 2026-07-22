/**
 * pages/notifications/Notifications.jsx
 *
 * LogiTrack Notification Center and alert history.
 * Displays dispatcher notifications, delayed fleet risks, and upload confirmations.
 */

import { useState } from 'react';
import { Bell, ShieldCheck, AlertTriangle, Truck, Receipt, CheckCheck, Trash2 } from 'lucide-react';

const INITIAL_ALERTS = [
    {
        id: 1,
        type: 'delay',
        title: 'Shipment Corridor Delay Warning',
        desc: 'LR-2026-890124 (CG04JD1234) is currently in loading state past the scheduled transit time.',
        time: '5 mins ago',
        read: false,
        icon: AlertTriangle,
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    },
    {
        id: 2,
        type: 'dispatch',
        title: 'Lorry Receipt Dispatch Completed',
        desc: 'Driver Ramesh Kumar updated route status to "in_transit" for corridor Raipur → Bilaspur.',
        time: '1 hour ago',
        read: false,
        icon: Truck,
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
        id: 3,
        type: 'billing',
        title: 'Proof of Delivery (POD) Uploaded',
        desc: 'Signed POD scan has been uploaded for LR-2026-789012. System status auto-advanced to "pod_received".',
        time: '3 hours ago',
        read: true,
        icon: Receipt,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
        id: 4,
        type: 'system',
        title: 'Database Sync & Connection Successful',
        desc: 'Connected to MongoDB Atlas clusters. Regional coordinates mapped to Leaflet Route tracking visualizers.',
        time: '1 day ago',
        read: true,
        icon: ShieldCheck,
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    }
];

const Notifications = () => {
    const [alerts, setAlerts] = useState(INITIAL_ALERTS);

    const markAllRead = () => {
        setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    };

    const clearAlert = (id) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const toggleRead = (id) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: !a.read } : a));
    };

    const unreadCount = alerts.filter(a => !a.read).length;

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Bell className="w-5 h-5 text-blue-500" />
                        In-App Alerts & Activity Log
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5">
                        Verify system events, driver coordinate logs, and payment completions.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={markAllRead}
                        disabled={unreadCount === 0}
                        className="flex items-center gap-1 px-3.5 py-2 bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                        <CheckCheck className="w-4 h-4" />
                        Mark All Read
                    </button>
                </div>
            </div>

            {/* List */}
            {alerts.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-900 border-dashed rounded-2xl py-20 text-center">
                    <Bell className="w-8 h-8 text-slate-650 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs font-medium">Alert inbox is completely clear.</p>
                </div>
            ) : (
                <div className="space-y-3.5">
                    {alerts.map((a) => {
                        const Icon = a.icon;
                        return (
                            <div
                                key={a.id}
                                className={`p-4 rounded-2xl border transition-all flex gap-4 items-start ${a.read
                                        ? 'bg-slate-900/40 border-slate-950/60 opacity-65'
                                        : 'bg-slate-900 border-slate-850 hover:border-slate-800 shadow-md'
                                    }`}
                            >
                                {/* Circle icon */}
                                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${a.color}`}>
                                    <Icon className="w-4 h-4" />
                                </div>

                                {/* Body */}
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-start justify-between gap-4">
                                        <h4 className={`text-xs font-bold ${a.read ? 'text-slate-400' : 'text-white'}`}>
                                            {a.title}
                                        </h4>
                                        <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">{a.time}</span>
                                    </div>
                                    <p className="text-slate-350 text-xs leading-relaxed font-sans">{a.desc}</p>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-4 pt-1.5 text-[10px]">
                                        <button
                                            onClick={() => toggleRead(a.id)}
                                            className="text-blue-400 hover:text-blue-300 font-semibold"
                                        >
                                            {a.read ? 'Mark Unread' : 'Mark Read'}
                                        </button>
                                        <button
                                            onClick={() => clearAlert(a.id)}
                                            className="text-slate-500 hover:text-rose-400 font-semibold flex items-center gap-0.5"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Notifications;
