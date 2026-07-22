# 🚛 LogiTrack — Enterprise MERN Logistics & Dispatch Suite

LogiTrack is a production-ready, high-performance freight brokerage management suite built on the MERN stack. Designed specifically to solve real-world logistics bottlenecks (from cargo booking to truck dispatching, real-time route telemetry, automated PDF invoicing, and Gemini AI operations assistance).

---

## 🛠️ Tech Stack & Architecture

*   **Frontend**: React (Vite), Tailwind CSS, Recharts (business graphics), Leaflet (OpenStreetMap visualization), Socket.IO Client.
*   **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose), Socket.IO, PDFKit (tax documents).
*   **AI Integration**: Google Gemini 1.5 Flash (Conversational Dispatcher Assistant).

---

## ✨ Features Breakdown

### 1. Secure RBAC Authentication
*   **Dual Tokens**: Secure access & refresh JWT tokens using `httpOnly` secure cookies.
*   **Role-Based Access (RBAC)**: Custom routing & views tailored for `Admin` and `Operations / Dispatchers`.

### 2. Fleet & Master Data Management
*   **Active Directory**: Full CRUD panels with search, paginated views, and soft delete filters for:
    *   **Clients / Shippers**: Contact profiles, credit limits, and tax numbers.
    *   **Suppliers / Brokers**: Fleet vendors supplying outsourced vehicles.
    *   **Drivers**: Phone validation, driver license logs.
    *   **Vehicles**: Registration numbers, dimensions, and type groupings.

### 3. Shipment Operations & Billing (Lorry Receipts)
*   **Automated LRs**: Lorry Receipt generation featuring base freight, additional handling, and 5% GST calculation.
*   **Billing Center**: Automatic net profit margin calculator (`freightCharge - truckOwnerPayment`).
*   **Tax Documents PDF**: Real-time generation of Lorry Receipts and GST Tax Invoices streamed directly into browser tabs.
*   **Proof of Delivery (POD)**: Local file upload portal (JPG, PNG, PDF) using Multer. Uploading a signed POD auto-advances the shipment lifecycle.

### 4. Real-Time GPS Tracking & Map HUD
*   **Leaflet maps**: Free and open-source interactive map plotting origin pins, destination corridors, and vehicle coordinates.
*   **WebSockets (Socket.IO)**: Telemetry room subscriptions broadcasting live speeds and coordinates.
*   **Built-in Simulator**: Live testing interface to mock active truck transit motions without mobile hardware.

### 5. BI Reports & Analytics
*   **Recharts Panels**: Operational trend lines, payment status distribution pie charts, and route volume metrics.
*   **CSV Exports**: Custom reports download spreadsheet center.

### 6. AI Dispatch Assistant (Google Gemini)
*   Provides natural language summaries of operating margins, delayed shipments, or client revenue standings.
*   Includes rule-based backup logic to handle unconfigured API keys gracefully.

---

## 🚀 Setup & Execution Guide

### 1. Clone & Install Dependencies

```bash
# Server packages
cd server
npm install

# Client packages
cd ../client
npm install
```

### 2. Environment Variables (.env)

Create a `server/.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_long_random_string_here
JWT_REFRESH_SECRET=your_long_random_string_here
GEMINI_API_KEY=your_optional_gemini_api_key
```

### 3. Execution

```bash
# Start backend server (starts on Port 5000)
cd server
npm run dev

# Start frontend server (Vite on Port 5173)
cd client
npm run dev
```