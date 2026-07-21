/**
 * scripts/seedDashboard.js
 *
 * Seeds the database with realistic freight brokerage data for dashboard development.
 *
 * BUSINESS CONTEXT:
 * - 6 real-ish client companies (cement, steel, chemicals — industries around Raipur/Bilaspur)
 * - 40 shipments spread over last 60 days with varied statuses
 * - Origins: Raipur, Bilaspur, Durg, Korba (CG industrial belt)
 * - Destinations: cities across India
 * - Realistic freight charges (₹15K–₹85K), profit margins (10–20%)
 *
 * RUN: cd server && node scripts/seedDashboard.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Client = require('../models/Client');
const Shipment = require('../models/Shipment');

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const CLIENTS = [
    {
        companyName: 'ACC Cement Ltd',
        contactPerson: 'Rajesh Agarwal',
        email: 'dispatch@acccement.example.com',
        phone: '7712345001',
        gstNumber: '22AABCA1234F1ZL',
        pan: 'AABCA1234F',
        address: { street: 'Jamul Cement Works', city: 'Raipur', state: 'Chhattisgarh', pincode: '490024' },
        creditLimit: 500000,
    },
    {
        companyName: 'Ambuja Cement',
        contactPerson: 'Sunil Tiwari',
        email: 'logistics@ambuja.example.com',
        phone: '7712345002',
        gstNumber: '22AABCA5678G1ZP',
        pan: 'AABCA5678G',
        address: { street: 'Bhatapara Plant', city: 'Raipur', state: 'Chhattisgarh', pincode: '493118' },
        creditLimit: 600000,
    },
    {
        companyName: 'JK Lakshmi Cement',
        contactPerson: 'Manoj Sharma',
        email: 'transport@jklakshmi.example.com',
        phone: '7712345003',
        gstNumber: '22BBJKL9012H1ZQ',
        pan: 'BBJKL9012H',
        address: { street: 'Durg Industrial Area', city: 'Durg', state: 'Chhattisgarh', pincode: '491001' },
        creditLimit: 400000,
    },
    {
        companyName: 'Shree Cement Ltd',
        contactPerson: 'Vikram Singh',
        email: 'freight@shreecement.example.com',
        phone: '7712345004',
        gstNumber: '22CCSCL3456J1ZR',
        pan: 'CCSCL3456J',
        address: { street: 'Baloda Bazar Road', city: 'Raipur', state: 'Chhattisgarh', pincode: '493332' },
        creditLimit: 450000,
    },
    {
        companyName: 'Raipur Steel Industries',
        contactPerson: 'Pradeep Gupta',
        email: 'logistics@raipursteel.example.com',
        phone: '7712345005',
        gstNumber: '22DDRSI7890K1ZS',
        pan: 'DDRSI7890K',
        address: { street: 'Urla Industrial Area', city: 'Raipur', state: 'Chhattisgarh', pincode: '493221' },
        creditLimit: 350000,
    },
    {
        companyName: 'Bilaspur Chemicals Pvt Ltd',
        contactPerson: 'Ankit Jain',
        email: 'dispatch@bilaspurchemicals.example.com',
        phone: '7712345006',
        gstNumber: '22EEBCPL2345L1ZT',
        pan: 'EEBCPL2345L',
        address: { street: 'MIDC Bilaspur', city: 'Bilaspur', state: 'Chhattisgarh', pincode: '495001' },
        creditLimit: 300000,
    },
];

const ORIGINS = [
    { city: 'Raipur', state: 'Chhattisgarh' },
    { city: 'Bilaspur', state: 'Chhattisgarh' },
    { city: 'Durg', state: 'Chhattisgarh' },
    { city: 'Korba', state: 'Chhattisgarh' },
    { city: 'Bhilai', state: 'Chhattisgarh' },
];

const DESTINATIONS = [
    { city: 'Delhi', state: 'Delhi' },
    { city: 'Mumbai', state: 'Maharashtra' },
    { city: 'Jaipur', state: 'Rajasthan' },
    { city: 'Ahmedabad', state: 'Gujarat' },
    { city: 'Hyderabad', state: 'Telangana' },
    { city: 'Chennai', state: 'Tamil Nadu' },
    { city: 'Lucknow', state: 'Uttar Pradesh' },
    { city: 'Chandigarh', state: 'Punjab' },
    { city: 'Nagpur', state: 'Maharashtra' },
    { city: 'Indore', state: 'Madhya Pradesh' },
    { city: 'Bhopal', state: 'Madhya Pradesh' },
    { city: 'Kolkata', state: 'West Bengal' },
    { city: 'Pune', state: 'Maharashtra' },
    { city: 'Varanasi', state: 'Uttar Pradesh' },
    { city: 'Patna', state: 'Bihar' },
];

const VEHICLE_TYPES = ['open_body', 'closed_body', 'flat_bed', 'trailer'];

const GOODS = [
    'OPC 53 Grade Cement', 'PPC Cement Bags', 'Fly Ash Cement',
    'TMT Steel Bars', 'MS Angles', 'Steel Coils',
    'Sulphuric Acid Drums', 'Caustic Soda', 'Industrial Chemicals',
    'Cement Clinker', 'Gypsum Bags', 'Limestone Aggregate',
];

const TRUCK_OWNERS = [
    { name: 'Raju Transport', phone: '9876543001' },
    { name: 'Sharma Roadways', phone: '9876543002' },
    { name: 'Gupta Logistics', phone: '9876543003' },
    { name: 'Singh Transport Co', phone: '9876543004' },
    { name: 'Patel Freight', phone: '9876543005' },
    { name: 'Yadav Truck Service', phone: '9876543006' },
    { name: 'Verma Transport', phone: '9876543007' },
];

const DRIVERS = [
    { name: 'Ramesh Kumar', phone: '9988776601' },
    { name: 'Suresh Yadav', phone: '9988776602' },
    { name: 'Mohan Lal', phone: '9988776603' },
    { name: 'Amit Patel', phone: '9988776604' },
    { name: 'Dinesh Sahu', phone: '9988776605' },
    { name: 'Kamlesh Verma', phone: '9988776606' },
    { name: 'Rajendra Singh', phone: '9988776607' },
    { name: 'Bhola Prasad', phone: '9988776608' },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateVehicleNumber = () => {
    const states = ['CG', 'MP', 'MH', 'RJ', 'UP', 'GJ', 'HR'];
    const st = pick(states);
    const dist = String(rand(1, 20)).padStart(2, '0');
    const alpha = 'ABCDEFGHJKLMNPRSTUVWXYZ';
    const letters = alpha[rand(0, alpha.length - 1)] + alpha[rand(0, alpha.length - 1)];
    const num = String(rand(1000, 9999));
    return `${st}${dist}${letters}${num}`;
};

const STATUSES_WEIGHTED = [
    'booked', 'booked',
    'loading',
    'in_transit', 'in_transit', 'in_transit', 'in_transit',
    'delivered', 'delivered', 'delivered',
    'pod_received', 'pod_received',
    'invoiced', 'invoiced', 'invoiced',
    'paid', 'paid', 'paid', 'paid', 'paid',
];

const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(rand(6, 20), rand(0, 59), 0, 0);
    return d;
};

// Realistic distance lookup (approximate km from CG)
const DISTANCE_MAP = {
    'Delhi': 1200, 'Mumbai': 1050, 'Jaipur': 1100, 'Ahmedabad': 950,
    'Hyderabad': 700, 'Chennai': 1250, 'Lucknow': 850, 'Chandigarh': 1400,
    'Nagpur': 280, 'Indore': 550, 'Bhopal': 500, 'Kolkata': 700,
    'Pune': 950, 'Varanasi': 750, 'Patna': 850,
};

// ─── MAIN SEED ────────────────────────────────────────────────────────────────

const seedDashboard = async () => {
    try {
        await connectDB();
        console.log('🌱 Seeding dashboard data...\n');

        // Clear existing data (safe for development)
        await Client.deleteMany({});
        await Shipment.deleteMany({});
        console.log('  ✓ Cleared existing clients and shipments');

        // Create clients
        const clients = await Client.insertMany(CLIENTS);
        console.log(`  ✓ Created ${clients.length} clients`);

        // Create shipments
        const shipments = [];
        let lrCounter = 1001;

        for (let i = 0; i < 40; i++) {
            const client = pick(clients);
            const origin = pick(ORIGINS);
            const destination = pick(DESTINATIONS);
            const status = pick(STATUSES_WEIGHTED);
            const truckOwner = pick(TRUCK_OWNERS);
            const driver = pick(DRIVERS);

            // Booking date: spread over last 60 days
            const bookingDaysAgo = rand(0, 60);
            const bookingDate = daysAgo(bookingDaysAgo);

            // Freight charge based on distance
            const distance = DISTANCE_MAP[destination.city] || 600;
            const baseFreight = Math.round((distance * rand(30, 55)) / 100) * 100; // ₹30-55 per km, rounded
            const freightCharge = Math.max(baseFreight, 15000); // Minimum ₹15K

            // Truck owner gets 80–90% of freight (broker margin 10–20%)
            const marginPercent = rand(10, 20);
            const truckOwnerPayment = Math.round(freightCharge * (1 - marginPercent / 100));

            // GST at 5% (road transport RCM)
            const gstAmount = Math.round(freightCharge * 0.05);
            const additionalCharges = rand(0, 3) === 0 ? rand(500, 3000) : 0;

            // Expected delivery: 1-5 days after booking depending on distance
            const transitDays = Math.ceil(distance / 400) + rand(0, 2);
            const expectedDelivery = new Date(bookingDate);
            expectedDelivery.setDate(expectedDelivery.getDate() + transitDays);

            // Actual delivery (for delivered+ statuses)
            let actualDeliveryDate = null;
            if (['delivered', 'pod_received', 'invoiced', 'paid'].includes(status)) {
                actualDeliveryDate = new Date(expectedDelivery);
                actualDeliveryDate.setDate(actualDeliveryDate.getDate() + rand(-1, 2)); // -1 to +2 days variance
            }

            // Payment status based on shipment status
            let paymentStatus = 'pending';
            let amountPaid = 0;
            if (status === 'paid') {
                paymentStatus = 'paid';
                amountPaid = freightCharge + additionalCharges + gstAmount;
            } else if (status === 'invoiced') {
                paymentStatus = rand(0, 2) === 0 ? 'partial' : 'pending';
                amountPaid = paymentStatus === 'partial' ? Math.round(freightCharge * 0.5) : 0;
            }

            const shipment = {
                lrNumber: `LT${String(lrCounter++).padStart(5, '0')}`,
                client: client._id,
                truckOwnerName: truckOwner.name,
                truckOwnerPhone: truckOwner.phone,
                driverName: driver.name,
                driverPhone: driver.phone,
                vehicleNumber: generateVehicleNumber(),
                vehicleType: pick(VEHICLE_TYPES),
                origin,
                destination,
                distance,
                goodsDescription: pick(GOODS),
                weight: rand(8, 30),
                unit: 'ton',
                quantity: rand(200, 800),
                freightCharge,
                truckOwnerPayment,
                additionalCharges,
                gstAmount,
                totalAmount: freightCharge + additionalCharges + gstAmount,
                profit: freightCharge - truckOwnerPayment,
                paymentStatus,
                amountPaid,
                bookingDate,
                expectedDeliveryDate: expectedDelivery,
                actualDeliveryDate,
                status,
                notes: '',
            };

            shipments.push(shipment);
        }

        // Use insertMany (skips pre-save hook — we already calculated totals)
        await Shipment.insertMany(shipments);
        console.log(`  ✓ Created ${shipments.length} shipments\n`);

        // Update client stats
        for (const client of clients) {
            const clientShipments = shipments.filter(
                (s) => s.client.toString() === client._id.toString()
            );
            const totalRevenue = clientShipments.reduce((sum, s) => sum + s.freightCharge, 0);
            const outstanding = clientShipments
                .filter((s) => s.paymentStatus !== 'paid')
                .reduce((sum, s) => sum + (s.freightCharge - s.amountPaid), 0);

            await Client.findByIdAndUpdate(client._id, {
                totalShipments: clientShipments.length,
                totalRevenue,
                outstandingBalance: outstanding,
            });
        }
        console.log('  ✓ Updated client statistics\n');

        // Print summary
        const statusCounts = {};
        shipments.forEach((s) => {
            statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
        });

        console.log('📊 Seed Summary:');
        console.log(`  Clients:   ${clients.length}`);
        console.log(`  Shipments: ${shipments.length}`);
        console.log('  Statuses:', statusCounts);
        console.log(`  Total Revenue: ₹${shipments.reduce((s, sh) => s + sh.freightCharge, 0).toLocaleString('en-IN')}`);
        console.log(`  Total Profit:  ₹${shipments.reduce((s, sh) => s + sh.profit, 0).toLocaleString('en-IN')}`);
        console.log('\n✅ Dashboard seed complete!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
};

seedDashboard();
