/**
 * MonthlyRevenueChart.jsx — Last 6 Months Revenue vs Profit
 *
 * Recharts BarChart comparing monthly revenue and profit side by side.
 * Uses rounded bar shapes for modern aesthetic.
 */

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

const formatINR = (v) => {
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
    return `₹${v}`;
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const [year, month] = (label || '').split('-');
    const monthName = MONTH_NAMES[parseInt(month, 10) - 1] || month;

    return (
        <div
            className="rounded-lg p-3 text-xs shadow-xl"
            style={{
                background: 'rgba(13, 20, 36, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
            }}
        >
            <p className="text-slate-400 mb-1.5 font-medium">{monthName} {year}</p>
            {payload.map((p) => (
                <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
                    <span className="text-slate-300 capitalize">{p.dataKey}:</span>
                    <span className="text-white font-semibold">
                        ₹{Number(p.value).toLocaleString('en-IN')}
                    </span>
                </div>
            ))}
        </div>
    );
};

const MonthlyRevenueChart = ({ data = [] }) => {
    // Format month labels
    const formatted = data.map((d) => {
        const [, month] = (d.month || '').split('-');
        return {
            ...d,
            label: MONTH_NAMES[parseInt(month, 10) - 1] || d.month,
        };
    });

    return (
        <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-white font-semibold text-sm">Monthly Comparison</h2>
                    <p className="text-slate-500 text-xs mt-0.5">Last 6 months</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded" style={{ background: '#3b82f6' }} />
                        <span className="text-slate-400">Revenue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded" style={{ background: '#10B981' }} />
                        <span className="text-slate-400">Profit</span>
                    </div>
                </div>
            </div>

            <div style={{ height: 280 }}>
                {formatted.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                        No monthly data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                tickLine={false}
                                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#64748b' }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={formatINR}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default MonthlyRevenueChart;
