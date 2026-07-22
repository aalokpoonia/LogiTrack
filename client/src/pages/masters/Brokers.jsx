/**
 * pages/masters/Brokers.jsx
 *
 * Broker (Truck Supplier) Management panel.
 * Corresponds to "Truck Owners" navigation in LogiTrack admin.
 * Full CRUD with bank details section, trip history counters, and outstanding payables.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Search, Plus, Edit2, Trash2, X, AlertTriangle,
    BadgeInfo, Building2, CreditCard, ShieldAlert
} from 'lucide-react';
import {
    useBrokers, useCreateBroker, useUpdateBroker, useDeleteBroker
} from '../../hooks/useBrokers';
import useAuth from '../../hooks/useAuth';
import { ROLES } from '../../config/constants';

const Brokers = () => {
    const { user } = useAuth();
    const canDelete = user && [ROLES.ADMIN].includes(user.role);

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isActiveFilter, setIsActiveFilter] = useState('');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedBroker, setSelectedBroker] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const { data: brokersData, isLoading, isError } = useBrokers({
        page,
        limit: 8,
        search,
        isActive: isActiveFilter === '' ? undefined : isActiveFilter,
    });

    const createMutation = useCreateBroker();
    const updateMutation = useUpdateBroker();
    const deleteMutation = useDeleteBroker();

    const { register, handleSubmit, reset } = useForm();

    const handleOpenCreate = () => {
        setSelectedBroker(null);
        reset({
            name: '',
            ownerName: '',
            phone: '',
            alternatePhone: '',
            pan: '',
            accountDetails: {
                bankName: '',
                accountNo: '',
                ifscCode: '',
                accountHolder: '',
            },
            notes: '',
            isActive: true,
        });
        setIsFormOpen(true);
    };

    const handleOpenEdit = (broker) => {
        setSelectedBroker(broker);
        reset({
            name: broker.name || '',
            ownerName: broker.ownerName || '',
            phone: broker.phone || '',
            alternatePhone: broker.alternatePhone || '',
            pan: broker.pan || '',
            accountDetails: {
                bankName: broker.accountDetails?.bankName || '',
                accountNo: broker.accountDetails?.accountNo || '',
                ifscCode: broker.accountDetails?.ifscCode || '',
                accountHolder: broker.accountDetails?.accountHolder || '',
            },
            notes: broker.notes || '',
            isActive: broker.isActive ?? true,
        });
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (selectedBroker) {
                await updateMutation.mutateAsync({ id: selectedBroker._id, ...formData });
            } else {
                await createMutation.mutateAsync(formData);
            }
            setIsFormOpen(false);
        } catch (error) {
            console.error('Submit broker failed:', error);
        }
    };

    const handleDeleteSubmit = async () => {
        if (!selectedBroker) return;
        try {
            await deleteMutation.mutateAsync(selectedBroker._id);
            setIsDeleteOpen(false);
            setSelectedBroker(null);
        } catch (error) {
            console.error('Delete broker failed:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-200 uppercase tracking-wider">Truck Owners / Brokers</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Manage market transport vendors, hired fleets, and bank payment clearances.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-xs transition-colors self-start sm:self-auto shadow-lg"
                >
                    <Plus className="w-4 h-4" />
                    Add Vendor
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900 border border-slate-900/60 p-4 rounded-xl">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by vendor/owner..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 px-9 py-2 rounded-lg text-xs focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-slate-400 text-xs whitespace-nowrap">Status:</span>
                    <select
                        value={isActiveFilter}
                        onChange={(e) => { setIsActiveFilter(e.target.value); setPage(1); }}
                        className="bg-slate-950/60 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    >
                        <option value="">All Statuses</option>
                        <option value="true">Active Only</option>
                        <option value="false">Inactive Only</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
                    Loading vendors list...
                </div>
            ) : isError ? (
                <div className="flex items-center justify-center py-20 text-rose-500 text-sm">
                    Failed to fetch brokers from backend.
                </div>
            ) : brokersData?.data?.length === 0 ? (
                <div className="text-center bg-slate-900/40 border border-slate-900 border-dashed rounded-xl py-16">
                    <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No brokerage vendors listed matching filter parameters.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="overflow-x-auto glass-card -mx-0">
                        <table className="table-dark min-w-[900px]">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '1.25rem' }}>Vendor Name</th>
                                    <th>Owner</th>
                                    <th>Contact No.</th>
                                    <th>IFSC / Bank Details</th>
                                    <th>Total Trips</th>
                                    <th>Balance Due</th>
                                    <th>Status</th>
                                    <th style={{ paddingRight: '1.25rem' }} className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {brokersData?.data.map((b) => (
                                    <tr key={b._id}>
                                        <td style={{ paddingLeft: '1.25rem' }} className="py-4">
                                            <div>
                                                <span className="text-white font-semibold text-sm">{b.name}</span>
                                                {b.pan && <span className="block text-slate-505 text-[10px] uppercase font-medium mt-0.5">PAN: {b.pan}</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-slate-300 text-xs font-semibold">{b.ownerName}</span>
                                        </td>
                                        <td>
                                            <div className="text-slate-300 text-xs">
                                                <div>{b.phone}</div>
                                                {b.alternatePhone && <div className="text-slate-500 text-[10px] mt-0.5">{b.alternatePhone}</div>}
                                            </div>
                                        </td>
                                        <td>
                                            {b.accountDetails?.bankName ? (
                                                <div className="text-xs">
                                                    <span className="text-slate-300 font-semibold">{b.accountDetails.bankName}</span>
                                                    <span className="block text-slate-500 text-[10px] mt-0.5">A/C: {b.accountDetails.accountNo} ({b.accountDetails.ifscCode})</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-600 text-xs italic">Not Provided</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="text-slate-300 font-bold text-xs">{b.totalTrips || 0} trips</span>
                                        </td>
                                        <td>
                                            <span className={`text-sm font-semibold ${b.outstandingBalance > 0 ? 'text-rose-405 font-bold' : 'text-slate-400'}`}>
                                                ₹{Number(b.outstandingBalance || 0).toLocaleString('en-IN')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${b.isActive ? 'badge-success' : 'badge-neutral'}`}>
                                                {b.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ paddingRight: '1.25rem' }} className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(b)}
                                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedBroker(b); setIsDeleteOpen(true); }}
                                                    disabled={!canDelete}
                                                    className="p-1.5 bg-slate-850 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 disabled:opacity-30 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {brokersData?.pagination && (
                        <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
                            <span>
                                Showing {((page - 1) * 8) + 1}-{Math.min(page * 8, brokersData.pagination.total)} of {brokersData.pagination.total} records
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
                                    onClick={() => setPage(p => Math.min(p + 1, brokersData.pagination.pages))}
                                    disabled={page === brokersData.pagination.pages}
                                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-slate-900 rounded font-medium text-slate-300 transition-colors border border-slate-900"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-xl rounded-2xl p-6 flex flex-col justify-between overflow-y-auto max-h-[90vh] glass-modal">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                            <h3 className="text-slate-200 font-bold text-sm uppercase tracking-wider">
                                {selectedBroker ? 'Edit Vendor Record' : 'Register New Vendor / Broker'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-slate-400 mb-1">Company / Vendor Name *</label>
                                    <input
                                        type="text"
                                        required
                                        {...register('name')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">Owner Name *</label>
                                    <input
                                        type="text"
                                        required
                                        {...register('ownerName')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">Phone Number *</label>
                                    <input
                                        type="text"
                                        required
                                        {...register('phone')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">Alternate Phone</label>
                                    <input
                                        type="text"
                                        {...register('alternatePhone')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">PAN Number</label>
                                    <input
                                        type="text"
                                        {...register('pan')}
                                        placeholder="ABCDE1234F"
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white uppercase focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-center gap-2 h-full pt-4">
                                    <input
                                        type="checkbox"
                                        id="isActiveBroker"
                                        {...register('isActive')}
                                        className="w-4 h-4 accent-blue-500"
                                    />
                                    <label htmlFor="isActiveBroker" className="text-slate-350 cursor-pointer">Vendor Active</label>
                                </div>
                            </div>

                            <hr className="border-slate-900 my-2" />
                            <div className="flex items-center gap-2 text-blue-400 mb-1 font-bold uppercase tracking-wide">
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Settlement / Bank Details</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-slate-950/40 p-3.5 rounded border border-slate-900">
                                <div>
                                    <label className="block text-slate-400 mb-1">Bank Name</label>
                                    <input
                                        type="text"
                                        {...register('accountDetails.bankName')}
                                        placeholder="State Bank of India"
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">Account Holder Name</label>
                                    <input
                                        type="text"
                                        {...register('accountDetails.accountHolder')}
                                        placeholder="As registered in bank"
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">Account Number</label>
                                    <input
                                        type="text"
                                        {...register('accountDetails.accountNo')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">IFSC Code</label>
                                    <input
                                        type="text"
                                        {...register('accountDetails.ifscCode')}
                                        placeholder="SBIN0000123"
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white uppercase focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 mb-1">Vendor Notes</label>
                                <textarea
                                    {...register('notes')}
                                    rows="2"
                                    className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-900">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-850 text-slate-355"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isLoading || updateMutation.isLoading}
                                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md transition-colors disabled:opacity-50"
                                >
                                    Save Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl p-5 glass-modal border-rose-500/20">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                                <ShieldAlert className="w-5 h-5 text-rose-500" />
                            </div>
                            <div>
                                <h3 className="text-slate-200 font-bold text-sm">Delete Vendor Profile?</h3>
                                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                    Are you sure you want to soft-delete <strong>{selectedBroker?.name}</strong>? Outstanding settlements will still be accessible, but they cannot be hired on new shipments.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                onClick={() => setIsDeleteOpen(false)}
                                className="px-3.5 py-1.5 text-xs rounded bg-slate-900 hover:bg-slate-850 text-slate-350"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteSubmit}
                                disabled={deleteMutation.isLoading}
                                className="px-3.5 py-1.5 text-xs rounded bg-rose-600 hover:bg-rose-505 text-white font-medium transition-colors disabled:opacity-50"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Brokers;
