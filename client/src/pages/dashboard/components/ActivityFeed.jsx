/**
 * ActivityFeed.jsx — Live Operational Timeline
 *
 * Displays a chronological list of recent shipment lifecycle milestones.
 */

import { PlusCircle, CheckCircle2, Navigation, FileSignature } from 'lucide-react';
import { motion } from 'framer-motion';

const ICON_MAP = {
    payment_received: { icon: CheckCircle2, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
    delivered: { icon: CheckCircle2, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
    in_transit: { icon: Navigation, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
    invoiced: { icon: FileSignature, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' },
    booked: { icon: PlusCircle, color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)' },
};

const formatTimeAgo = (dateStr) => {
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now - then;
    const diffMin = Math.round(diffMs / 60000);
    const diffHr = Math.round(diffMs / 3600000);
    const diffDay = Math.round(diffMs / 86400000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${diffDay}d ago`;
};

const ActivityFeed = ({ data = [], className = '' }) => {
    return (
        <div className={`glass-card p-5 ${className}`}>
            <h2 className="text-slate-300 font-semibold text-sm mb-4 pl-2.5 border-l-2 border-emerald-500">Live Activity Feed</h2>

            {data.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">
                    No recent activity
                </div>
            ) : (
                <div className="relative border-l border-slate-800 pl-4 ml-2.5 space-y-5">
                    {data.slice(0, 5).map((act, idx) => {
                        const style = ICON_MAP[act.action] || ICON_MAP.booked;
                        return (
                            <motion.div 
                                key={act.id || idx} 
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.08, duration: 0.3 }}
                                className="relative"
                            >
                                {/* Timeline Dot */}
                                <div
                                    className="absolute -left-[27px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border border-slate-900 shadow-md"
                                    style={{ 
                                        background: style.bg,
                                        borderColor: style.color + '33'
                                    }}
                                >
                                    <style.icon className="w-3.5 h-3.5" style={{ color: style.color }} />
                                </div>

                                <div className="space-y-0.5">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-slate-400 text-xs font-semibold truncate max-w-[140px]">
                                            {act.client}
                                        </p>
                                        <span className="text-[10px] text-slate-500 flex-shrink-0">
                                            {formatTimeAgo(act.timestamp)}
                                        </span>
                                    </div>
                                    <p className="text-slate-200 text-xs font-normal">
                                        {act.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ActivityFeed;
