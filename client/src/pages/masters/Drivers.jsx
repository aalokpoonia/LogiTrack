/**
 * pages/masters/Drivers.jsx
 *
 * Driver Management panel.
 * Full CRUD. Supports tracking DL expiries and verification statuses.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Search, Plus, Edit2, Trash2, X, AlertTriangle,
    BadgeInfo, UserCheck, ShieldAlert
} from 'lucide-react';
import {
    useDrivers, useCreateDriver, useUpdateDriver, useDeleteDriver
} from '../../hooks/useDrivers';
import useAuth from '../../hooks/useAuth';
import { ROLES } from '../../config/constants';

const VERIFICATION_STATUSES = [
    { value: 'pending', label: 'Pending Verification' },
    { value: 'approved', label: 'Verified & Approved' },
    { value: 'rejected', label: 'Rejected / Disqualified' },
];

const Drivers = () => {
    const { user } = useAuth();
    const canDelete = user && [ROLES.ADMIN, ROLES.OPERATIONS].includes(user.role);

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [verificationFilter, setVerificationFilter] = useState('');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const { data: driversData, isLoading, isError } = useDrivers({
        page,
        limit: 8,
        search,
        verificationStatus: verificationFilter === '' ? undefined : verificationFilter,
    });

    const createMutation = useCreateDriver();
    const updateMutation = useUpdateDriver();
    const deleteMutation = useDeleteDriver();

    const { register, handleSubmit, reset } = useForm();

    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toISOString().split('T')[0];
    };

    const handleOpenCreate = () => {
        setSelectedDriver(null);
        reset({
            name: '',
            phone: '',
            alternatePhone: '',
            licenseNumber: '',
            licenseExpiry: '',
            verificationStatus: 'pending',
            isActive: true,
        });
        setIsFormOpen(true);
    };

    const handleOpenEdit = (driver) => {
        setSelectedDriver(driver);
        reset({
            name: driver.name || '',
            phone: driver.phone || '',
            alternatePhone: driver.alternatePhone || '',
            licenseNumber: driver.licenseNumber || '',
            licenseExpiry: formatDateForInput(driver.licenseExpiry),
            verificationStatus: driver.verificationStatus || 'pending',
            isActive: driver.isActive ?? true,
        });
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (selectedDriver) {
                await updateMutation.mutateAsync({ id: selectedDriver._id, ...formData });
            } else {
                await createMutation.mutateAsync(formData);
            }
            setIsFormOpen(false);
        } catch (error) {
            console.error('Submit driver failed:', error);
        }
    };

    const handleDeleteSubmit = async () => {
        if (!selectedDriver) return;
        try {
            await deleteMutation.mutateAsync(selectedDriver._id);
            setIsDeleteOpen(false);
            setSelectedDriver(null);
        } catch (error) {
            console.error('Delete driver failed:', error);
        }
    };

    const checkDLCompliance = (dateStr) => {
        if (!dateStr) return 'text-slate-500';
        const expiry = new Date(dateStr);
        const today = new Date();
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'text-rose-500 font-bold';
        if (diffDays <= 30) return 'text-amber-500 font-semibold';
        return 'text-slate-350';
    };

    const getVerificationBadge = (vStatus) => {
        switch (vStatus) {
            case 'approved':
                return 'badge-success';
            case 'rejected':
                return 'badge-danger';
            case 'pending':
            default:
                return 'badge-amber';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-white uppercase tracking-wider">Drivers</h1>
                    <p className="text-slate-505 text-xs mt-0.5">Manage operator payroll accounts, license renewals, and background safety reviews.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-xs transition-colors self-start sm:self-auto shadow-lg"
                >
                    <Plus className="w-4 h-4" />
                    Register Driver
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900 border border-slate-900/60 p-4 rounded-xl">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by driver name/DL..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-slate-950/60 border border-slate-800 text-white px-9 py-2 rounded-lg text-xs focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-slate-400 text-xs whitespace-nowrap">Verification:</span>
                    <select
                        value={verificationFilter}
                        onChange={(e) => { setVerificationFilter(e.target.value); setPage(1); }}
                        className="bg-slate-950/60 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    >
                        <option value="">All Drivers</option>
                        {VERIFICATION_STATUSES.map(vs => (
                            <option key={vs.value} value={vs.value}>{vs.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
                    Loading registered drivers...
                </div>
            ) : isError ? (
                <div className="flex items-center justify-center py-20 text-rose-500 text-sm">
                    Failed to fetch drivers from backend.
                </div>
            ) : driversData?.data?.length === 0 ? (
                <div className="text-center bg-slate-900/40 border border-slate-900 border-dashed rounded-xl py-16">
                    <UserCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No drivers listed matching safety parameters.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="overflow-x-auto glass-card -mx-0">
                        <table className="table-dark min-w-[900px]">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '1.25rem' }}>Driver Name</th>
                                    <th>Phone Number</th>
                                    <th>License Number</th>
                                    <th>License Expiry Date</th>
                                    <th>Verification</th>
                                    <th>Status</th>
                                    <th style={{ paddingRight: '1.25rem' }} className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {driversData?.data.map((d) => (
                                    <tr key={d._id}>
                                        <td style={{ paddingLeft: '1.25rem' }} className="py-4 font-semibold text-sm text-slate-205">
                                            {d.name}
                                        </td>
                                        <td>
                                            <div className="text-xs text-slate-350">
                                                <div>{d.phone}</div>
                                                {d.alternatePhone && <div className="text-slate-500 text-[10px] mt-0.5">{d.alternatePhone}</div>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">{d.licenseNumber}</span>
                                        </td>
                                        <td>
                                            <span className={`text-xs ${checkDLCompliance(d.licenseExpiry)}`}>
                                                {d.licenseExpiry ? new Date(d.licenseExpiry).toLocaleDateString('en-IN') : 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${getVerificationBadge(d.verificationStatus)}`}>
                                                {d.verificationStatus === 'approved' ? 'Approved' : d.verificationStatus === 'rejected' ? 'Rejected' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${d.isActive ? 'badge-success' : 'badge-neutral'}`}>
                                                {d.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ paddingRight: '1.25rem' }} className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(d)}
                                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedDriver(d); setIsDeleteOpen(true); }}
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

                    {driversData?.pagination && (
                        <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
                            <span>
                                Showing {((page - 1) * 8) + 1}-{Math.min(page * 8, driversData.pagination.total)} of {driversData.pagination.total} records
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
                                    onClick={() => setPage(p => Math.min(p + 1, driversData.pagination.pages))}
                                    disabled={page === driversData.pagination.pages}
                                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-slate-900 rounded font-medium text-slate-350 transition-colors border border-slate-900"
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
                    <div
                        className="w-full max-w-xl rounded-2xl border p-6 flex flex-col justify-between overflow-y-auto max-h-[90vh]"
                        style={{
                            background: 'rgba(13, 20, 36, 0.98)',
                            borderColor: 'rgba(255,255,255,0.08)',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
                        }}
                    >
                        <div className="flex items-center justify-between border-b border-slate-905 pb-3 mb-4">
                            <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                                {selectedDriver ? 'Edit Driver Info' : 'Onboard New Driver Partner'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-slate-400 mb-1">Driver Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        {...register('name')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">Mobile Phone *</label>
                                    <input
                                        type="text"
                                        required
                                        {...register('phone')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-405 mb-1 text-xs">Alternate Phone</label>
                                    <input
                                        type="text"
                                        {...register('alternatePhone')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-405 mb-1">License Expiry Date *</label>
                                    <input
                                        type="date"
                                        required
                                        {...register('licenseExpiry')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-405 mb-1">Driving License Number *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="CG04 20120045612"
                                        {...register('licenseNumber')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white uppercase focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-405 mb-1">Verification Status</label>
                                    <select
                                        required
                                        {...register('verificationStatus')}
                                        className="w-full bg-slate-950 border border-slate-855 rounded px-3 py-2 text-white focus:outline-none"
                                    >
                                        {VERIFICATION_STATUSES.map(vs => (
                                            <option key={vs.value} value={vs.value}>{vs.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 h-full pt-4 col-span-2">
                                    <input
                                        type="checkbox"
                                        id="isActiveDriver"
                                        {...register('isActive')}
                                        className="w-4 h-4 accent-blue-500"
                                    />
                                    <label htmlFor="isActiveDriver" className="text-slate-350 cursor-pointer">Capable & Available for hiring</label>
                                </div>
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
                                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md transition-colors"
                                >
                                    Save Driver
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                                <h3 className="text-white font-bold text-sm">De-register Driver?</h3>
                                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                    Are you sure you want to soft-delete <strong>{selectedDriver?.name}</strong>? Existing history will be archived, and they cannot be hired on active shipments.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                onClick={() => setIsDeleteOpen(false)}
                                className="px-3.5 py-1.5 text-xs rounded bg-slate-900 hover:bg-slate-850 text-slate-355"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteSubmit}
                                className="px-3.5 py-1.5 text-xs rounded bg-rose-600 hover:bg-rose-505 text-white font-medium transition-colors"
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

export default Drivers;
