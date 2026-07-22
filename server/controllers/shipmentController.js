/**
 * controllers/shipmentController.js
 *
 * CRUD operations for Shipment records.
 * Supports text search, pagination, status filtering, date range filtering, and soft delete.
 */

const Shipment = require('../models/Shipment');
const { generateLRPDFStream, generateInvoicePDFStream } = require('../utils/pdfGenerator');
const https = require('https');

const CITY_COORDINATES = {
    'raipur': [81.6296, 21.2514],
    'bilaspur': [82.1409, 22.0797],
    'bhilai': [81.3509, 21.1938],
    'durg': [81.2849, 21.1904],
    'korba': [82.7501, 22.3595],
    'raigarh': [83.3950, 21.8974],
    'nagpur': [79.0882, 21.1458],
    'delhi': [77.2090, 28.6139],
    'mumbai': [72.8777, 19.0760],
    'kolkata': [88.3639, 22.5726],
};

const getRecommendedRouteDetails = (originCity, destCity) => {
    return new Promise((resolve) => {
        if (!originCity || !destCity) return resolve(null);
        
        const origin = originCity.trim().toLowerCase();
        const dest = destCity.trim().toLowerCase();
        
        const originCoords = CITY_COORDINATES[origin];
        const destCoords = CITY_COORDINATES[dest];
        
        if (!originCoords || !destCoords) return resolve(null);
        
        const url = `https://router.project-osrm.org/route/v1/driving/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?overview=false`;
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json && json.routes && json.routes.length > 0) {
                        const route = json.routes[0];
                        resolve({
                            distanceKm: Math.round(route.distance / 1000), // meters to km
                            durationMinutes: Math.round(route.duration / 60) // seconds to minutes
                        });
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => {
            resolve(null);
        });
    });
};

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

        if (req.body.origin?.city && req.body.destination?.city) {
            const routeDetails = await getRecommendedRouteDetails(req.body.origin.city, req.body.destination.city);
            if (routeDetails) {
                shipmentData.recommendedDistance = routeDetails.distanceKm;
                shipmentData.recommendedDurationMinutes = routeDetails.durationMinutes;
            }
        }

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

        // Fetch recommended route if origin/destination is changing
        const originCity = req.body.origin?.city || shipment.origin?.city;
        const destCity = req.body.destination?.city || shipment.destination?.city;
        if (originCity && destCity && (req.body.origin?.city || req.body.destination?.city)) {
            const routeDetails = await getRecommendedRouteDetails(originCity, destCity);
            if (routeDetails) {
                shipment.recommendedDistance = routeDetails.distanceKm;
                shipment.recommendedDurationMinutes = routeDetails.durationMinutes;
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

// @desc    Upload Proof of Delivery (POD) document
// @route   POST /api/shipments/:id/pod
// @access  Private
exports.uploadPOD = async (req, res, next) => {
    try {
        const shipment = await Shipment.findOne({ _id: req.params.id, isDeleted: false });

        if (!shipment) {
            res.status(404);
            throw new Error('Shipment not found');
        }

        if (!req.file) {
            res.status(400);
            throw new Error('Please upload a valid document file (JPG, PNG, PDF)');
        }

        const relativePath = `/uploads/pod/${req.file.filename}`;
        shipment.podImageUrl = relativePath;

        if (['delivered', 'in_transit', 'loading', 'booked'].includes(shipment.status)) {
            shipment.status = 'pod_received';
            shipment.podReceivedDate = new Date();
            shipment.statusHistory.push({
                status: 'pod_received',
                timestamp: new Date(),
                updatedBy: req.user.id,
                notes: `Proof of Delivery (POD) document uploaded: ${req.file.originalname}`,
            });
        }

        shipment.updatedBy = req.user.id;
        await shipment.save();

        res.json({
            success: true,
            message: 'POD document uploaded successfully',
            podImageUrl: relativePath,
            data: shipment,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Generate & Stream Lorry Receipt (LR) PDF
// @route   GET /api/shipments/:id/pdf/lr
// @access  Private
exports.generateLRPDF = async (req, res, next) => {
    try {
        const shipment = await Shipment.findOne({ _id: req.params.id, isDeleted: false })
            .populate('client', 'companyName contactPerson phone email gstNumber pan address');

        if (!shipment) {
            res.status(404);
            throw new Error('Shipment not found');
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="LR-${shipment.lrNumber}.pdf"`);

        generateLRPDFStream(shipment, res);
    } catch (error) {
        next(error);
    }
};

// @desc    Generate & Stream Tax Invoice PDF
// @route   GET /api/shipments/:id/pdf/invoice
// @access  Private
exports.generateInvoicePDF = async (req, res, next) => {
    try {
        const shipment = await Shipment.findOne({ _id: req.params.id, isDeleted: false })
            .populate('client', 'companyName contactPerson phone email gstNumber pan address');

        if (!shipment) {
            res.status(404);
            throw new Error('Shipment not found');
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="INVOICE-${shipment.lrNumber}.pdf"`);

        generateInvoicePDFStream(shipment, res);
    } catch (error) {
        next(error);
    }
};

