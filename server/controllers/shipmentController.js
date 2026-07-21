/**
 * controllers/shipmentController.js
 *
 * CRUD operations for Shipment records.
 * Supports text search, pagination, status filtering, date range filtering, and soft delete.
 */

const Shipment = require('../models/Shipment');

// @desc    Get all shipments
// @route   GET /api/shipments
// @access  Private
exports.getShipments = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const query = { isDeleted: false };

        // Search by LR Number or Vehicle Number
        if (req.query.search) {
            const cleanSearch = req.query.search.trim();
            query.$or = [
                { lrNumber: new RegExp(cleanSearch, 'i') },
                { vehicleNumber: new RegExp(cleanSearch, 'i') }
            ];
        }

        // Filter by status
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Filter by client ID
        if (req.query.client) {
            query.client = req.query.client;
        }

        // Filter by date range (bookingDate)
        if (req.query.startDate || req.query.endDate) {
            query.bookingDate = {};
            if (req.query.startDate) {
                query.bookingDate.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                // Set to end of the day
                const endDate = new Date(req.query.endDate);
                endDate.setHours(23, 59, 59, 999);
                query.bookingDate.$lte = endDate;
            }
        }

        const shipments = await Shipment.find(query)
            .populate('client', 'companyName contactPerson phone')
            .populate('createdBy', 'name')
            .sort({ bookingDate: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Shipment.countDocuments(query);

        res.json({
            success: true,
            count: shipments.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            data: shipments,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single shipment
// @route   GET /api/shipments/:id
// @access  Private
exports.getShipment = async (req, res, next) => {
    try {
        const shipment = await Shipment.findOne({ _id: req.params.id, isDeleted: false })
            .populate('client', 'companyName contactPerson phone email gstNumber pan address')
            .populate('createdBy', 'name')
            .populate('updatedBy', 'name')
            .populate('statusHistory.updatedBy', 'name');

        if (!shipment) {
            res.status(404);
            throw new Error('Shipment not found');
        }

        res.json({ success: true, data: shipment });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new shipment
// @route   POST /api/shipments
// @access  Private
exports.createShipment = async (req, res, next) => {
    try {
        const shipmentData = {
            ...req.body,
            createdBy: req.user.id,
        };

        // Note: pre-validate in schema will auto-generate lrNumber if not provided.
        // pre-save will calculate profit and totalAmount based on freightCharge, additionalCharges, gstAmount, truckOwnerPayment.
        const shipment = await Shipment.create(shipmentData);

        res.status(201).json({ success: true, data: shipment });
    } catch (error) {
        next(error);
    }
};

// @desc    Update shipment details / status
// @route   PUT /api/shipments/:id
// @access  Private
exports.updateShipment = async (req, res, next) => {
    try {
        const shipment = await Shipment.findOne({ _id: req.params.id, isDeleted: false });

        if (!shipment) {
            res.status(404);
            throw new Error('Shipment not found');
        }

        const oldStatus = shipment.status;
        const newStatus = req.body.status;

        // If status changed, push to statusHistory
        if (newStatus && newStatus !== oldStatus) {
            shipment.statusHistory.push({
                status: newStatus,
                timestamp: new Date(),
                updatedBy: req.user.id,
                notes: req.body.statusNotes || `Status updated from ${oldStatus} to ${newStatus}`,
            });

            // Handle date mappings based on status changes
            if (newStatus === 'delivered') {
                shipment.actualDeliveryDate = new Date();
            } else if (newStatus === 'pod_received') {
                shipment.podReceivedDate = new Date();
            } else if (newStatus === 'invoiced') {
                shipment.invoiceDate = new Date();
            } else if (newStatus === 'paid') {
                shipment.paymentDate = new Date();
            }
        }

        // Apply fields from body
        Object.keys(req.body).forEach((key) => {
            if (key !== 'statusHistory' && key !== 'lrNumber') {
                shipment[key] = req.body[key];
            }
        });

        shipment.updatedBy = req.user.id;

        // Save will trigger the pre-save calculations (totalAmount, profit)
        const updatedShipment = await shipment.save();

        res.json({ success: true, data: updatedShipment });
    } catch (error) {
        next(error);
    }
};

// @desc    Soft delete shipment
// @route   DELETE /api/shipments/:id
// @access  Private
exports.deleteShipment = async (req, res, next) => {
    try {
        const shipment = await Shipment.findOne({ _id: req.params.id, isDeleted: false });

        if (!shipment) {
            res.status(404);
            throw new Error('Shipment not found');
        }

        shipment.isDeleted = true;
        shipment.updatedBy = req.user.id;

        await shipment.save();

        res.json({ success: true, message: 'Shipment soft-deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get shipment timeline (status history)
// @route   GET /api/shipments/:id/timeline
// @access  Private
exports.getShipmentTimeline = async (req, res, next) => {
    try {
        const shipment = await Shipment.findOne({ _id: req.params.id, isDeleted: false })
            .select('statusHistory lrNumber status')
            .populate('statusHistory.updatedBy', 'name');

        if (!shipment) {
            res.status(404);
            throw new Error('Shipment not found');
        }

        res.json({
            success: true,
            lrNumber: shipment.lrNumber,
            currentStatus: shipment.status,
            timeline: shipment.statusHistory,
        });
    } catch (error) {
        next(error);
    }
};
