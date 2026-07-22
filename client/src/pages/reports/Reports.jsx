/**
 * pages/reports/Reports.jsx
 *
 * LogiTrack Reports and Document Export panel.
 * Lists operations tabular breakdown with filtering and CSV downloads.
 */

import { useState } from 'react';
import { useShipments } from '../../hooks/useShipments';
import { useClients } from '../../hooks/useClients';
import { getExportCSVUrl } from '../../services/reportService';
import {
    Search, Download, Calendar, Filter, AlertTriangle,
    BadgeInfo, ArrowRight, RefreshCw, BarChart2, DollarSign, Wallet
} from 'lucide-react';

const LIFECYCLE_STATUSES = [
    { value: 'booked', label: 'Booked' },
    { value: 'loading', label: 'Loading' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'pod_received', label: 'POD Received' },
    { value: 'invoiced', label: 'Invoiced' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' }
];

const Reports = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [client, setClient] = useState('');
    const [status, setStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Fetch master clients list for filtering dropdown
    const { data: clientsData } = useClients({ limit: 100, isActive: 'true' });

    // Fetch filtered shipments
    const { data: reportData, isLoading, isError, refetch } = useShipments({
        page,
        limit: 10,
        search: search || undefined,
        client: client || undefined,
        status: status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
    });

    const handleResetFilters = () => {
        setSearch('');
        setClient('');
        setStatus('');
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

    const handleExportCSV = () => {
        const queryParams = {
            search: search || undefined,
            client: client || undefined,
            status: status || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        };

        // Clean undefined fields
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] === undefined) delete queryParams[key];
        });

        const csvUrl = getExportCSVUrl(queryParams);
        window.open(csvUrl, '_blank');
    };

    // Aggregate summary stats based on current table view
    const totalFreight = reportData?.data?.reduce((sum, s) => sum + (s.freightCharge || 0), 0) || 0;
    const totalProfit = reportData?.data?.reduce((sum, s) => sum + (s.profit || 0), 0) || 0;
    const totalReceived = reportData?.data?.reduce((sum, s) => sum + (s.amountPaid || 0), 0) || 0;
    const totalOutstanding = totalFreight - totalReceived;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-blue-500" />
                        Billing & Operations Reports
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5">
                        Filter shipment operations, verify margins, and download spreadsheet logs.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleResetFilters}
                        className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs transition-colors font-semibold"
                    >
                        Clear Filters
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV Report
                    </button>
                </div>
            </div>

            {/* Filter Shelf */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-slate-900 border border-slate-900/60 p-4 rounded-xl">
                {/* Search */}
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search LR or Truck..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 px-9 py-2 rounded-lg text-xs focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Client dropdown */}
                <div>
                    <select
                        value={client}
                        onChange={(e) => { setClient(e.target.value); setPage(1); }}
                        className="w-full bg-slate-950/60 border border-slate-800 text-slate-350 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    >
                        <option value="">All Clients</option>
                        {clientsData?.data?.map(c => (
                            <option key={c._id} value={c._id}>{c.companyName}</option>
                        ))}
                    </select>
                </div>

                {/* Lifecycle status dropdown */}
                <div>
                    <select
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        className="w-full bg-slate-950/60 border border-slate-800 text-slate-350 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    >
                        <option value="">All Statuses</option>
                        {LIFECYCLE_STATUSES.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Start Date */}
                <div>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                        className="w-full bg-slate-950/60 border border-slate-800 text-slate-350 text-xs px-3 py-2 rounded-lg focus:outline-none"
                    />
                </div>

                {/* End Date */}
                <div>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                        className="w-full bg-slate-950/60 border border-slate-800 text-slate-350 text-xs px-3 py-2 rounded-lg focus:outline-none"
                    />
                </div>
            </div>

            {/* Financial summary metrics based on report parameters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-900/60 p-4 rounded-xl flex items-center gap-3.5">
                    <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Base Freight Total</p>
                        <p className="text-base font-bold text-slate-200">₹{totalFreight.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-900/60 p-4 rounded-xl flex items-center gap-3.5">
                    <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Net Profit Margin</p>
                        <p className="text-base font-bold text-slate-200">₹{totalProfit.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-900/60 p-4 rounded-xl flex items-center gap-3.5">
                    <div className="p-2.5 bg-rose-500/10 rounded-lg text-rose-400">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Outstanding Receivables</p>
                        <p className="text-base font-bold text-slate-200">₹{totalOutstanding.toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </div>

            {/* Reports List Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
                    Loading reports list...
                </div>
            ) : isError ? (
                <div className="flex items-center justify-center py-20 text-rose-500 text-sm">
                    Failed to fetch shipment reports.
                </div>
            ) : reportData?.data?.length === 0 ? (
                <div className="text-center bg-slate-900/40 border border-slate-900 border-dashed rounded-xl py-16">
                    <BadgeInfo className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs">No records matching parameters.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="overflow-x-auto glass-card -mx-0">
                        <table className="table-dark min-w-[1100px] text-xs">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '1.25rem' }}>LR Number</th>
                                    <th>Date</th>
                                    <th>Client Party</th>
                                    <th>Route corridor</th>
                                    <th>Freight Charge</th>
                                    <th>GST (INR)</th>
                                    <th>Payout</th>
                                    <th>Margin</th>
                                    <th>Payment Status</th>
                                    <th style={{ paddingRight: '1.25rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData?.data.map((s) => (
                                    <tr key={s._id}>
                                        <td style={{ paddingLeft: '1.25rem' }} className="py-4 font-semibold text-slate-200 uppercase">{s.lrNumber}</td>
                                        <td>{new Date(s.bookingDate).toLocaleDateString('en-IN')}</td>
                                        <td className="text-slate-350">{s.client?.companyName || 'N/A'}</td>
                                        <td className="text-slate-300 font-medium">
                                            <div className="flex items-center gap-1">
                                                <span>{s.origin?.city}</span>
                                                <ArrowRight className="w-3 h-3 text-slate-500" />
                                                <span>{s.destination?.city}</span>
                                            </div>
                                        </td>
                                        <td>₹{s.freightCharge?.toLocaleString('en-IN')}</td>
                                        <td>₹{s.gstAmount?.toLocaleString('en-IN')}</td>
                                        <td>₹{s.truckOwnerPayment?.toLocaleString('en-IN')}</td>
                                        <td className="text-emerald-400 font-semibold">₹{s.profit?.toLocaleString('en-IN')}</td>
                                        <td>
                                            <span className={`badge ${s.paymentStatus === 'paid'
                                                    ? 'badge-success'
                                                    : s.paymentStatus === 'partial'
                                                        ? 'badge-warning'
                                                        : 'badge-neutral'
                                                }`}>
                                                {s.paymentStatus || 'pending'}
                                            </span>
                                        </td>
                                        <td style={{ paddingRight: '1.25rem' }}>
                                            <span className="badge badge-info">{s.status?.replace('_', ' ')}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {reportData?.pagination && (
                        <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
                            <span>
                                Showing {((page - 1) * 10) + 1}-{Math.min(page * 10, reportData.pagination.total)} of {reportData.pagination.total} records
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-slate-900 rounded font-medium text-slate-300 transition-colors border border-slate-900"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(p + 1, reportData.pagination.pages))}
                                    disabled={page === reportData.pagination.pages}
                                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-slate-900 rounded font-medium text-slate-300 transition-colors border border-slate-900"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Reports;
