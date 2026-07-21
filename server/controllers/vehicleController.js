/**
 * controllers/vehicleController.js
 *
 * CRUD operations for Vehicle master records.
 * Supports text search, pagination, status filtering, and soft delete.
 */

const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private
exports.getVehicles = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const query = { isDeleted: false };

        // Search by vehicle number
        if (req.query.search) {
            const cleanSearch = req.query.search.replace(/\s+/g, '').toUpperCase();
            query.vehicleNumber = new RegExp(cleanSearch, 'i');
        }

        if (req.query.vehicleType) {
            query.vehicleType = req.query.vehicleType;
        }

        if (req.query.isActive !== undefined) {
            query.isActive = req.query.isActive === 'true';
        }

        const vehicles = await Vehicle.find(query)
            .select('-__v')
            .sort({ vehicleNumber: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Vehicle.countDocuments(query);

        res.json({
            success: true,
            count: vehicles.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            data: vehicles,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
exports.getVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findOne({ _id: req.params.id, isDeleted: false });

        if (!vehicle) {
            res.status(404);
            throw new Error('Vehicle not found');
        }

        res.json({ success: true, data: vehicle });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private
exports.createVehicle = async (req, res, next) => {
    try {
        const { vehicleNumber } = req.body;
        const cleanNumber = (vehicleNumber || '').replace(/\s+/g, '').toUpperCase();

        // Check if vehicle exists
        const existingVehicle = await Vehicle.findOne({ vehicleNumber: cleanNumber, isDeleted: false });
        if (existingVehicle) {
            res.status(400);
            throw new Error('Vehicle number already registered');
        }

        const vehicleData = {
            ...req.body,
            createdBy: req.user.id,
        };

        const vehicle = await Vehicle.create(vehicleData);

        res.status(201).json({ success: true, data: vehicle });
    } catch (error) {
        next(error);
    }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
exports.updateVehicle = async (req, res, next) => {
    try {
        let vehicle = await Vehicle.findOne({ _id: req.params.id, isDeleted: false });

        if (!vehicle) {
            res.status(404);
            throw new Error('Vehicle not found');
        }

        if (req.body.vehicleNumber) {
            const cleanNumber = req.body.vehicleNumber.replace(/\s+/g, '').toUpperCase();
            if (cleanNumber !== vehicle.vehicleNumber) {
                const vehicleExists = await Vehicle.findOne({ vehicleNumber: cleanNumber, isDeleted: false });
                if (vehicleExists) {
                    res.status(400);
                    throw new Error('Vehicle number already registered');
                }
            }
        }

        vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json({ success: true, data: vehicle });
    } catch (error) {
        next(error);
    }
};

// @desc    Soft delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
exports.deleteVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findOne({ _id: req.params.id, isDeleted: false });

        if (!vehicle) {
            res.status(404);
            throw new Error('Vehicle not found');
        }

        vehicle.isDeleted = true;
        vehicle.isActive = false;
        await vehicle.save();

        res.json({ success: true, message: 'Vehicle soft-deleted successfully' });
    } catch (error) {
        next(error);
    }
};
