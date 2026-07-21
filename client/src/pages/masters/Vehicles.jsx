/**
 * pages/masters/Vehicles.jsx
 *
 * Vehicle Management panel.
 * Full CRUD. Supports tracking RC, Insurance, Permit, and Fitness expiries with status colors.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Search, Plus, Edit2, Trash2, X, AlertTriangle,
    BadgeInfo, Truck, Calendar, ShieldAlert
} from 'lucide-react';
import {
    useVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle
} from '../../hooks/useVehicles';
import useAuth from '../../hooks/useAuth';
import { ROLES } from '../../config/constants';

const VEHICLE_TYPES = [
    { value: 'open_body', label: 'Open Body Truck' },
    { value: 'closed_body', label: 'Closed Body Container' },
    { value: 'flat_bed', label: 'Flatbed Trailer' },
    { value: 'trailer', label: 'Multi-axle Trailer' },
    { value: 'container', label: '20ft/40ft Container' },
    { value: 'lorry', label: 'Standard Lorry' },
    { value: 'dumper', label: 'Dumper Tipper' },
];

const Vehicles = () => {
    const { user } = useAuth();
    const canDelete = user && [ROLES.ADMIN, ROLES.OPERATIONS].includes(user.role);

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const { data: vehiclesData, isLoading, isError } = useVehicles({
        page,
        limit: 8,
        search,
        vehicleType: typeFilter === '' ? undefined : typeFilter,
    });

    const createMutation = useCreateVehicle();
    const updateMutation = useUpdateMutation => useUpdateVehicle();
    const deleteMutation = useDeleteVehicle();

    const { register, handleSubmit, reset } = useForm();

    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toISOString().split('T')[0];
    };

    const handleOpenCreate = () => {
        setSelectedVehicle(null);
        reset({
            vehicleNumber: '',
            vehicleType: 'open_body',
            ownerName: '',
            ownerPhone: '',
            rcExpiry: '',
            fitnessExpiry: '',
            insuranceExpiry: '',
            permitExpiry: '',
            notes: '',
            isActive: true,
        });
        setIsFormOpen(true);
    };

    const handleOpenEdit = (vehicle) => {
        setSelectedVehicle(vehicle);
        reset({
            vehicleNumber: vehicle.vehicleNumber || '',
            vehicleType: vehicle.vehicleType || 'open_body',
            ownerName: vehicle.ownerName || '',
            ownerPhone: vehicle.ownerPhone || '',
            rcExpiry: formatDateForInput(vehicle.rcExpiry),
            fitnessExpiry: formatDateForInput(vehicle.fitnessExpiry),
            insuranceExpiry: formatDateForInput(vehicle.insuranceExpiry),
            permitExpiry: formatDateForInput(vehicle.permitExpiry),
            notes: vehicle.notes || '',
            isActive: vehicle.isActive ?? true,
        });
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            // Clean empty dates to undefined
            const cleanedData = { ...formData };
            ['rcExpiry', 'fitnessExpiry', 'insuranceExpiry', 'permitExpiry'].forEach(field => {
                if (!cleanedData[field]) {
                    delete cleanedData[field];
                }
            });

            if (selectedVehicle) {
                await updateMutation.mutateAsync({ id: selectedVehicle._id, ...cleanedData });
            } else {
                await createMutation.mutateAsync(cleanedData);
            }
            setIsFormOpen(false);
        } catch (error) {
            console.error('Submit vehicle failed:', error);
        }
    };

    const handleDeleteSubmit = async () => {
        if (!selectedVehicle) return;
        try {
            await deleteMutation.mutateAsync(selectedVehicle._id);
            setIsDeleteOpen(false);
            setSelectedVehicle(null);
        } catch (error) {
            console.error('Delete vehicle failed:', error);
        }
    };

    const checkComplianceAlert = (dateStr) => {
        if (!dateStr) return 'text-slate-500';
        const expiry = new Date(dateStr);
        const today = new Date();
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'text-rose-500 font-bold'; // Expired
        if (diffDays <= 30) return 'text-amber-500 font-semibold'; // Expires within 30 days
        return 'text-slate-350';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-white uppercase tracking-wider">Vehicles</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Track fleet registrations, vehicle type configurations, and compliance documents.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-xs transition-colors self-start sm:self-auto shadow-lg"
                >
                    <Plus className="w-4 h-4" />
                    Register Vehicle
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900 border border-slate-900/60 p-4 rounded-xl">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search plate (e.g. CG04JD1234)..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-slate-950/60 border border-slate-800 text-white px-9 py-2 rounded-lg text-xs focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-slate-400 text-xs whitespace-nowrap">Type:</span>
                    <select
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                        className="bg-slate-950/60 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    >
                        <option value="">All Types</option>
                        {VEHICLE_TYPES.map(vt => (
                            <option key={vt.value} value={vt.value}>{vt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
                    Loading registered vehicles...
                </div>
            ) : isError ? (
                <div className="flex items-center justify-center py-20 text-rose-500 text-sm">
                    Failed to fetch vehicles from backend.
                </div>
            ) : vehiclesData?.data?.length === 0 ? (
                <div className="text-center bg-slate-900/40 border border-slate-900 border-dashed rounded-xl py-16">
                    <Truck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No vehicles listed matching search parameters.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="overflow-x-auto glass-card -mx-0">
                        <table className="table-dark min-w-[950px]">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '1.25rem' }}>Vehicle Number</th>
                                    <th>Type</th>
                                    <th>Owner</th>
                                    <th>Insurance Expiry</th>
                                    <th>Fitness Expiry</th>
                                    <th>Permit Expiry</th>
                                    <th>Status</th>
                                    <th style={{ paddingRight: '1.25rem' }} className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehiclesData?.data.map((v) => (
                                    <tr key={v._id}>
                                        <td style={{ paddingLeft: '1.25rem' }} className="py-4 font-bold text-sm tracking-wider text-slate-200">
                                            {v.vehicleNumber.slice(0, 4)} {v.vehicleNumber.slice(4, 6)} {v.vehicleNumber.slice(6, 8)} {v.vehicleNumber.slice(8)}
                                        </td>
                                        <td>
                                            <span className="text-xs text-slate-350 capitalize font-medium">
                                                {v.vehicleType?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="text-xs">
                                                <div className="text-slate-300 font-semibold">{v.ownerName}</div>
                                                <div className="text-slate-500 text-[10px] mt-0.5">{v.ownerPhone}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`text-xs ${checkComplianceAlert(v.insuranceExpiry)}`}>
                                                {v.insuranceExpiry ? new Date(v.insuranceExpiry).toLocaleDateString('en-IN') : 'No Expiry'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`text-xs ${checkComplianceAlert(v.fitnessExpiry)}`}>
                                                {v.fitnessExpiry ? new Date(v.fitnessExpiry).toLocaleDateString('en-IN') : 'No Expiry'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`text-xs ${checkComplianceAlert(v.permitExpiry)}`}>
                                                {v.permitExpiry ? new Date(v.permitExpiry).toLocaleDateString('en-IN') : 'No Expiry'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${v.isActive ? 'badge-success' : 'badge-neutral'}`}>
                                                {v.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ paddingRight: '1.25rem' }} className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(v)}
                                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedVehicle(v); setIsDeleteOpen(true); }}
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

                    {vehiclesData?.pagination && (
                        <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
                            <span>
                                Showing {((page - 1) * 8) + 1}-{Math.min(page * 8, vehiclesData.pagination.total)} of {vehiclesData.pagination.total} records
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
                                    onClick={() => setPage(p => Math.min(p + 1, vehiclesData.pagination.pages))}
                                    disabled={page === vehiclesData.pagination.pages}
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
                                {selectedVehicle ? 'Edit Vehicle Info' : 'Register New Fleet Vehicle'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-slate-400 mb-1">Vehicle License Plate *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="CG04JD1234"
                                        {...register('vehicleNumber')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white uppercase focus:outline-none"
                                    />
                                    <span className="text-[10px] text-slate-500 mt-1 block">Indian registration plate formats only (no space)</span>
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">Vehicle Type *</label>
                                    <select
                                        required
                                        {...register('vehicleType')}
                                        className="w-full bg-slate-950 border border-slate-855 rounded px-3 py-2 text-white focus:outline-none"
                                    >
                                        {VEHICLE_TYPES.map(vt => (
                                            <option key={vt.value} value={vt.value}>{vt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-405 mb-1">Owner Name *</label>
                                    <input
                                        type="text"
                                        required
                                        {...register('ownerName')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-405 mb-1">Owner Phone *</label>
                                    <input
                                        type="text"
                                        required
                                        {...register('ownerPhone')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    />
                                </div>
                            </div>

                            <hr className="border-slate-900 my-2" />
                            <div className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-wide">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Regulatory & Compliance Expiries</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-slate-950/40 p-3.5 rounded border border-slate-900">
                                <div>
                                    <label className="block text-slate-400 mb-1">Registration Certificate (RC) Expiry</label>
                                    <input
                                        type="date"
                                        {...register('rcExpiry')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">National/State Permit Expiry</label>
                                    <input
                                        type="date"
                                        {...register('permitExpiry')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">Road Fitness Certificate Expiry</label>
                                    <input
                                        type="date"
                                        {...register('fitnessExpiry')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">Commercial Insurance Expiry</label>
                                    <input
                                        type="date"
                                        {...register('insuranceExpiry')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white"
                                    />
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
                                    Save Vehicle
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
                                <h3 className="text-white font-bold text-sm">De-register Vehicle?</h3>
                                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                    Are you sure you want to soft-delete <strong>{selectedVehicle?.vehicleNumber}</strong>? Existing history is archived, but it will be unassignable for incoming freight shipments.
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

export default Vehicles;
