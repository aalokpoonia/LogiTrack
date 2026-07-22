/**
 * RevenueChart.jsx — Business Revenue & Profit Trend Combo Chart
 *
 * Recharts ComposedChart combining Bar (Revenue) and Line (Profit).
 * Support for time-range filtering from Dashboard level state.
 */

import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
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
            className="rounded-lg p-3 text-[11px] shadow-xl"
            style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                backdropFilter: 'blur(10px)',
            }}
        >
            <p className="text-slate-400 mb-1.5 font-semibold">
                {new Date(label).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            {payload.map((p) => (
                <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: p.color }}
                    />
                    <span className="text-slate-350 capitalize">{p.name || p.dataKey}:</span>
                    <span className="text-slate-200 font-bold">
                        ₹{Number(p.value).toLocaleString('en-IN')}
                    </span>
                </div>
            ))}
        </div>
    );
};

const RANGE_OPTIONS = [
    { value: 'this_month', label: 'This Month' },
    { value: 'last_30_days', label: '30 Days' },
    { value: 'last_3_months', label: '3 Months' },
    { value: 'last_6_months', label: '6 Months' }
];

const RevenueChart = ({ data = [], range = 'this_month', setRange }) => {
    const getRangeLabel = () => {
        if (range === 'this_month') return 'This calendar month';
        if (range === 'last_30_days') return 'Last 30 days';
        if (range === 'last_3_months') return 'Last 90 days';
        if (range === 'last_6_months') return 'Last 180 days';
        return 'Selected period';
    };

    return (
        <div className="glass-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                    <h2 className="text-slate-200 font-semibold text-sm">Revenue & Profit Trend</h2>
                    <p className="text-slate-500 text-xs mt-0.5">{getRangeLabel()}</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    {/* Time range selector */}
                    <div className="flex bg-slate-950/40 p-0.5 rounded-lg border border-slate-800">
                        {RANGE_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setRange(opt.value)}
                                className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                                    range === opt.value
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-slate-250'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 text-[10px] font-medium">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded bg-blue-500" />
                            <span className="text-slate-400">Revenue</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-0.5 bg-emerald-500" />
                            <span className="text-slate-400">Profit</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ height: 280 }}>
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                        No financial data logs for this period
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: '#64748b' }}
                                tickLine={false}
                                axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                                tickFormatter={(d) =>
                                    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                }
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: '#64748b' }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={formatINR}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar 
                                dataKey="revenue" 
                                name="Revenue" 
                                fill="#3b82f6" 
                                radius={[3, 3, 0, 0]} 
                                barSize={data.length > 31 ? 8 : 14} 
                            />
                            <Line 
                                type="monotone" 
                                dataKey="profit" 
                                name="Profit" 
                                stroke="#10B981" 
                                strokeWidth={2.5} 
                                dot={{ r: 1.5 }} 
                                activeDot={{ r: 5 }} 
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default RevenueChart;
