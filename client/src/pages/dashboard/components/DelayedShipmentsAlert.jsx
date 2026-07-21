/**
 * DelayedShipmentsAlert.jsx — Active Delay Tracker
 *
 * Warning banner listing shipments that have breached their ETA.
 * Critical for brokerage ops to intervene when truck drivers are stuck.
 */

import { AlertTriangle, Clock, Phone, Truck } from 'lucide-react';

const DelayedShipmentsAlert = ({ data = [] }) => {
    if (data.length === 0) return null;

    return (
        <div
            className="flex flex-col md:flex-row items-stretch gap-4 p-4 rounded-xl border mb-6"
            style={{
                background: 'rgba(244, 63, 94, 0.05)',
                borderColor: 'rgba(244, 63, 94, 0.2)',
            }}
        >
            <div className="flex items-start gap-3 flex-1">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-rose-400 font-bold text-sm">
                        Delayed Shipments Warning ({data.length})
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                        The following vehicles are overdue at their destinations. Contact the drivers or truck owners immediately to update ETA.
                    </p>
                </div>
            </div>

            <div className="flex gap-2 flex-nowrap overflow-x-auto py-1 max-w-full md:max-w-2xl">
                {data.map((ship) => (
                    <div
                        key={ship._id}
                        className="flex-shrink-0 p-3 rounded-lg flex flex-col justify-between border w-64"
                        style={{
                            background: 'rgba(13, 20, 36, 0.5)',
                            borderColor: 'rgba(244, 63, 94, 0.15)',
                        }}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-white text-xs font-bold">{ship.lrNumber}</span>
                            <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/20">
                                <Clock className="w-2.5 h-2.5" />
                                {ship.delayDays}d Overdue
                            </span>
                        </div>
                        <p className="text-slate-300 text-[10px] truncate">
                            {ship.client?.companyName}
                        </p>
                        <p className="text-slate-400 text-[10px] mt-1.5 truncate">
                            To: {ship.destination?.city}
                        </p>

                        <div className="flex items-center justify-between border-t border-slate-800/60 mt-2.5 pt-2.5 text-[10px] text-slate-400">
                            <span className="inline-flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5 text-slate-500" />
                                {ship.vehicleNumber || 'No Truck'}
                            </span>
                            {ship.driverPhone ? (
                                <a
                                    href={`tel:${ship.driverPhone}`}
                                    className="inline-flex items-center gap-1 text-blue-400 hover:underline"
                                >
                                    <Phone className="w-3 h-3" />
                                    Call Driver
                                </a>
                            ) : (
                                <span className="text-slate-600">No Driver No</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DelayedShipmentsAlert;
