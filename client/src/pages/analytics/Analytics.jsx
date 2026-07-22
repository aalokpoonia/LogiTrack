/**
 * pages/analytics/Analytics.jsx
 *
 * Advanced business intelligence dashboard.
 * Visual charts for revenue trends, corridor metrics, profit margins, and distribution.
 */

import { useState } from 'react';
import { useAnalytics } from '../../hooks/useReports';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    TrendingUp, Award, Map, CreditCard, Calendar, RefreshCw, BarChart2,
    DollarSign, Truck, Percent, Briefcase
} from 'lucide-react';

const COLORS = ['#10B981', '#F59E0B', '#F43F5E', '#3B82F6', '#8B5CF6'];

const Analytics = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const { data: analyticsData, isLoading, isError, refetch } = useAnalytics({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
    });

    const handleQuickFilter = (range) => {
        const today = new Date();
        if (range === 'this_month') {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(today.toISOString().split('T')[0]);
        } else if (range === 'last_6_months') {
            const start = new Date(today.getFullYear(), today.getMonth() - 5, 1);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(today.toISOString().split('T')[0]);
        } else {
            setStartDate('');
            setEndDate('');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
                Loading business analytics data...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center py-20 text-rose-500 text-sm">
                Failed to load analytics records from backend.
            </div>
        );
    }

    const { summary, monthlyTrend, topClients, topRoutes, paymentDistribution } = analyticsData?.data || {};

    const profitMarginPercent = summary?.totalRevenue > 0
        ? Math.round((summary.totalProfit / summary.totalRevenue) * 100)
        : 0;

    const formattedPieData = paymentDistribution?.map(item => ({
        name: (item._id || 'pending').toUpperCase(),
        value: item.count,
    })) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-blue-500" />
                        Executive Analytics Dashboard
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5">
                        Real-time revenue, gross margin performance, and corridor load statistics.
                    </p>
                </div>

                {/* Filters Shelf */}
                <div className="flex flex-wrap items-center gap-2.5 bg-slate-900 border border-slate-900/60 p-3 rounded-xl">
                    <button
                        onClick={() => handleQuickFilter('this_month')}
                        className="px-2.5 py-1.5 rounded bg-slate-950/60 hover:bg-slate-800 text-slate-300 text-[10px] font-medium transition-colors"
                    >
                        This Month
                    </button>
                    <button
                        onClick={() => handleQuickFilter('last_6_months')}
                        className="px-2.5 py-1.5 rounded bg-slate-950/60 hover:bg-slate-800 text-slate-300 text-[10px] font-medium transition-colors"
                    >
                        Last 6 Months
                    </button>
                    <div className="h-4 w-px bg-slate-850" />
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-slate-950/60 border border-slate-800 text-slate-300 text-[10px] px-2 py-1.5 rounded focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-slate-500 text-xs">to</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-slate-950/60 border border-slate-800 text-slate-300 text-[10px] px-2 py-1.5 rounded focus:outline-none focus:border-blue-500"
                    />
                    <button onClick={() => refetch()} className="p-1.5 text-slate-500 hover:text-white transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Revenue */}
                <div className="bg-slate-900 border border-slate-900/60 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Total Revenue</p>
                        <p className="text-base font-bold text-white">₹{summary?.totalRevenue?.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                {/* Supplier Payout */}
                <div className="bg-slate-900 border border-slate-900/60 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-400">
                        <Truck className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Vendor Payouts</p>
                        <p className="text-base font-bold text-white">₹{summary?.totalPayout?.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                {/* Net Profit Margin */}
                <div className="bg-slate-900 border border-slate-900/60 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Net Margin (Profit)</p>
                        <p className="text-base font-bold text-white">₹{summary?.totalProfit?.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                {/* Margin Percentage */}
                <div className="bg-slate-900 border border-slate-900/60 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400">
                        <Percent className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Margin Ratio</p>
                        <p className="text-base font-bold text-white">{profitMarginPercent}%</p>
                    </div>
                </div>

                {/* Shipments count */}
                <div className="bg-slate-900 border border-slate-900/60 p-4 rounded-xl flex items-center gap-3 col-span-2 lg:col-span-1">
                    <div className="p-2.5 bg-slate-800 rounded-lg text-slate-400">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Total Bookings</p>
                        <p className="text-base font-bold text-white">{summary?.totalShipments} LRs</p>
                    </div>
                </div>
            </div>

            {/* Charts Row 1: Area Trends & Routes Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Line Area Chart: Revenue vs Profit Trend */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4">
                    <div>
                        <h3 className="text-white font-bold text-sm tracking-wide flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            Revenue vs Margin Trend
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">Chronological summary of freight income vs net profit margins.</p>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="month" stroke="#64748B" fontSize={10} tickLine={false} />
                                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#0D1424', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                                    labelStyle={{ color: 'white', fontWeight: 'bold' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                <Area type="monotone" name="Revenue" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                                <Area type="monotone" name="Net Margin" dataKey="profit" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfit)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar Chart: Route performance */}
                <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4">
                    <div>
                        <h3 className="text-white font-bold text-sm tracking-wide flex items-center gap-1.5">
                            <Map className="w-4 h-4 text-emerald-400" />
                            Top Corridor Routes
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">Top regional routes by count of total shipment bookings.</p>
                    </div>

                    {topRoutes?.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-slate-500 text-xs">No route data logged.</div>
                    ) : (
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topRoutes} layout="vertical" margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis type="number" stroke="#64748B" fontSize={9} />
                                    <YAxis dataKey="route" type="category" stroke="#64748B" fontSize={9} width={90} tickLine={false} />
                                    <Tooltip contentStyle={{ background: '#0D1424', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                                    <Bar dataKey="count" name="Bookings" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={12} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* Charts Row 2: Top Clients Table & Pie Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Table: Top Clients */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4">
                    <div>
                        <h3 className="text-white font-bold text-sm tracking-wide flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-amber-500" />
                            Key Client Accounts
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">Highest contribution clients sorted by aggregate freight revenue.</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table-dark text-xs">
                            <thead>
                                <tr>
                                    <th>Client Company</th>
                                    <th>LRs Booked</th>
                                    <th>Total Freight Paid</th>
                                    <th>Net Margins Contribution</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topClients?.map((c, idx) => (
                                    <tr key={c._id || idx}>
                                        <td className="font-semibold text-white py-3">{c.companyName}</td>
                                        <td>{c.shipmentsCount} shipments</td>
                                        <td>₹{c.revenue?.toLocaleString('en-IN')}</td>
                                        <td className="text-emerald-400 font-semibold">₹{c.totalProfit?.toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                                {(!topClients || topClients.length === 0) && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-6 text-slate-500">No client data logs recorded.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pie Chart: Payment Status distribution */}
                <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4">
                    <div>
                        <h3 className="text-white font-bold text-sm tracking-wide flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-purple-400" />
                            Payment Collection Status
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">Breakdown distribution of billing collection statuses.</p>
                    </div>

                    {formattedPieData.length === 0 ? (
                        <div className="h-60 flex items-center justify-center text-slate-500 text-xs">No billing metrics recorded.</div>
                    ) : (
                        <div className="h-60 w-full flex flex-col justify-center items-center">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={formattedPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {formattedPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
