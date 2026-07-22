/**
 * pages/shipments/Shipments.jsx
 *
 * Shipment Management Panel.
 * Full CRUD, paginated list, filters by client/status/date-range, status transitions, and timeline view.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Search, Plus, Edit2, Trash2, X, AlertTriangle,
    BadgeInfo, Calendar, Clock, Eye, MapPin, Package,
    Receipt, CheckCircle, ArrowRight, ShieldAlert, ArrowUpDown,
    Download, Upload, FileText, FileCheck
} from 'lucide-react';
import {
    useShipments, useCreateShipment, useUpdateShipment, useDeleteShipment, useShipmentTimeline, useUploadShipmentPOD
} from '../../hooks/useShipments';
import { getShipmentLRPdfUrl, getShipmentInvoicePdfUrl } from '../../services/shipmentService';
import { useClients } from '../../hooks/useClients';
import { useBrokers } from '../../hooks/useBrokers';
import { useVehicles } from '../../hooks/useVehicles';
import { useDrivers } from '../../hooks/useDrivers';
import useAuth from '../../hooks/useAuth';
import { ROLES } from '../../config/constants';

const STATUS_OPTIONS = [
    { value: 'booked', label: 'Booked', color: 'badge-info' },
    { value: 'loading', label: 'Loading', color: 'badge-warning' },
    { value: 'in_transit', label: 'In Transit', color: 'badge-warning' },
    { value: 'delivered', label: 'Delivered', color: 'badge-success' },
    { value: 'pod_received', label: 'POD Received', color: 'badge-success' },
    { value: 'invoiced', label: 'Invoiced', color: 'badge-success' },
    { value: 'paid', label: 'Paid', color: 'badge-success' },
    { value: 'cancelled', label: 'Cancelled', color: 'badge-neutral' }
];

const VEHICLE_TYPES = [
    { value: 'open_body', label: 'Open Body' },
    { value: 'closed_body', label: 'Closed Body' },
    { value: 'flat_bed', label: 'Flat Bed' },
    { value: 'refrigerated', label: 'Refrigerated' },
    { value: 'tanker', label: 'Tanker' },
    { value: 'trailer', label: 'Trailer' }
];

const UNIT_OPTIONS = [
    { value: 'ton', label: 'Tons' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'bags', label: 'Bags' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'pieces', label: 'Pieces' }
];

const Shipments = () => {
    const { user } = useAuth();
    const canDelete = user && [ROLES.ADMIN].includes(user.role);

    // Filter states
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [clientFilter, setClientFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedShipment, setSelectedShipment] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);
    const [timelineShipmentId, setTimelineShipmentId] = useState(null);
    const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
    const [isPodUploadOpen, setIsPodUploadOpen] = useState(false);
    const [selectedPodFile, setSelectedPodFile] = useState(null);

    // Form setups
    const { register, handleSubmit, reset, setValue, watch } = useForm();
    const { register: registerStatus, handleSubmit: handleStatusSubmit, reset: resetStatus } = useForm();

    // Watch values for auto-fill and auto-calculate
    const watchFreight = watch('freightCharge', 0);
    const watchAdditional = watch('additionalCharges', 0);
    const watchGst = watch('gstAmount', 0);
    const watchPayout = watch('truckOwnerPayment', 0);

    const calculatedTotal = Number(watchFreight || 0) + Number(watchAdditional || 0) + Number(watchGst || 0);
    const calculatedProfit = Number(watchFreight || 0) - Number(watchPayout || 0);

    // Queries for main shipments list
    const { data: shipmentsData, isLoading, isError } = useShipments({
        page,
        limit: 8,
        search,
        status: statusFilter === '' ? undefined : statusFilter,
        client: clientFilter === '' ? undefined : clientFilter,
        startDate: startDate === '' ? undefined : startDate,
        endDate: endDate === '' ? undefined : endDate
    });

    // Queries for dropdown masters
    const { data: clientsData } = useClients({ limit: 100, isActive: 'true' });
    const { data: brokersData } = useBrokers({ limit: 100, isActive: 'true' });
    const { data: vehiclesData } = useVehicles({ limit: 100, isActive: 'true' });
    const { data: driversData } = useDrivers({ limit: 100, isActive: 'true' });

    // Timeline Query
    const { data: timelineData, isLoading: isTimelineLoading } = useShipmentTimeline(timelineShipmentId);

    // Mutations
    const createMutation = useCreateShipment();
    const updateMutation = useUpdateShipment();
    const deleteMutation = useDeleteShipment();
    const uploadPodMutation = useUploadShipmentPOD();

    // Autocomplete selections
    const handleBrokerChange = (e) => {
        const brokerId = e.target.value;
        const broker = brokersData?.data?.find(b => b._id === brokerId);
        if (broker) {
            setValue('truckOwnerName', broker.ownerName || broker.name);
            setValue('truckOwnerPhone', broker.phone);
        } else {
            setValue('truckOwnerName', '');
            setValue('truckOwnerPhone', '');
        }
    };

    const handleVehicleChange = (e) => {
        const vehicleId = e.target.value;
        const vehicle = vehiclesData?.data?.find(v => v._id === vehicleId);
        if (vehicle) {
            setValue('vehicleNumber', vehicle.vehicleNumber);
            setValue('vehicleType', vehicle.vehicleType || 'open_body');
            setValue('truckOwnerName', vehicle.ownerName);
            setValue('truckOwnerPhone', vehicle.ownerPhone);
        } else {
            setValue('vehicleNumber', '');
        }
    };

    const handleDriverChange = (e) => {
        const driverId = e.target.value;
        const driver = driversData?.data?.find(d => d._id === driverId);
        if (driver) {
            setValue('driverName', driver.name);
            setValue('driverPhone', driver.phone);
        } else {
            setValue('driverName', '');
            setValue('driverPhone', '');
        }
    };

    const handleOpenCreate = () => {
        setSelectedShipment(null);
        reset({
            client: '',
            truckOwnerName: '',
            truckOwnerPhone: '',
            driverName: '',
            driverPhone: '',
            vehicleNumber: '',
            vehicleType: 'open_body',
            origin: { city: '', state: 'Chhattisgarh' },
            destination: { city: '', state: '' },
            distance: 0,
            goodsDescription: '',
            weight: 0,
            unit: 'ton',
            quantity: 1,
            eWayBillNumber: '',
            freightCharge: 0,
            truckOwnerPayment: 0,
            additionalCharges: 0,
            gstAmount: 0,
            paymentStatus: 'pending',
            amountPaid: 0,
            expectedDeliveryDate: '',
            notes: '',
            status: 'booked'
        });
        setIsFormOpen(true);
    };

    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toISOString().split('T')[0];
    };

    const handleOpenEdit = (shipment) => {
        setSelectedShipment(shipment);
        reset({
            client: shipment.client?._id || shipment.client || '',
            truckOwnerName: shipment.truckOwnerName || '',
            truckOwnerPhone: shipment.truckOwnerPhone || '',
            driverName: shipment.driverName || '',
            driverPhone: shipment.driverPhone || '',
            vehicleNumber: shipment.vehicleNumber || '',
            vehicleType: shipment.vehicleType || 'open_body',
            origin: {
                city: shipment.origin?.city || '',
                state: shipment.origin?.state || 'Chhattisgarh'
            },
            destination: {
                city: shipment.destination?.city || '',
                state: shipment.destination?.state || ''
            },
            distance: shipment.distance || 0,
            goodsDescription: shipment.goodsDescription || '',
            weight: shipment.weight || 0,
            unit: shipment.unit || 'ton',
            quantity: shipment.quantity || 1,
            eWayBillNumber: shipment.eWayBillNumber || '',
            freightCharge: shipment.freightCharge || 0,
            truckOwnerPayment: shipment.truckOwnerPayment || 0,
            additionalCharges: shipment.additionalCharges || 0,
            gstAmount: shipment.gstAmount || 0,
            paymentStatus: shipment.paymentStatus || 'pending',
            amountPaid: shipment.amountPaid || 0,
            expectedDeliveryDate: formatDateForInput(shipment.expectedDeliveryDate),
            notes: shipment.notes || ''
        });
        setIsFormOpen(true);
    };

    const handleOpenPodUpload = (shipment) => {
        setSelectedShipment(shipment);
        setSelectedPodFile(null);
        setIsPodUploadOpen(true);
    };

    const handlePodUploadSubmit = async (e) => {
        e.preventDefault();
        if (!selectedShipment || !selectedPodFile) return;
        try {
            await uploadPodMutation.mutateAsync({
                id: selectedShipment._id,
                file: selectedPodFile,
            });
            setIsPodUploadOpen(false);
            setSelectedPodFile(null);
        } catch (error) {
            console.error('POD Upload failed:', error);
        }
    };

    const handleOpenStatusUpdate = (shipment) => {
        setSelectedShipment(shipment);
        resetStatus({
            status: shipment.status,
            statusNotes: ''
        });
        setIsStatusUpdateOpen(true);
    };

    const handleOpenTimeline = (shipmentId) => {
        setTimelineShipmentId(shipmentId);
        setIsTimelineOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            // Calculate GST automatically if it is 0 and freightCharge is provided (5% for standard road carriage)
            const cleanData = { ...formData };
            if (!cleanData.gstAmount || cleanData.gstAmount === 0) {
                cleanData.gstAmount = Math.round(cleanData.freightCharge * 0.05);
            }

            if (selectedShipment) {
                await updateMutation.mutateAsync({ id: selectedShipment._id, ...cleanData });
            } else {
                await createMutation.mutateAsync(cleanData);
            }
            setIsFormOpen(false);
        } catch (error) {
            console.error('Submit shipment failed:', error);
        }
    };

    const handleStatusUpdateSubmit = async (formData) => {
        if (!selectedShipment) return;
        try {
            await updateMutation.mutateAsync({
                id: selectedShipment._id,
                status: formData.status,
                statusNotes: formData.statusNotes
            });
            setIsStatusUpdateOpen(false);
        } catch (error) {
            console.error('Update status failed:', error);
        }
    };

    const handleDeleteSubmit = async () => {
        if (!selectedShipment) return;
        try {
            await deleteMutation.mutateAsync(selectedShipment._id);
            setIsDeleteOpen(false);
            setSelectedShipment(null);
        } catch (error) {
            console.error('Delete shipment failed:', error);
        }
    };

    const getStatusColorClass = (status) => {
        const option = STATUS_OPTIONS.find(o => o.value === status);
        return option ? option.color : 'badge-neutral';
    };

    const getStatusLabel = (status) => {
        const option = STATUS_OPTIONS.find(o => o.value === status);
        return option ? option.label : status;
    };

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-200 uppercase tracking-wider">Shipment bookings</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Manage freight bookings, lorry receipts, routing timelines, and financial profit calculation.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-xs transition-colors self-start sm:self-auto shadow-lg"
                >
                    <Plus className="w-4 h-4" />
                    Book Shipment (LR)
                </button>
            </div>

            {/* Filters shelf */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-slate-900 border border-slate-900/60 p-4 rounded-xl">
                {/* Search */}
                <div className="relative col-span-1 md:col-span-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search LR or Truck..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 px-9 py-2 rounded-lg text-xs focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Client filter */}
                <div>
                    <select
                        value={clientFilter}
                        onChange={(e) => { setClientFilter(e.target.value); setPage(1); }}
                        className="w-full bg-slate-950/60 border border-slate-800 text-slate-350 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    >
                        <option value="">All Clients</option>
                        {clientsData?.data?.map(c => (
                            <option key={c._id} value={c._id}>{c.companyName}</option>
                        ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="w-full bg-slate-950/60 border border-slate-800 text-slate-350 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    >
                        <option value="">All Statuses</option>
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Start Date */}
                <div className="relative">
                    <input
                        type="date"
                        value={startDate}
                        placeholder="Start Date"
                        onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                        className="w-full bg-slate-950/60 border border-slate-800 text-slate-350 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* End Date */}
                <div className="relative">
                    <input
                        type="date"
                        value={endDate}
                        placeholder="End Date"
                        onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                        className="w-full bg-slate-950/60 border border-slate-800 text-slate-350 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            {/* List Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
                    Loading shipments data...
                </div>
            ) : isError ? (
                <div className="flex items-center justify-center py-20 text-rose-500 text-sm">
                    Failed to fetch shipments from backend.
                </div>
            ) : shipmentsData?.data?.length === 0 ? (
                <div className="text-center bg-slate-900/40 border border-slate-900 border-dashed rounded-xl py-16">
                    <BadgeInfo className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No shipments booked matching search criteria.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="overflow-x-auto glass-card -mx-0">
                        <table className="table-dark min-w-[1100px]">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '1.25rem' }}>LR Info</th>
                                    <th>Client / Party</th>
                                    <th>Route Details</th>
                                    <th>Vehicle & Driver</th>
                                    <th>Finance Summary</th>
                                    <th>Booking Date</th>
                                    <th>Status</th>
                                    <th style={{ paddingRight: '1.25rem' }} className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shipmentsData?.data.map((s) => (
                                    <tr key={s._id}>
                                        <td style={{ paddingLeft: '1.25rem' }} className="py-4 font-semibold text-slate-200">
                                            <div>
                                                <span className="text-xs uppercase tracking-wider">{s.lrNumber}</span>
                                                {s.goodsDescription && (
                                                    <span className="block text-slate-500 text-[10px] mt-0.5 font-normal truncate max-w-[120px]">
                                                        {s.goodsDescription} ({s.weight} {s.unit})
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-slate-350 text-xs">
                                            <div>{s.client?.companyName || 'Unknown Client'}</div>
                                            <div className="text-slate-500 text-[10px] mt-0.5">{s.client?.contactPerson}</div>
                                        </td>
                                        <td className="text-slate-350 text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-semibold text-slate-200">{s.origin?.city}</span>
                                                <ArrowRight className="w-3 h-3 text-slate-500" />
                                                <span className="font-semibold text-slate-200">{s.destination?.city}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-0.5 space-y-0.5">
                                                <div>Entered: {s.distance ? `${s.distance} km` : 'N/A'}</div>
                                                {s.recommendedDistance && (
                                                    <div className="text-blue-400 font-medium">
                                                        Recommended: {s.recommendedDistance} km ({Math.round(s.recommendedDurationMinutes / 6) / 10} hrs)
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-slate-350 text-xs">
                                            <div className="font-semibold text-slate-200">{s.vehicleNumber || 'Unassigned'}</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">
                                                {s.driverName || 'No Driver'} {s.driverPhone ? `(${s.driverPhone})` : ''}
                                            </div>
                                        </td>
                                        <td className="text-slate-350 text-xs">
                                            <div className="flex flex-col gap-0.5">
                                                <div>
                                                    <span className="text-slate-400">Paid:</span>{' '}
                                                    <span className="font-semibold text-slate-200">₹{s.freightCharge?.toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="text-[10px] text-emerald-400">
                                                    <span>Margin: ₹{s.profit?.toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-slate-350 text-xs">
                                            <div>{new Date(s.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleOpenStatusUpdate(s)}
                                                className={`badge ${getStatusColorClass(s.status)} cursor-pointer hover:opacity-85 transition-opacity`}
                                                title="Click to update status"
                                            >
                                                {getStatusLabel(s.status)}
                                            </button>
                                        </td>
                                        <td style={{ paddingRight: '1.25rem' }} className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => window.open(getShipmentLRPdfUrl(s._id), '_blank')}
                                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded transition-colors"
                                                    title="Download Lorry Receipt (LR) PDF"
                                                >
                                                    <FileText className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => window.open(getShipmentInvoicePdfUrl(s._id), '_blank')}
                                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded transition-colors"
                                                    title="Download Tax Invoice PDF"
                                                >
                                                    <Receipt className="w-3.5 h-3.5" />
                                                </button>
                                                {s.podImageUrl ? (
                                                    <a
                                                        href={s.podImageUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-purple-400 rounded transition-colors"
                                                        title="View Signed POD"
                                                    >
                                                        <FileCheck className="w-3.5 h-3.5" />
                                                    </a>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenPodUpload(s)}
                                                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded transition-colors"
                                                        title="Upload Proof of Delivery (POD)"
                                                    >
                                                        <Upload className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleOpenTimeline(s._id)}
                                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                                                    title="View Timeline"
                                                >
                                                    <Clock className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEdit(s)}
                                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                                                    title="Edit Booking"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedShipment(s); setIsDeleteOpen(true); }}
                                                    disabled={!canDelete}
                                                    className="p-1.5 bg-slate-850 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 disabled:opacity-30 rounded transition-colors"
                                                    title="Delete Booking"
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

                    {/* Pagination */}
                    {shipmentsData?.pagination && (
                        <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
                            <span>
                                Showing {((page - 1) * 8) + 1}-{Math.min(page * 8, shipmentsData.pagination.total)} of {shipmentsData.pagination.total} bookings
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
                                    onClick={() => setPage(p => Math.min(p + 1, shipmentsData.pagination.pages))}
                                    disabled={page === shipmentsData.pagination.pages}
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
                    <div className="w-full max-w-2xl rounded-2xl p-6 flex flex-col justify-between overflow-y-auto max-h-[90vh] glass-modal">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                            <h3 className="text-slate-200 font-bold text-sm uppercase tracking-wider">
                                {selectedShipment ? `Modify Shipment booking: ${selectedShipment.lrNumber}` : 'Book New Shipment (Lorry Receipt)'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-xs">
                            {/* Section 1: Customer details */}
                            <div className="bg-slate-950/40 p-4 rounded border border-slate-900 space-y-3">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Client / Customer</p>
                                <div>
                                    <label className="block text-slate-400 mb-1">Select Client Party *</label>
                                    <select
                                        required
                                        {...register('client')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">-- Choose Client --</option>
                                        {clientsData?.data?.map(c => (
                                            <option key={c._id} value={c._id}>{c.companyName} ({c.contactPerson})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Section 2: Vehicle & Driver Allocation */}
                            <div className="bg-slate-950/40 p-4 rounded border border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1">Vehicle & Driver Allocation</p>
                                </div>

                                {/* Vehicle Autocomplete Dropdown */}
                                <div>
                                    <label className="block text-slate-400 mb-1">Select Registered Vehicle</label>
                                    <select
                                        onChange={handleVehicleChange}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">-- Select Registered Truck --</option>
                                        {vehiclesData?.data?.map(v => (
                                            <option key={v._id} value={v._id}>{v.vehicleNumber} ({v.ownerName})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Input Manual fields if needed */}
                                <div>
                                    <label className="block text-slate-400 mb-1">Vehicle plate Number *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="CG04JD1234"
                                        {...register('vehicleNumber')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none uppercase"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">Vehicle Type</label>
                                    <select
                                        {...register('vehicleType')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    >
                                        {VEHICLE_TYPES.map(vt => (
                                            <option key={vt.value} value={vt.value}>{vt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Driver Autocomplete Dropdown */}
                                <div>
                                    <label className="block text-slate-400 mb-1">Select Registered Driver</label>
                                    <select
                                        onChange={handleDriverChange}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">-- Select Driver --</option>
                                        {driversData?.data?.map(d => (
                                            <option key={d._id} value={d._id}>{d.name} ({d.phone})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">Allocated Driver Name</label>
                                    <input
                                        type="text"
                                        {...register('driverName')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">Driver Phone Number</label>
                                    <input
                                        type="text"
                                        {...register('driverPhone')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    />
                                </div>

                                {/* Broker Autocomplete */}
                                <div>
                                    <label className="block text-slate-400 mb-1">Select Registered Broker (Supplier)</label>
                                    <select
                                        onChange={handleBrokerChange}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">-- Select Broker --</option>
                                        {brokersData?.data?.map(b => (
                                            <option key={b._id} value={b._id}>{b.name} ({b.ownerName})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">Supplier/Truck Owner Name</label>
                                    <input
                                        type="text"
                                        {...register('truckOwnerName')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">Supplier/Truck Owner Phone</label>
                                    <input
                                        type="text"
                                        {...register('truckOwnerPhone')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Section 3: Route & Goods description */}
                            <div className="bg-slate-950/40 p-4 rounded border border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-3.5">
                                <div className="md:col-span-3">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Route & Cargo particulars</p>
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">Origin City *</label>
                                    <input
                                        type="text"
                                        required
                                        {...register('origin.city')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">Destination City *</label>
                                    <input
                                        type="text"
                                        required
                                        {...register('destination.city')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">Distance (km)</label>
                                    <input
                                        type="number"
                                        {...register('distance', { valueAsNumber: true })}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                    {selectedShipment?.recommendedDistance && (
                                        <p className="text-[10px] text-blue-400 mt-1 font-medium">
                                            OSRM Recommended: {selectedShipment.recommendedDistance} km ({Math.round(selectedShipment.recommendedDurationMinutes / 6) / 10} hrs)
                                        </p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-slate-400 mb-1">Cargo/Goods description</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 53-Grade OPC Cement Bags"
                                        {...register('goodsDescription')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">Weight / Load</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('weight', { valueAsNumber: true })}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">Unit</label>
                                    <select
                                        {...register('unit')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none"
                                    >
                                        {UNIT_OPTIONS.map(u => (
                                            <option key={u.value} value={u.value}>{u.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        {...register('quantity', { valueAsNumber: true })}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">E-Way Bill Number</label>
                                    <input
                                        type="text"
                                        {...register('eWayBillNumber')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Section 4: Economics / Financials */}
                            <div className="bg-slate-950/40 p-4 rounded border border-slate-900 grid grid-cols-1 md:grid-cols-4 gap-3.5">
                                <div className="md:col-span-4">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Financial details (Economics)</p>
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">Client Freight Charge *</label>
                                    <input
                                        type="number"
                                        required
                                        {...register('freightCharge', { valueAsNumber: true })}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-semibold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">Supplier Payout *</label>
                                    <input
                                        type="number"
                                        required
                                        {...register('truckOwnerPayment', { valueAsNumber: true })}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-semibold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">Additional Charges</label>
                                    <input
                                        type="number"
                                        {...register('additionalCharges', { valueAsNumber: true })}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">GST Amount (5% default)</label>
                                    <input
                                        type="number"
                                        placeholder="Auto if left 0"
                                        {...register('gstAmount', { valueAsNumber: true })}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">Payment Status</label>
                                    <select
                                        {...register('paymentStatus')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="partial">Partial</option>
                                        <option value="paid">Fully Paid</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">Amount Paid (₹)</label>
                                    <input
                                        type="number"
                                        {...register('amountPaid', { valueAsNumber: true })}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-semibold"
                                    />
                                </div>

                                <div className="md:col-span-2 bg-slate-950 p-2.5 rounded border border-slate-900/60 flex justify-between items-center text-xs">
                                    <span className="text-slate-500">Invoice Total:</span>
                                    <span className="font-bold text-white text-sm">₹{calculatedTotal?.toLocaleString('en-IN')}</span>
                                </div>

                                <div className="md:col-span-2 bg-slate-950 p-2.5 rounded border border-slate-900/60 flex justify-between items-center text-xs">
                                    <span className="text-slate-500">Net Profit Margin:</span>
                                    <span className={`font-bold text-sm ${calculatedProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                                        ₹{calculatedProfit?.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>

                            {/* Expected dates & Notes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-slate-400 mb-1">Expected Delivery Date</label>
                                    <input
                                        type="date"
                                        {...register('expectedDeliveryDate')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">Operational notes</label>
                                    <input
                                        type="text"
                                        {...register('notes')}
                                        className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
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
                                    Save Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Status Change Modal */}
            {isStatusUpdateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl p-5 glass-modal">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                            <h3 className="text-slate-200 font-bold text-sm">Update Shipment Status</h3>
                            <button onClick={() => setIsStatusUpdateOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleStatusSubmit(handleStatusUpdateSubmit)} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-400 mb-1">New Lifecycle Status</label>
                                <select
                                    required
                                    {...registerStatus('status')}
                                    className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                >
                                    {STATUS_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-400 mb-1">Status change / Transition notes</label>
                                <textarea
                                    {...registerStatus('statusNotes')}
                                    placeholder="Enter reason or update notes (e.g. Loaded at Raipur, gate pass received)"
                                    rows="3"
                                    className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-900">
                                <button
                                    type="button"
                                    onClick={() => setIsStatusUpdateOpen(false)}
                                    className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-850 text-slate-355"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateMutation.isLoading}
                                    className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50"
                                >
                                    Update Status
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Timeline View Modal */}
            {isTimelineOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl p-5 flex flex-col max-h-[80vh] glass-modal">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                            <div>
                                <h3 className="text-slate-200 font-bold text-sm">Status Timeline</h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">Lorry Receipt: {timelineData?.lrNumber || '...'}</p>
                            </div>
                            <button onClick={() => setIsTimelineOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {isTimelineLoading ? (
                            <div className="py-12 text-center text-xs text-slate-500">Loading timeline...</div>
                        ) : !timelineData?.timeline || timelineData.timeline.length === 0 ? (
                            <div className="py-12 text-center text-xs text-slate-500">No transition history logged.</div>
                        ) : (
                            <div className="flex-1 overflow-y-auto pr-1 py-2 space-y-4">
                                {timelineData.timeline.map((step, idx) => (
                                    <div key={step._id || idx} className="relative pl-6 pb-2 border-l border-slate-800 last:border-0 last:pb-0">
                                        {/* Dot indicator */}
                                        <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-slate-950 flex items-center justify-center">
                                            <div className="w-1 h-1 rounded-full bg-white" />
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center gap-4">
                                                <span className={`badge ${getStatusColorClass(step.status)}`}>
                                                    {getStatusLabel(step.status)}
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-medium">
                                                    {new Date(step.timestamp).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                            {step.notes && (
                                                <p className="text-slate-350 text-xs mt-1 bg-slate-950/40 p-2 rounded border border-slate-900/60 leading-relaxed font-sans">
                                                    {step.notes}
                                                </p>
                                            )}
                                            {step.updatedBy?.name && (
                                                <div className="text-[9px] text-slate-500 font-medium mt-0.5">
                                                    Actioned by: {step.updatedBy.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end pt-3 mt-4 border-t border-slate-900">
                            <button
                                onClick={() => setIsTimelineOpen(false)}
                                className="px-4 py-2 text-xs rounded bg-slate-900 hover:bg-slate-850 text-slate-350"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* POD Upload Modal */}
            {isPodUploadOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl p-5 glass-modal">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                            <h3 className="text-slate-200 font-bold text-sm">Upload Proof of Delivery (POD)</h3>
                            <button onClick={() => setIsPodUploadOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handlePodUploadSubmit} className="space-y-4 text-xs">
                            <div>
                                <p className="text-slate-400 text-xs mb-2">
                                    LR Number: <strong className="text-white">{selectedShipment?.lrNumber}</strong>
                                </p>
                                <label className="block text-slate-400 mb-1">Select File (JPG, PNG, PDF max 5MB)</label>
                                <input
                                    type="file"
                                    required
                                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                                    onChange={(e) => setSelectedPodFile(e.target.files[0])}
                                    className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-slate-300 text-xs focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-900">
                                <button
                                    type="button"
                                    onClick={() => setIsPodUploadOpen(false)}
                                    className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-850 text-slate-355"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploadPodMutation.isLoading || !selectedPodFile}
                                    className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50"
                                >
                                    Upload Document
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl p-5 glass-modal border-rose-500/20">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                                <ShieldAlert className="w-5 h-5 text-rose-500" />
                            </div>
                            <div>
                                <h3 className="text-slate-200 font-bold text-sm">Cancel & Delete Booking?</h3>
                                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                    Are you sure you want to soft-delete <strong>{selectedShipment?.lrNumber}</strong>? This will remove it from operational queues and profit aggregations.
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
                                disabled={deleteMutation.isLoading}
                                className="px-3.5 py-1.5 text-xs rounded bg-rose-600 hover:bg-rose-500 text-white font-medium transition-colors disabled:opacity-50"
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

export default Shipments;
