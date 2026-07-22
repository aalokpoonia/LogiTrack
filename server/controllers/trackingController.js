/**
 * controllers/trackingController.js
 *
 * Real-time GPS Tracking controllers for LogiTrack.
 * Manages active tracked shipments and location telemetry.
 */

const Shipment = require('../models/Shipment');

// @desc    Get all active shipments available for live tracking
// @route   GET /api/tracking/active
// @access  Private
exports.getActiveTrackedShipments = async (req, res, next) => {
    try {
        const shipments = await Shipment.find({
            isDeleted: false,
            status: { $in: ['in_transit', 'loading', 'booked'] }
        })
            .populate('client', 'companyName contactPerson phone')
            .sort({ bookingDate: -1 });

        res.json({
            success: true,
            count: shipments.length,
            data: shipments,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    REST fallback endpoint to post GPS location updates
// @route   POST /api/tracking/:id/location
// @access  Private
exports.updateLocationREST = async (req, res, next) => {
    try {
        const { lat, lng, speed, heading } = req.body;
        const shipmentId = req.params.id;

        const shipment = await Shipment.findOne({ _id: shipmentId, isDeleted: false });
        if (!shipment) {
            res.status(404);
            throw new Error('Shipment not found');
        }

        const io = req.app.get('io');
        if (io) {
            io.to(`shipment:${shipmentId}`).emit('location_updated', {
                shipmentId,
                lat,
                lng,
                speed: speed || 55,
                heading: heading || 90,
                timestamp: new Date().toISOString(),
            });
        }

        res.json({
            success: true,
            message: 'Location broadcasted successfully',
            location: { lat, lng, speed, heading },
        });
    } catch (error) {
        next(error);
    }
};
