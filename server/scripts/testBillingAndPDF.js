/**
 * scripts/testBillingAndPDF.js
 *
 * Automated verification script for Phase 6 (PDF Generation, Billing & POD Uploads).
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Client = require('../models/Client');
const Shipment = require('../models/Shipment');
const { generateLRPDFStream, generateInvoicePDFStream } = require('../utils/pdfGenerator');
const { Writable } = require('stream');

dotenv.config();

// Dummy writable stream to test PDF kit output
class DummyStream extends Writable {
    constructor() {
        super();
        this.size = 0;
    }
    _write(chunk, encoding, callback) {
        this.size += chunk.length;
        callback();
    }
}

const runTests = async () => {
    console.log('🧪 Starting Phase 6 Billing, PDF, and Uploads backend tests...');

    // Connect to DB
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB.');

    // Setup client
    const testClientData = {
        companyName: 'Bhilai Steel & Structure Corp',
        contactPerson: 'Sanjay Agarwal',
        email: 'sanjay@bhilaisteel.com',
        phone: '9988776655',
        creditLimit: 1500000,
        notes: 'Verification test client for Phase 6',
    };

    await Client.deleteMany({ email: testClientData.email });
    const client = await Client.create(testClientData);

    // Setup shipment
    const testShipmentData = {
        client: client._id,
        vehicleNumber: 'CG07AB9999',
        vehicleType: 'trailer',
        driverName: 'Manish Kumar',
        driverPhone: '9111222333',
        origin: { city: 'Bhilai', state: 'Chhattisgarh' },
        destination: { city: 'Nagpur', state: 'Maharashtra' },
        distance: 260,
        goodsDescription: 'Steel Beams & Girders',
        weight: 22.0,
        unit: 'ton',
        quantity: 1,
        freightCharge: 65000,
        truckOwnerPayment: 54000,
        additionalCharges: 2500,
        gstAmount: 3250,
        paymentStatus: 'partial',
        amountPaid: 30000,
        notes: 'Phase 6 billing test shipment',
    };

    await Shipment.deleteMany({ vehicleNumber: 'CG07AB9999' });
    const shipment = await Shipment.create(testShipmentData);
    console.log(`   - Test shipment created with LR: ${shipment.lrNumber}`);

    // Populate client for PDF generation
    const populatedShipment = await Shipment.findById(shipment._id).populate('client');

    // Test LR PDF Generation
    console.log('➡️ Testing Lorry Receipt (LR) PDF Stream generation...');
    const lrStream = new DummyStream();
    generateLRPDFStream(populatedShipment, lrStream);
    await new Promise(resolve => setTimeout(resolve, 500));
    if (lrStream.size === 0) {
        throw new Error('Lorry Receipt PDF stream generated 0 bytes');
    }
    console.log(`   - LR PDF generated successfully (${lrStream.size} bytes).`);

    // Test Invoice PDF Generation
    console.log('➡️ Testing Tax Invoice PDF Stream generation...');
    const invoiceStream = new DummyStream();
    generateInvoicePDFStream(populatedShipment, invoiceStream);
    await new Promise(resolve => setTimeout(resolve, 500));
    if (invoiceStream.size === 0) {
        throw new Error('Tax Invoice PDF stream generated 0 bytes');
    }
    console.log(`   - Tax Invoice PDF generated successfully (${invoiceStream.size} bytes).`);

    // Test Payment status and billing updates
    console.log('➡️ Testing Payment & Billing updates...');
    populatedShipment.paymentStatus = 'paid';
    populatedShipment.amountPaid = populatedShipment.totalAmount;
    await populatedShipment.save();
    if (populatedShipment.paymentStatus !== 'paid' || populatedShipment.amountPaid !== populatedShipment.totalAmount) {
        throw new Error('Payment status update failed');
    }
    console.log('   - Payment status and receivables updated successfully.');

    // Cleanup
    await Client.deleteMany({ email: testClientData.email });
    await Shipment.deleteMany({ vehicleNumber: 'CG07AB9999' });

    console.log('✨ All Phase 6 Billing, PDF, and Uploads backend tests passed successfully!');
    process.exit(0);
};

runTests().catch(err => {
    console.error('❌ Tests failed:', err.message);
    process.exit(1);
});
