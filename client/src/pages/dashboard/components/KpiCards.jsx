/**
 * KpiCards.jsx — Key Performance Indicators
 *
 * 6 glassmorphism cards showing business-critical metrics:
 * Month Revenue, Month Profit, Active Shipments, Pending Payments,
 * Today's Shipments, Delayed Shipments count.
 *
 * NUMBER FORMATTING:
 * Indian number format (e.g., ₹1,25,000) using Intl.NumberFormat('en-IN').
 * This is important for a Raipur-based business — interviewers will notice.
 */

import { motion } from 'framer-motion';
import {
    IndianRupee, TrendingUp, Activity, Clock,
    Package, AlertTriangle
} from 'lucide-react';

const formatINR = (num) => {
    if (num == null) return '₹0';
    return '₹' + Number(num).toLocaleString('en-IN');
};

const KpiCards = ({ kpis, delayedCount = 0 }) => {
    const data = kpis || {};

    const cards = [
        {
            title: 'Month Revenue',
            value: formatINR(data.month?.revenue),
            sub: `${data.month?.shipments || 0} shipments`,
            icon: IndianRupee,
            color: '#3b82f6',
            bg: 'rgba(59, 130, 246, 0.1)',
        },
        {
            title: 'Month Profit',
            value: formatINR(data.month?.profit),
            sub: data.month?.revenue
                ? `${((data.month.profit / data.month.revenue) * 100).toFixed(1)}% margin`
                : '0% margin',
            icon: TrendingUp,
            color: '#10B981',
            bg: 'rgba(16, 185, 129, 0.1)',
        },
        {
            title: 'Active Shipments',
            value: String(data.active?.shipments || 0),
            sub: 'In transit & loading',
            icon: Activity,
            color: '#F59E0B',
            bg: 'rgba(245, 158, 11, 0.1)',
        },
        {
            title: 'Pending Payments',
            value: formatINR(data.pending?.amount),
            sub: `${data.pending?.invoices || 0} invoices`,
            icon: Clock,
            color: '#F43F5E',
            bg: 'rgba(244, 63, 94, 0.1)',
        },
        {
            title: "Today's Bookings",
            value: String(data.today?.shipments || 0),
            sub: `Revenue: ${formatINR(data.today?.revenue)}`,
            icon: Package,
            color: '#8B5CF6',
            bg: 'rgba(139, 92, 246, 0.1)',
        },
        {
            title: 'Delayed Shipments',
            value: String(delayedCount),
            sub: delayedCount > 0 ? 'Action needed' : 'All on time',
            icon: AlertTriangle,
            color: delayedCount > 0 ? '#F43F5E' : '#10B981',
            bg: delayedCount > 0 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
            {cards.map((card, idx) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.3 }}
                    className="glass-card p-5 hover:scale-[1.02] transition-transform duration-200 cursor-default"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div
                            className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300"
                            style={{ 
                                background: card.bg,
                                boxShadow: `0 0 16px -2px ${card.color}33`,
                                border: `1px solid ${card.color}22`
                            }}
                        >
                            <card.icon className="w-5 h-5" style={{ color: card.color }} />
                        </div>
                    </div>
                    <p className="text-slate-400 text-xs font-medium mb-1">{card.title}</p>
                    <p className="text-slate-300 text-2xl font-bold tracking-tight">{card.value}</p>
                    <p className="text-slate-500 text-xs mt-1">{card.sub}</p>
                </motion.div>
            ))}
        </div>
    );
};

export default KpiCards;
