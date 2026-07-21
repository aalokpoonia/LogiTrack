/**
 * RevenueChart.jsx — Last 30 Days Revenue & Profit
 *
 * Recharts AreaChart with gradient fill matching the dark theme.
 * Shows daily revenue (blue) and profit (green) over the last 30 days.
 *
 * RECHARTS NOTE:
 * ResponsiveContainer must have a parent with explicit height.
 * Without it, the chart collapses to 0px — a common Recharts gotcha.
 */

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

const formatINR = (v) => {
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
    return `₹${v}`;
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            className="rounded-lg p-3 text-xs shadow-xl"
            style={{
                background: 'rgba(13, 20, 36, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
            }}
        >
            <p className="text-slate-400 mb-1.5 font-medium">
                {new Date(label).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
            {payload.map((p) => (
                <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: p.color }}
                    />
                    <span className="text-slate-300 capitalize">{p.dataKey}:</span>
                    <span className="text-white font-semibold">
                        ₹{Number(p.value).toLocaleString('en-IN')}
                    </span>
                </div>
            ))}
        </div>
    );
};

const RevenueChart = ({ data = [] }) => {
    return (
        <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-white font-semibold text-sm">Revenue & Profit Trend</h2>
                    <p className="text-slate-500 text-xs mt-0.5">Last 30 days</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#3b82f6' }} />
                        <span className="text-slate-400">Revenue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#10B981' }} />
                        <span className="text-slate-400">Profit</span>
                    </div>
                </div>
            </div>

            <div style={{ height: 280 }}>
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                        No data available for the last 30 days
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: '#64748b' }}
                                tickLine={false}
                                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                                tickFormatter={(d) =>
                                    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                }
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#64748b' }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={formatINR}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#gradRevenue)"
                            />
                            <Area
                                type="monotone"
                                dataKey="profit"
                                stroke="#10B981"
                                strokeWidth={2}
                                fill="url(#gradProfit)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default RevenueChart;
