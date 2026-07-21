/**
 * ShipmentStatusChart.jsx — Shipment Status Distribution
 *
 * Recharts PieChart (donut style) showing shipment count per status.
 * Custom center label shows total shipments.
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const STATUS_COLORS = {
    booked: '#8B5CF6',
    loading: '#F59E0B',
    in_transit: '#3b82f6',
    delivered: '#10B981',
    pod_received: '#06b6d4',
    invoiced: '#e879f9',
    paid: '#22c55e',
    cancelled: '#64748b',
};

const STATUS_LABELS = {
    booked: 'Booked',
    loading: 'Loading',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    pod_received: 'POD Received',
    invoiced: 'Invoiced',
    paid: 'Paid',
    cancelled: 'Cancelled',
};

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
        <div
            className="rounded-lg p-2.5 text-xs shadow-xl"
            style={{
                background: 'rgba(13, 20, 36, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
            }}
        >
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: d.payload.fill }} />
                <span className="text-slate-300">{STATUS_LABELS[d.name] || d.name}:</span>
                <span className="text-white font-semibold">{d.value}</span>
            </div>
        </div>
    );
};

const ShipmentStatusChart = ({ data = [] }) => {
    const total = data.reduce((sum, d) => sum + d.count, 0);
    const chartData = data.map((d) => ({
        name: d.status,
        value: d.count,
        fill: STATUS_COLORS[d.status] || '#64748b',
    }));

    return (
        <div className="glass-card p-5">
            <h2 className="text-white font-semibold text-sm mb-4">Shipment Status</h2>

            {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-56 text-slate-500 text-sm">
                    No shipments yet
                </div>
            ) : (
                <>
                    <div style={{ height: 200 }} className="relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, idx) => (
                                        <Cell key={idx} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold text-white">{total}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Total</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4">
                        {chartData.map((d) => (
                            <div key={d.name} className="flex items-center gap-2 text-xs">
                                <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ background: d.fill }}
                                />
                                <span className="text-slate-400 truncate">
                                    {STATUS_LABELS[d.name] || d.name}
                                </span>
                                <span className="text-slate-300 font-medium ml-auto">{d.value}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ShipmentStatusChart;
