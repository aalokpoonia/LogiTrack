/**
 * pages/masters/Clients.jsx
 *
 * Client (Party) Management panel.
 * Full CRUD with pagination, filtering, searching, and credit utilisation view.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Search, Plus, Edit2, Trash2, X, AlertTriangle,
    Check, ArrowUpDown, ShieldAlert, BadgeInfo
} from 'lucide-react';
import {
    useClients, useCreateClient, useUpdateClient, useDeleteClient
} from '../../hooks/useClients';
import useAuth from '../../hooks/useAuth';
import { ROLES } from '../../config/constants';

const Clients = () => {
    const { user } = useAuth();
    const canDelete = user && [ROLES.ADMIN, ROLES.ACCOUNTS].includes(user.role);

    // States for list options
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isActiveFilter, setIsActiveFilter] = useState('');

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Fetch queries
    const { data: clientsData, isLoading, isError } = useClients({
        page,
        limit: 8,
        search,
        isActive: isActiveFilter === '' ? undefined : isActiveFilter,
    });

    // Mutation hooks
    const createMutation = useCreateClient();
    const updateMutation = useUpdateClient();
    const deleteMutation = useDeleteClient();

    // Form setup
    const { register, handleSubmit, reset, setValue } = useForm();

    const handleOpenCreate = () => {
        setSelectedClient(null);
        reset({
            companyName: '',
            contactPerson: '',
            email: '',
            phone: '',
            alternatePhone: '',
            gstNumber: '',
            pan: '',
            address: { street: '', city: '', state: '', pincode: '' },
            creditLimit: 0,
            notes: '',
            isActive: true,
        });
        setIsFormOpen(true);
    };

    const handleOpenEdit = (client) => {
        setSelectedClient(client);
        reset({
            companyName: client.companyName || '',
            contactPerson: client.contactPerson || '',
            email: client.email || '',
            phone: client.phone || '',
            alternatePhone: client.alternatePhone || '',
            gstNumber: client.gstNumber || '',
            pan: client.pan || '',
            address: {
                street: client.address?.street || '',
                city: client.address?.city || '',
                state: client.address?.state || '',
                pincode: client.address?.pincode || '',
            },
            creditLimit: client.creditLimit || 0,
            notes: client.notes || '',
            isActive: client.isActive ?? true,
        });
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (selectedClient) {
                await updateMutation.mutateAsync({ id: selectedClient._id, ...formData });
            } else {
                await createMutation.mutateAsync(formData);
            }
            setIsFormOpen(false);
        } catch (error) {
            console.error('Submit client failed:', error);
        }
    };

    const handleDeleteSubmit = async () => {
        if (!selectedClient) return;
        try {
            await deleteMutation.mutateAsync(selectedClient._id);
            setIsDeleteOpen(false);
            setSelectedClient(null);
        } catch (error) {
            console.error('Delete client failed:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-white uppercase tracking-wider">Clients / Parties</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Manage customer billing accounts, credit limits, and contact profiles.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-xs transition-colors self-start sm:self-auto shadow-lg"
                >
                    <Plus className="w-4 h-4" />
                    Add Client
                </button>
            </div>

            {/* Filters shelf */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900 border border-slate-900/60 p-4 rounded-xl">
                {/* Search */}
                <div className="relative w-full sm:max-w-xs">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by company..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-slate-950/60 border border-slate-800 text-white px-9 py-2 rounded-lg text-xs focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Status Dropdown */}
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

            {/* List Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
                    Loading clients list...
                </div>
            ) : isError ? (
                <div className="flex items-center justify-center py-20 text-rose-500 text-sm">
                    Failed to fetch clients from backend.
                </div>
            ) : clientsData?.data?.length === 0 ? (
                <div className="text-center bg-slate-900/40 border border-slate-900 border-dashed rounded-xl py-16">
                    <BadgeInfo className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No clients listed matching filter parameters.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="overflow-x-auto glass-card -mx-0">
                        <table className="table-dark min-w-[900px]">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '1.25rem' }}>Company</th>
                                    <th>Contact</th>
                                    <th>GST / PAN</th>
                                    <th>Credit Details</th>
                                    <th>Outstanding</th>
                                    <th>Status</th>
                                    <th style={{ paddingRight: '1.25rem' }} className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientsData?.data.map((c) => {
                                    const cardUsed = c.creditLimit > 0 ? Math.min((c.outstandingBalance / c.creditLimit) * 100, 100) : 0;
                                    return (
                                        <tr key={c._id}>
                                            <td style={{ paddingLeft: '1.25rem' }} className="py-4">
                                                <div>
                                                    <span className="text-white font-semibold text-sm">{c.companyName}</span>
                                                    <span className="block text-slate-500 text-[10px] mt-0.5">{c.address?.city || 'No City'}, {c.address?.state || 'Chhattisgarh'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-slate-300 text-xs">
                                                    <div>{c.contactPerson}</div>
                                                    <div className="text-slate-500 text-[10px] mt-0.5">{c.phone}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-xs">
                                                    <span className="text-slate-300 font-semibold">{c.gstNumber || 'No GST'}</span>
                                                    <span className="block text-slate-500 text-[10px] mt-0.5">{c.pan || 'No PAN'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="max-w-[150px]">
                                                    <div className="flex justify-between text-[10px] mb-1">
                                                        <span className="text-slate-400">Limit: ₹{c.creditLimit?.toLocaleString('en-IN')}</span>
                                                        <span className={cardUsed > 80 ? 'text-rose-400 font-bold' : 'text-slate-500'}>{Math.round(cardUsed)}%</span>
                                                    </div>
                                                    <div className="h-1 bg-slate-800 rounded-full">
                                                        <div
                                                            className={`h-full rounded-full ${cardUsed > 80 ? 'bg-rose-500' : cardUsed > 50 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${cardUsed}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`text-sm font-semibold ${c.outstandingBalance > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                                                    ₹{Number(c.outstandingBalance).toLocaleString('en-IN')}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${c.isActive ? 'badge-success' : 'badge-neutral'}`}>
                                                    {c.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td style={{ paddingRight: '1.25rem' }} className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenEdit(c)}
                                                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedClient(c); setIsDeleteOpen(true); }}
                                                        disabled={!canDelete}
                                                        className="p-1.5 bg-slate-850 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 disabled:opacity-30 rounded transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {clientsData?.pagination && (
                        <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
                            <span>
                                Showing {((page - 1) * 8) + 1}-{Math.min(page * 8, clientsData.pagination.total)} of {clientsData.pagination.total} records
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
                                    onClick={() => setPage(p => Math.min(p + 1, clientsData.pagination.pages))}
                                    disabled={page === clientsData.pagination.pages}
                                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-slate-900 rounded font-medium text-slate-300 transition-colors border border-slate-900"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div
                        className="w-full max-w-xl rounded-2xl border p-6 flex flex-col justify-between overflow-y-auto max-h-[90vh]"
                        style={{
                            background: 'rgba(13, 20, 36, 0.98)',
                            borderColor: 'rgba(255,255,255,0.08)',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
                        }}
                    >
                        <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                            <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                                {selectedClient ? 'Edit Client Details' : 'Onboard New Customer'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-xs">
                            {/* Grid container */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-slate-400 mb-1">Company Name *</label>
                                    <input
                                        type="text"
                                        required
                                        {...register('companyName')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">Contact Person *</label>
                                    <input
                                        type="text"
                                        required
                                        {...register('contactPerson')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        {...register('email')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">Phone Number *</label>
                                    <input
                                        type="text"
                                        required
                                        {...register('phone')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">GSTIN</label>
                                    <input
                                        type="text"
                                        {...register('gstNumber')}
                                        placeholder="22AABCA1234F1ZL"
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 uppercase"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">PAN</label>
                                    <input
                                        type="text"
                                        {...register('pan')}
                                        placeholder="AABCA1234F"
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 uppercase"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">Credit Limit (₹) *</label>
                                    <input
                                        type="number"
                                        required
                                        {...register('creditLimit', { valueAsNumber: true })}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex items-center gap-2 h-full pt-4">
                                    <input
                                        type="checkbox"
                                        id="isActiveCheckbox"
                                        {...register('isActive')}
                                        className="w-4 h-4 accent-blue-500"
                                    />
                                    <label htmlFor="isActiveCheckbox" className="text-slate-350 cursor-pointer">Account Active</label>
                                </div>
                            </div>

                            <hr className="border-slate-900 my-2" />
                            <p className="text-[10px] text-slate-500 mb-1.5 font-bold uppercase tracking-wide">Client Address</p>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950/40 p-3 rounded border border-slate-900">
                                <div className="md:col-span-2">
                                    <label className="block text-slate-400 mb-1">Street Address</label>
                                    <input
                                        type="text"
                                        {...register('address.street')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">City</label>
                                    <input
                                        type="text"
                                        {...register('address.city')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">State</label>
                                    <input
                                        type="text"
                                        {...register('address.state')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 mb-1">Operational Notes</label>
                                <textarea
                                    {...register('notes')}
                                    rows="2"
                                    maxLength="500"
                                    className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-900">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-850 text-slate-350"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isLoading || updateMutation.isLoading}
                                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md transition-colors disabled:opacity-50"
                                >
                                    Save Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div
                        className="w-full max-w-sm rounded-2xl border p-5"
                        style={{
                            background: 'rgba(13, 20, 36, 0.98)',
                            borderColor: 'rgba(244, 63, 94, 0.2)',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
                        }}
                    >
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                                <ShieldAlert className="w-5 h-5 text-rose-500" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Delete Customer Profile?</h3>
                                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                    Are you sure you want to soft-delete <strong>{selectedClient?.companyName}</strong>? While active shipments are intact, new bookings will be restricted.
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

export default Clients;
