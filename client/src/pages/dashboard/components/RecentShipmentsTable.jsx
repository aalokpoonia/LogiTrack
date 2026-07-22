/**
 * RecentShipmentsTable.jsx — Last 10 Shipments
 *
 * Styled dark table showing LR Number, Client, Route, Status, Freight, Date.
 * Uses the global table-dark CSS class from index.css.
 */

const STATUS_CONFIG = {
    booked: { label: 'Booked', class: 'badge-info' },
    loading: { label: 'Loading', class: 'badge-warning' },
    in_transit: { label: 'In Transit', class: 'badge-info' },
    delivered: { label: 'Delivered', class: 'badge-success' },
    pod_received: { label: 'POD Received', class: 'badge-success' },
    invoiced: { label: 'Invoiced', class: 'badge-neutral' },
    paid: { label: 'Paid', class: 'badge-success' },
    cancelled: { label: 'Cancelled', class: 'badge-error' },
};

const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
    });
};

const RecentShipmentsTable = ({ data = [] }) => {
    return (
        <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-slate-300 font-semibold text-sm">Recent Shipments</h2>
                <span className="text-slate-500 text-xs">{data.length} latest</span>
            </div>

            {data.length === 0 ? (
                <div
                    className="border border-dashed rounded-xl p-10 text-center"
                    style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                >
                    <p className="text-slate-400 text-sm">No shipments found</p>
                </div>
            ) : (
                <div className="overflow-x-auto -mx-5">
                    <table className="table-dark" style={{ minWidth: 700 }}>
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '1.25rem' }}>LR Number</th>
                                <th>Client</th>
                                <th>Route</th>
                                <th>Status</th>
                                <th>Freight</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((s) => {
                                const statusInfo = STATUS_CONFIG[s.status] || { label: s.status, class: 'badge-neutral' };
                                return (
                                    <tr key={s._id || s.lrNumber}>
                                        <td style={{ paddingLeft: '1.25rem' }}>
                                            <span className="text-blue-400 font-semibold text-xs">
                                                {s.lrNumber}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-slate-200 text-sm">
                                                {s.client?.companyName || '—'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-slate-300 text-xs">
                                                {s.origin?.city} → {s.destination?.city}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${statusInfo.class}`}>
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-slate-300 font-medium text-sm">
                                                ₹{Number(s.freightCharge || 0).toLocaleString('en-IN')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-slate-400 text-xs">
                                                {formatDate(s.bookingDate)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RecentShipmentsTable;
