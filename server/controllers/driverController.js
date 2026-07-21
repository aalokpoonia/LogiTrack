/**
 * controllers/driverController.js
 *
 * CRUD operations for Driver master records.
 * Supports text search, pagination, status filtering, and soft delete.
 */

const Driver = require('../models/Driver');

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private
exports.getDrivers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const query = { isDeleted: false };

        if (req.query.search) {
            query.$text = { $search: req.query.search };
        }

        if (req.query.verificationStatus) {
            query.verificationStatus = req.query.verificationStatus;
        }

        if (req.query.isActive !== undefined) {
            query.isActive = req.query.isActive === 'true';
        }

        let sort = { name: 1 };
        if (req.query.search) {
            sort = { score: { $meta: 'textScore' } };
        }

        const drivers = await Driver.find(query)
            .select('-__v')
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await Driver.countDocuments(query);

        res.json({
            success: true,
            count: drivers.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            data: drivers,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single driver
// @route   GET /api/drivers/:id
// @access  Private
exports.getDriver = async (req, res, next) => {
    try {
        const driver = await Driver.findOne({ _id: req.params.id, isDeleted: false });

        if (!driver) {
            res.status(404);
            throw new Error('Driver not found');
        }

        res.json({ success: true, data: driver });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new driver
// @route   POST /api/drivers
// @access  Private
exports.createDriver = async (req, res, next) => {
    try {
        const { licenseNumber } = req.body;
        const cleanLicense = (licenseNumber || '').trim().toUpperCase();

        // Check duplicate active license
        const existingDriver = await Driver.findOne({ licenseNumber: cleanLicense, isDeleted: false });
        if (existingDriver) {
            res.status(400);
            throw new Error('Driver with this license number is already registered');
        }

        const driverData = {
            ...req.body,
            licenseNumber: cleanLicense,
            createdBy: req.user.id,
        };

        const driver = await Driver.create(driverData);

        res.status(201).json({ success: true, data: driver });
    } catch (error) {
        next(error);
    }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Private
exports.updateDriver = async (req, res, next) => {
    try {
        let driver = await Driver.findOne({ _id: req.params.id, isDeleted: false });

        if (!driver) {
            res.status(404);
            throw new Error('Driver not found');
        }

        if (req.body.licenseNumber) {
            const cleanLicense = req.body.licenseNumber.trim().toUpperCase();
            if (cleanLicense !== driver.licenseNumber) {
                const licenseExists = await Driver.findOne({ licenseNumber: cleanLicense, isDeleted: false });
                if (licenseExists) {
                    res.status(400);
                    throw new Error('Driver with this license number is already registered');
                }
            }
        }

        driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json({ success: true, data: driver });
    } catch (error) {
        next(error);
    }
};

// @desc    Soft delete driver
// @route   DELETE /api/drivers/:id
// @access  Private
exports.deleteDriver = async (req, res, next) => {
    try {
        const driver = await Driver.findOne({ _id: req.params.id, isDeleted: false });

        if (!driver) {
            res.status(404);
            throw new Error('Driver not found');
        }

        driver.isDeleted = true;
        driver.isActive = false;
        await driver.save();

        res.json({ success: true, message: 'Driver soft-deleted successfully' });
    } catch (error) {
        next(error);
    }
};
