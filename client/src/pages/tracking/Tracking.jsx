/**
 * pages/tracking/Tracking.jsx
 *
 * Real-Time GPS Tracking & Interactive Route Visualization.
 * Powered by Leaflet (OpenStreetMap) and WebSockets (Socket.IO).
 */

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import {
    MapPin, Truck, Navigation, Play, Square,
    Clock, Gauge, ShieldCheck, Activity, RefreshCw, ChevronRight
} from 'lucide-react';
import { getActiveTrackedShipments, postLocationUpdate } from '../../services/trackingService';

// Known coordinates for Indian regional freight hubs
const CITY_COORDINATES = {
    'raipur': [21.2514, 81.6296],
    'bilaspur': [22.0797, 82.1409],
    'bhilai': [21.1938, 81.3509],
    'durg': [21.1904, 81.2849],
    'korba': [22.3595, 82.7501],
    'raigarh': [21.8974, 83.3950],
    'nagpur': [21.1458, 79.0882],
    'delhi': [28.6139, 77.2090],
    'mumbai': [19.0760, 72.8777],
    'kolkata': [22.5726, 88.3639],
};

const getCityCoords = (cityName, fallback = [21.2514, 81.6296]) => {
    if (!cityName) return fallback;
    const clean = cityName.trim().toLowerCase();
    return CITY_COORDINATES[clean] || fallback;
};

// Custom DivIcons for Leaflet Map
const createMarkerIcon = (color, label) => {
    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
            <div style="
                background: ${color};
                width: 28px;
                height: 28px;
                border-radius: 50%;
                border: 3px solid #0A0F1E;
                box-shadow: 0 0 10px ${color};
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 10px;
            ">
                ${label}
            </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    });
};

const truckIcon = L.divIcon({
    className: 'custom-truck-icon',
    html: `
        <div style="
            background: #3B82F6;
            width: 36px;
            height: 36px;
            border-radius: 10px;
            border: 2px solid white;
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        ">
            🚛
        </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

// Helper component to auto-recenter Leaflet map
const MapRecenter = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom(), { animate: true, duration: 1.5 });
        }
    }, [center, map]);
    return null;
};

const Tracking = () => {
    const [shipments, setShipments] = useState([]);
    const [selectedShipment, setSelectedShipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socketConnected, setSocketConnected] = useState(false);

    // Live telemetry state
    const [currentPos, setCurrentPos] = useState(null);
    const [currentSpeed, setCurrentSpeed] = useState(0);
    const [isSimulating, setIsSimulating] = useState(false);

    const socketRef = useRef(null);
    const simIntervalRef = useRef(null);

    // 1. Fetch active shipments
    const fetchActiveShipments = async () => {
        try {
            setLoading(true);
            const res = await getActiveTrackedShipments();
            if (res.success && res.data?.length > 0) {
                setShipments(res.data);
                if (!selectedShipment) {
                    setSelectedShipment(res.data[0]);
                }
            } else {
                setShipments([]);
            }
        } catch (err) {
            console.error('Failed to fetch active tracked shipments:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveShipments();
    }, []);

    // 2. Initialize Socket.IO connection
    useEffect(() => {
        const socketUrl = import.meta.env.VITE_API_URL
            ? import.meta.env.VITE_API_URL.replace('/api', '')
            : 'http://localhost:5000';

        const socket = io(socketUrl, {
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setSocketConnected(true);
        });

        socket.on('disconnect', () => {
            setSocketConnected(false);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // 3. Join shipment room & reset vehicle position
    useEffect(() => {
        if (!selectedShipment) return;

        const originCoords = getCityCoords(selectedShipment.origin?.city, [21.2514, 81.6296]);
        setCurrentPos(originCoords);
        setCurrentSpeed(58);

        if (socketRef.current) {
            socketRef.current.emit('join_shipment', selectedShipment._id);

            const handleLocationUpdate = (data) => {
                if (data.lat && data.lng) {
                    setCurrentPos([data.lat, data.lng]);
                    if (data.speed !== undefined) setCurrentSpeed(data.speed);
                }
            };

            socketRef.current.on('location_updated', handleLocationUpdate);

            return () => {
                socketRef.current.off('location_updated', handleLocationUpdate);
            };
        }
    }, [selectedShipment]);

    // 4. Live Simulation Mode Handler
    const toggleSimulation = () => {
        if (isSimulating) {
            clearInterval(simIntervalRef.current);
            setIsSimulating(false);
            return;
        }

        if (!selectedShipment) return;

        const origin = getCityCoords(selectedShipment.origin?.city, [21.2514, 81.6296]);
        const dest = getCityCoords(selectedShipment.destination?.city, [22.0797, 82.1409]);

        let step = 0;
        const totalSteps = 20;
        setIsSimulating(true);

        simIntervalRef.current = setInterval(async () => {
            step++;
            if (step > totalSteps) {
                step = 0;
            }

            const lat = origin[0] + (dest[0] - origin[0]) * (step / totalSteps);
            const lng = origin[1] + (dest[1] - origin[1]) * (step / totalSteps);
            const speed = Math.floor(50 + Math.random() * 20);

            setCurrentPos([lat, lng]);
            setCurrentSpeed(speed);

            // Broadcast to backend via REST fallback
            try {
                await postLocationUpdate(selectedShipment._id, { lat, lng, speed });
            } catch (e) {
                // Silent catch for simulation
            }
        }, 3000);
    };

    useEffect(() => {
        return () => {
            if (simIntervalRef.current) clearInterval(simIntervalRef.current);
        };
    }, []);

    const originCoords = selectedShipment ? getCityCoords(selectedShipment.origin?.city, [21.2514, 81.6296]) : [21.2514, 81.6296];
    const destCoords = selectedShipment ? getCityCoords(selectedShipment.destination?.city, [22.0797, 82.1409]) : [22.0797, 82.1409];
    const vehiclePos = currentPos || originCoords;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-500" />
                        Live GPS Route Tracking
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5">
                        Real-time telemetry, OpenStreetMap route visualization, and driver location updates.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Connection indicator */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                        <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                        <span className="text-slate-300 font-medium">
                            {socketConnected ? 'Socket Live' : 'Connecting...'}
                        </span>
                    </div>

                    <button
                        onClick={toggleSimulation}
                        disabled={!selectedShipment}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium text-xs transition-colors shadow-md ${isSimulating
                                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                : 'bg-blue-600 hover:bg-blue-500 text-white'
                            }`}
                    >
                        {isSimulating ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        {isSimulating ? 'Stop Simulator' : 'Simulate Live Motion'}
                    </button>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Sidebar: Active Shipments */}
                <div className="lg:col-span-1 space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Fleet ({shipments.length})</span>
                        <button onClick={fetchActiveShipments} className="text-slate-500 hover:text-white transition-colors">
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="py-12 text-center text-xs text-slate-500">Loading active fleet...</div>
                    ) : shipments.length === 0 ? (
                        <div className="p-4 bg-slate-900/60 border border-slate-900 rounded-xl text-center text-slate-500 text-xs">
                            No active in-transit shipments to track right now.
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                            {shipments.map((s) => {
                                const isSelected = selectedShipment?._id === s._id;
                                return (
                                    <div
                                        key={s._id}
                                        onClick={() => setSelectedShipment(s)}
                                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${isSelected
                                                ? 'bg-blue-950/40 border-blue-500/60 shadow-lg'
                                                : 'bg-slate-900/60 border-slate-900 hover:border-slate-800'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-white text-xs">{s.lrNumber}</span>
                                            <span className="badge badge-info">{s.status?.replace('_', ' ')}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-300 font-semibold mb-1">
                                            {s.origin?.city} → {s.destination?.city}
                                        </div>
                                        <div className="flex justify-between text-[10px] text-slate-500">
                                            <span>Truck: {s.vehicleNumber || 'N/A'}</span>
                                            <span>{s.driverName || 'No Driver'}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Area: Map & Telemetry HUD */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Telemetry HUD Cards */}
                    {selectedShipment && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-slate-900 border border-slate-900/60 p-3 rounded-xl flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <Gauge className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Current Speed</p>
                                    <p className="text-sm font-bold text-white">{currentSpeed} km/h</p>
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-900/60 p-3 rounded-xl flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                    <Navigation className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Route Distance</p>
                                    <p className="text-sm font-bold text-white">{selectedShipment.distance || 150} km</p>
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-900/60 p-3 rounded-xl flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Est. ETA</p>
                                    <p className="text-sm font-bold text-white">~3 hrs 45 mins</p>
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-900/60 p-3 rounded-xl flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Driver Status</p>
                                    <p className="text-sm font-bold text-white truncate max-w-[90px]">
                                        {selectedShipment.driverName || 'On Duty'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Interactive Leaflet Map Container */}
                    <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden h-[500px] relative shadow-2xl">
                        <MapContainer
                            center={vehiclePos}
                            zoom={7}
                            scrollWheelZoom={true}
                            style={{ height: '100%', width: '100%', background: '#0A0F1E' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <MapRecenter center={vehiclePos} />

                            {/* Origin Marker */}
                            <Marker position={originCoords} icon={createMarkerIcon('#10B981', 'A')}>
                                <Popup>
                                    <div className="text-xs text-slate-900 font-bold">
                                        Origin: {selectedShipment?.origin?.city || 'Origin'}
                                    </div>
                                </Popup>
                            </Marker>

                            {/* Destination Marker */}
                            <Marker position={destCoords} icon={createMarkerIcon('#F43F5E', 'B')}>
                                <Popup>
                                    <div className="text-xs text-slate-900 font-bold">
                                        Destination: {selectedShipment?.destination?.city || 'Destination'}
                                    </div>
                                </Popup>
                            </Marker>

                            {/* Live Vehicle Marker */}
                            <Marker position={vehiclePos} icon={truckIcon}>
                                <Popup>
                                    <div className="text-xs text-slate-900 font-bold">
                                        Vehicle: {selectedShipment?.vehicleNumber || 'Truck'}<br />
                                        Speed: {currentSpeed} km/h
                                    </div>
                                </Popup>
                            </Marker>

                            {/* Route Polyline */}
                            <Polyline
                                positions={[originCoords, destCoords]}
                                pathOptions={{ color: '#3B82F6', weight: 4, dashArray: '8, 8', opacity: 0.8 }}
                            />
                        </MapContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Tracking;
