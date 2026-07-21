/**
 * controllers/clientController.js
 *
 * CRUD operations for Client master records.
 * Supports text search, pagination, status filtering, and soft delete.
 */

const Client = require('../models/Client');

// @desc    Get all clients (paginated, filtered, searchable)
// @route   GET /api/clients
// @access  Private
exports.getClients = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Build query
        const query = { isDeleted: false };

        // Search filter (text index on companyName)
        if (req.query.search) {
            query.$text = { $search: req.query.search };
        }

        // Status filter
        if (req.query.isActive !== undefined) {
            query.isActive = req.query.isActive === 'true';
        }

        // Sorting
        let sort = { companyName: 1 };
        if (req.query.search) {
            sort = { score: { $meta: 'textScore' } };
        }

        // Execute query
        const clients = await Client.find(query)
            .select('-__v')
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await Client.countDocuments(query);

        res.json({
            success: true,
            count: clients.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            data: clients,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single client by ID
// @route   GET /api/clients/:id
// @access  Private
exports.getClient = async (req, res, next) => {
    try {
        const client = await Client.findOne({ _id: req.params.id, isDeleted: false });

        if (!client) {
            res.status(404);
            throw new Error('Client not found');
        }

        res.json({ success: true, data: client });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new client
// @route   POST /api/clients
// @access  Private
exports.createClient = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Check if email already exists
        const existingClient = await Client.findOne({ email, isDeleted: false });
        if (existingClient) {
            res.status(400);
            throw new Error('Client with this email already exists');
        }

        const clientData = {
            ...req.body,
            createdBy: req.user.id,
        };

        const client = await Client.create(clientData);

        res.status(201).json({ success: true, data: client });
    } catch (error) {
        next(error);
    }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
exports.updateClient = async (req, res, next) => {
    try {
        let client = await Client.findOne({ _id: req.params.id, isDeleted: false });

        if (!client) {
            res.status(404);
            throw new Error('Client not found');
        }

        // Check if email is being updated to a duplicate
        if (req.body.email && req.body.email.toLowerCase() !== client.email.toLowerCase()) {
            const emailExists = await Client.findOne({ email: req.body.email, isDeleted: false });
            if (emailExists) {
                res.status(400);
                throw new Error('Client with this email already exists');
            }
        }

        client = await Client.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json({ success: true, data: client });
    } catch (error) {
        next(error);
    }
};

// @desc    Soft delete client
// @route   DELETE /api/clients/:id
// @access  Private
exports.deleteClient = async (req, res, next) => {
    try {
        const client = await Client.findOne({ _id: req.params.id, isDeleted: false });

        if (!client) {
            res.status(404);
            throw new Error('Client not found');
        }

        // Soft delete
        client.isDeleted = true;
        client.isActive = false;
        await client.save();

        res.json({ success: true, message: 'Client soft-deleted successfully' });
    } catch (error) {
        next(error);
    }
};
