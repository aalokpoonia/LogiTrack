/**
 * controllers/brokerController.js
 *
 * CRUD operations for Broker master records.
 * Supports text search, pagination, status filtering, and soft delete.
 */

const Broker = require('../models/Broker');

// @desc    Get all brokers
// @route   GET /api/brokers
// @access  Private
exports.getBrokers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const query = { isDeleted: false };

        if (req.query.search) {
            query.$text = { $search: req.query.search };
        }

        if (req.query.isActive !== undefined) {
            query.isActive = req.query.isActive === 'true';
        }

        let sort = { name: 1 };
        if (req.query.search) {
            sort = { score: { $meta: 'textScore' } };
        }

        const brokers = await Broker.find(query)
            .select('-__v')
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await Broker.countDocuments(query);

        res.json({
            success: true,
            count: brokers.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            data: brokers,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single broker
// @route   GET /api/brokers/:id
// @access  Private
exports.getBroker = async (req, res, next) => {
    try {
        const broker = await Broker.findOne({ _id: req.params.id, isDeleted: false });

        if (!broker) {
            res.status(404);
            throw new Error('Broker not found');
        }

        res.json({ success: true, data: broker });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new broker
// @route   POST /api/brokers
// @access  Private
exports.createBroker = async (req, res, next) => {
    try {
        const brokerData = {
            ...req.body,
            createdBy: req.user.id,
        };

        const broker = await Broker.create(brokerData);

        res.status(201).json({ success: true, data: broker });
    } catch (error) {
        next(error);
    }
};

// @desc    Update broker
// @route   PUT /api/brokers/:id
// @access  Private
exports.updateBroker = async (req, res, next) => {
    try {
        let broker = await Broker.findOne({ _id: req.params.id, isDeleted: false });

        if (!broker) {
            res.status(404);
            throw new Error('Broker not found');
        }

        broker = await Broker.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json({ success: true, data: broker });
    } catch (error) {
        next(error);
    }
};

// @desc    Soft delete broker
// @route   DELETE /api/brokers/:id
// @access  Private
exports.deleteBroker = async (req, res, next) => {
    try {
        const broker = await Broker.findOne({ _id: req.params.id, isDeleted: false });

        if (!broker) {
            res.status(404);
            throw new Error('Broker not found');
        }

        broker.isDeleted = true;
        broker.isActive = false;
        await broker.save();

        res.json({ success: true, message: 'Broker soft-deleted successfully' });
    } catch (error) {
        next(error);
    }
};
