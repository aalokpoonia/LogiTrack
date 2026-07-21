/**
 * utils/pdfGenerator.js
 *
 * Professional PDF Generation utility for LogiTrack using PDFKit.
 * Generates official Lorry Receipts (LR) and Invoices with region branding.
 */

const PDFDocument = require('pdfkit');

/**
 * Generate Lorry Receipt (LR) PDF
 */
exports.generateLRPDFStream = (shipment, res) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Stream PDF directly to Express response
    doc.pipe(res);

    // ─── HEADER BRANDING ──────────────────────────────────────────────────────
    doc.fillColor('#0F172A').fontSize(20).text('LOGITRACK LOGISTICS', 50, 50, { align: 'left' });
    doc.fontSize(8).fillColor('#64748B').text('REGIONAL FREIGHT CONTRACTORS & BROKERS', 50, 75);
    doc.fontSize(8).fillColor('#64748B').text('Raipur-Bilaspur Industrial Zone, Chhattisgarh, India', 50, 87);
    
    // Official badge
    doc.rect(380, 50, 165, 45).fill('#F8FAFC').stroke('#E2E8F0');
    doc.fillColor('#1E293B').fontSize(11).text('LORRY RECEIPT (LR)', 390, 58, { font: 'Helvetica-Bold' });
    doc.fontSize(8).fillColor('#475569').text(`LR No: ${shipment.lrNumber}`, 390, 72);
    doc.fontSize(8).text(`Date: ${new Date(shipment.bookingDate).toLocaleDateString('en-IN')}`, 390, 83);

    // Divider Line
    doc.moveTo(50, 110).lineTo(545, 110).stroke('#E2E8F0');

    // ─── ROUTING & TRANSIT PARTICULARS ────────────────────────────────────────
    doc.fontSize(10).fillColor('#475569').text('CONSIGNMENT DETAILS', 50, 125, { font: 'Helvetica-Bold' });
    doc.rect(50, 140, 495, 75).stroke('#E2E8F0');

    // Sub-dividers
    doc.moveTo(297, 140).lineTo(297, 215).stroke('#E2E8F0');

    // Left block: Origin & Destination
    doc.fillColor('#1E293B').fontSize(9).text('ROUTE PARTICULARS', 60, 150, { font: 'Helvetica-Bold' });
    doc.fillColor('#475569').text(`Origin City: ${shipment.origin?.city || 'Raipur'} (${shipment.origin?.state || 'CG'})`, 60, 165);
    doc.text(`Destination City: ${shipment.destination?.city || 'Bilaspur'} (${shipment.destination?.state || 'CG'})`, 60, 180);
    doc.text(`Estimated Distance: ${shipment.distance ? `${shipment.distance} km` : 'N/A'}`, 60, 195);

    // Right block: Dispatch details
    doc.fillColor('#1E293B').fontSize(9).text('VEHICLE & ALLOCATION', 307, 150, { font: 'Helvetica-Bold' });
    doc.fillColor('#475569').text(`Vehicle Number: ${shipment.vehicleNumber || 'Unassigned'}`, 307, 165);
    doc.text(`Vehicle Type: ${(shipment.vehicleType || 'open_body').replace('_', ' ').toUpperCase()}`, 307, 180);
    doc.text(`Allocated Driver: ${shipment.driverName || 'N/A'} (${shipment.driverPhone || 'N/A'})`, 307, 195);

    // ─── PARTY INFORMATION ────────────────────────────────────────────────────
    doc.fontSize(10).fillColor('#475569').text('PARTIES INVOLVED', 50, 235, { font: 'Helvetica-Bold' });
    doc.rect(50, 250, 495, 65).stroke('#E2E8F0');
    doc.moveTo(297, 250).lineTo(297, 315).stroke('#E2E8F0');

    // Left: Consignor
    doc.fillColor('#1E293B').fontSize(9).text('CONSIGNOR (SHIPPER / CLIENT)', 60, 260, { font: 'Helvetica-Bold' });
    doc.fillColor('#475569').text(shipment.client?.companyName || 'Registered Client', 60, 275);
    doc.text(`Contact: ${shipment.client?.contactPerson || 'N/A'} (${shipment.client?.phone || 'N/A'})`, 60, 290);

    // Right: Consignee
    doc.fillColor('#1E293B').fontSize(9).text('CONSIGNEE (RECEIVER)', 307, 260, { font: 'Helvetica-Bold' });
    doc.fillColor('#475569').text(shipment.client?.companyName || 'Consignee Company', 307, 275);
    doc.text('Delivery Address: As per booking challan documents', 307, 290);

    // ─── GOODS DESCRIPTION TABLE ──────────────────────────────────────────────
    doc.fontSize(10).fillColor('#475569').text('CARGO PARTICULARS', 50, 335, { font: 'Helvetica-Bold' });

    // Table Header
    doc.rect(50, 350, 495, 20).fill('#F8FAFC').stroke('#E2E8F0');
    doc.fillColor('#475569').fontSize(8);
    doc.text('DESCRIPTION OF GOODS', 60, 356, { font: 'Helvetica-Bold' });
    doc.text('UNIT', 280, 356, { font: 'Helvetica-Bold' });
    doc.text('QUANTITY', 360, 356, { font: 'Helvetica-Bold' });
    doc.text('ACTUAL WEIGHT (TONS)', 440, 356, { font: 'Helvetica-Bold' });

    // Table Body
    doc.rect(50, 370, 495, 45).stroke('#E2E8F0');
    doc.fillColor('#1E293B').fontSize(9);
    doc.text(shipment.goodsDescription || 'Industrial Materials / General Cargo', 60, 385);
    doc.text((shipment.unit || 'ton').toUpperCase(), 280, 385);
    doc.text(String(shipment.quantity || 1), 360, 385);
    doc.text(shipment.weight ? `${shipment.weight} MT` : 'N/A', 440, 385);

    // ─── TERMS & SIGNATURES ───────────────────────────────────────────────────
    doc.fontSize(8).fillColor('#64748B').text('TERMS & CONDITIONS:', 50, 435, { font: 'Helvetica-Bold' });
    doc.text('1. The goods are accepted for carriage subject to the standard conditions of carriage in force.', 50, 447);
    doc.text('2. LogiTrack is not responsible for transit delays, natural force majeure events, or highway inspections.', 50, 457);
    doc.text('3. Proof of Delivery (POD) must be signed and submitted within 3 days of delivery.', 50, 467);

    // Signatures
    doc.moveTo(50, 560).lineTo(180, 560).stroke('#CBD5E1');
    doc.moveTo(415, 560).lineTo(545, 560).stroke('#CBD5E1');
    
    doc.fontSize(8).fillColor('#475569');
    doc.text("CONSIGNOR'S SIGNATURE", 50, 568, { align: 'left', width: 130 });
    doc.text("FOR LOGITRACK LOGISTICS", 415, 568, { align: 'left', width: 130 });

    // End Document
    doc.end();
};

/**
 * Generate Invoice PDF
 */
exports.generateInvoicePDFStream = (shipment, res) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    doc.pipe(res);

    // Header
    doc.fillColor('#0F172A').fontSize(20).text('LOGITRACK LOGISTICS', 50, 50, { align: 'left' });
    doc.fontSize(8).fillColor('#64748B').text('INVOICING DEPARTMENT', 50, 75);
    doc.fontSize(8).text('Raipur Industrial Zone, CG, India', 50, 87);

    // Invoice badge
    doc.rect(380, 50, 165, 55).fill('#F8FAFC').stroke('#E2E8F0');
    doc.fillColor('#1E293B').fontSize(12).text('TAX INVOICE', 390, 58, { font: 'Helvetica-Bold' });
    doc.fontSize(8).fillColor('#475569').text(`Invoice No: ${shipment.invoiceNumber || 'INV-' + shipment.lrNumber.substring(3)}`, 390, 72);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 390, 82);
    doc.text(`LR Number: ${shipment.lrNumber}`, 390, 92);

    doc.moveTo(50, 120).lineTo(545, 120).stroke('#E2E8F0');

    // Billing details
    doc.fontSize(10).fillColor('#475569').text('BILL TO (CUSTOMER/CLIENT)', 50, 135, { font: 'Helvetica-Bold' });
    doc.fillColor('#1E293B').fontSize(10).text(shipment.client?.companyName || 'Client Company Name', 50, 150, { font: 'Helvetica-Bold' });
    doc.fontSize(9).fillColor('#475569');
    doc.text(`Contact: ${shipment.client?.contactPerson || 'N/A'} (${shipment.client?.phone || 'N/A'})`, 50, 165);
    if (shipment.client?.gstNumber) {
        doc.text(`GSTIN: ${shipment.client.gstNumber}`, 50, 180);
    }
    if (shipment.client?.pan) {
        doc.text(`PAN: ${shipment.client.pan}`, 50, 195);
    }

    // Charges Table Header
    doc.rect(50, 230, 495, 20).fill('#F8FAFC').stroke('#E2E8F0');
    doc.fillColor('#475569').fontSize(8);
    doc.text('DESCRIPTION OF CHARGES', 60, 236, { font: 'Helvetica-Bold' });
    doc.text('AMOUNT (INR)', 450, 236, { font: 'Helvetica-Bold', align: 'right', width: 85 });

    // Charges Table Body
    const startY = 250;
    doc.rect(50, startY, 495, 100).stroke('#E2E8F0');
    
    doc.fontSize(9).fillColor('#1E293B');
    
    // Row 1: Freight charges
    doc.text(`Base Freight Carriage Charge (${shipment.origin?.city} to ${shipment.destination?.city})`, 60, startY + 15);
    doc.text(`₹${shipment.freightCharge?.toLocaleString('en-IN')}`, 450, startY + 15, { align: 'right', width: 85 });
    
    // Row 2: Additional charges
    doc.text(`Additional Charges (Unloading/Toll/Loading/etc.)`, 60, startY + 40);
    doc.text(`₹${(shipment.additionalCharges || 0).toLocaleString('en-IN')}`, 450, startY + 40, { align: 'right', width: 85 });

    // Row 3: GST (5%)
    doc.text(`GST @ 5% (Road Carriage Service under Reverse Charge)`, 60, startY + 65);
    doc.text(`₹${(shipment.gstAmount || 0).toLocaleString('en-IN')}`, 450, startY + 65, { align: 'right', width: 85 });

    // Totals Box
    const totalBoxY = startY + 115;
    doc.rect(320, totalBoxY, 225, 60).fill('#F8FAFC').stroke('#CBD5E1');
    
    doc.fontSize(9).fillColor('#475569');
    doc.text('Subtotal:', 330, totalBoxY + 12);
    doc.text(`₹${(shipment.freightCharge + (shipment.additionalCharges || 0)).toLocaleString('en-IN')}`, 430, totalBoxY + 12, { align: 'right', width: 100 });

    doc.text('Total GST (5%):', 330, totalBoxY + 25);
    doc.text(`₹${(shipment.gstAmount || 0).toLocaleString('en-IN')}`, 430, totalBoxY + 25, { align: 'right', width: 100 });

    doc.fillColor('#0F172A').fontSize(10).text('Net Invoice Amount:', 330, totalBoxY + 42, { font: 'Helvetica-Bold' });
    doc.text(`₹${shipment.totalAmount?.toLocaleString('en-IN')}`, 430, totalBoxY + 42, { font: 'Helvetica-Bold', align: 'right', width: 100 });

    // Payment Info
    doc.fontSize(9).fillColor('#475569').text(`Payment Status: ${shipment.paymentStatus?.toUpperCase() || 'PENDING'}`, 50, totalBoxY + 12, { font: 'Helvetica-Bold' });
    doc.text(`Amount Received: ₹${(shipment.amountPaid || 0).toLocaleString('en-IN')}`, 50, totalBoxY + 27);
    doc.text(`Outstanding Balance: ₹${(shipment.totalAmount - (shipment.amountPaid || 0)).toLocaleString('en-IN')}`, 50, totalBoxY + 42, { color: '#F59E0B' });

    // Bank Account details
    doc.rect(50, totalBoxY + 80, 495, 60).stroke('#E2E8F0');
    doc.fontSize(8).fillColor('#64748B').text('PAYMENT DETAILS / BANK ACCOUNT FOR RTGS/NEFT:', 60, totalBoxY + 90, { font: 'Helvetica-Bold' });
    doc.text('Bank Name: HDFC Bank Raipur | A/C Name: LogiTrack Logistics Raipur', 60, totalBoxY + 105);
    doc.text('Account No: 50200088899977 | IFSC Code: HDFC0001234', 60, totalBoxY + 117);

    // Footer signature
    doc.moveTo(415, totalBoxY + 200).lineTo(545, totalBoxY + 200).stroke('#CBD5E1');
    doc.fontSize(8).fillColor('#475569').text('AUTHORISED SIGNATORY', 415, totalBoxY + 208, { align: 'left' });

    doc.end();
};
