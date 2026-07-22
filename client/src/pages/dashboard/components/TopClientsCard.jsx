/**
 * TopClientsCard.jsx — Top 5 Clients by Revenue
 *
 * Horizontal bar-style list showing each client's revenue contribution.
 * The bar width is proportional to the highest revenue client.
 */

import { Building2 } from 'lucide-react';

const TopClientsCard = ({ data = [] }) => {
    const maxRevenue = data.length > 0 ? Math.max(...data.map((d) => d.revenue)) : 1;

    return (
        <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-slate-300 font-semibold text-sm pl-2.5 border-l-2 border-amber-500">Top Clients</h2>
                <span className="text-slate-500 text-xs">By revenue this month</span>
            </div>

            {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Building2 className="w-8 h-8 text-slate-600 mb-2" />
                    <p className="text-slate-500 text-sm">No client data this month</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {data.map((client, idx) => {
                        const barWidth = Math.max((client.revenue / maxRevenue) * 100, 8);
                        return (
                            <div key={client.clientId || idx}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center"
                                            style={{
                                                background: idx === 0
                                                    ? 'rgba(245, 158, 11, 0.2)'
                                                    : 'rgba(100,116,139,0.1)',
                                                color: idx === 0 ? '#F59E0B' : '#64748b',
                                            }}
                                        >
                                            {idx + 1}
                                        </span>
                                        <span className="text-slate-200 text-sm font-medium truncate max-w-[160px]">
                                            {client.companyName || 'Unknown'}
                                        </span>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="text-slate-300 text-sm font-semibold">
                                            ₹{Number(client.revenue).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-1.5 rounded-full flex-1"
                                        style={{ background: 'rgba(255,255,255,0.04)' }}
                                    >
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${barWidth}%`,
                                                background:
                                                    idx === 0
                                                        ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                                                        : 'rgba(59, 130, 246, 0.5)',
                                            }}
                                        />
                                    </div>
                                    <span className="text-slate-500 text-[10px] w-16 text-right">
                                        {client.shipments} trips
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TopClientsCard;
