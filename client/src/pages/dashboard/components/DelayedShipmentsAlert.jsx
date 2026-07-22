/**
 * DelayedShipmentsAlert.jsx — Active Delay Tracker (Compact & Collapsible)
 *
 * Warning banner listing shipments that have breached their ETA.
 * Styled as a compact dashboard card with collapsible details.
 */

import { useState } from 'react';
import { AlertTriangle, Clock, Phone, Truck, ChevronDown, ChevronUp } from 'lucide-react';

const DelayedShipmentsAlert = ({ data = [] }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    if (data.length === 0) return null;

    return (
        <div 
            className="glass-card p-4 border border-rose-500/10 transition-all duration-300" 
            style={{ background: 'rgba(244, 63, 94, 0.02)' }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-rose-450 font-bold text-xs">
                            Delayed Shipments ({data.length})
                        </h3>
                        <p className="text-slate-500 text-[10px] mt-0.5 font-medium">
                            Action required: vehicles overdue at destination
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 rounded bg-slate-900/40 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
            </div>

            {!isCollapsed && (
                <div className="mt-3.5 space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {data.map((ship) => (
                        <div
                            key={ship._id}
                            className="p-3 rounded-lg border text-[10px] flex flex-col justify-between"
                            style={{
                                background: 'rgba(13, 20, 36, 0.5)',
                                borderColor: 'rgba(244, 63, 94, 0.15)',
                            }}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-slate-200 font-bold">{ship.lrNumber}</span>
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/15">
                                    <Clock className="w-2.5 h-2.5" />
                                    {ship.delayDays}d Overdue
                                </span>
                            </div>
                            <p className="text-slate-400 truncate font-sans">
                                {ship.client?.companyName || '—'}
                            </p>
                            <p className="text-slate-500 mt-1 truncate">
                                To: {ship.destination?.city}
                            </p>

                            <div className="flex items-center justify-between border-t border-slate-800/60 mt-2 pt-2 text-[9px] text-slate-500">
                                <span className="inline-flex items-center gap-1 font-medium">
                                    <Truck className="w-3 h-3" />
                                    {ship.vehicleNumber || 'No Truck'}
                                </span>
                                {ship.driverPhone ? (
                                    <a
                                        href={`tel:${ship.driverPhone}`}
                                        className="inline-flex items-center gap-0.5 text-blue-400 hover:underline"
                                    >
                                        <Phone className="w-2.5 h-2.5" />
                                        Call Driver
                                    </a>
                                ) : (
                                    <span>No Phone</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DelayedShipmentsAlert;
