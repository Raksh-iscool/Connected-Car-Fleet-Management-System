"use client";
import { useEffect, useState } from "react";
import api from "../../lib/api";

interface Vehicle {
  _id?: string;
  id?: string;
  vin: string;
  manufacturer: string;
  model: string;
}

interface TelemetryReading {
  _id?: string;
  vin: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  speed: number;
  engine_status: string;
  fuel_level: number;
  odometer: number;
  diagnostic_codes?: string[];
}

export default function TelemetryPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVin, setSelectedVin] = useState("");
  const [telemetryList, setTelemetryList] = useState<TelemetryReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [reading, setReading] = useState({
    timestamp: new Date().toISOString().slice(0, 16),
    latitude: 40.7128,
    longitude: -74.0060,
    speed: 0,
    engine_status: "stopped",
    fuel_level: 100,
    odometer: 0
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (selectedVin) {
      fetchTelemetry();
    }
  }, [selectedVin]);

  async function fetchVehicles() {
    try {
      setLoading(true);
      const res = await api.get("/vehicles");
      console.log("Vehicles fetched:", res.data);
      setVehicles(res.data);
      if (res.data.length > 0) {
        setSelectedVin(res.data[0].vin);
      }
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTelemetry() {
    if (!selectedVin) return;

    try {
      const res = await api.get(`/vehicles/${selectedVin}/telemetry?limit=50`);
      console.log("Telemetry fetched:", res.data);
      setTelemetryList(res.data);
    } catch (err) {
      console.error("Failed to fetch telemetry:", err);
    }
  }

  async function sendTelemetry() {
    if (!selectedVin) {
      alert("Please select a vehicle first");
      return;
    }

    try {
      setSending(true);
      const telemetryData = {
        ...reading,
        vin: selectedVin,
        timestamp: new Date(reading.timestamp).toISOString(),
        diagnostic_codes: []
      };

      console.log("Sending telemetry:", telemetryData);
      const response = await api.post(`/vehicles/${selectedVin}/telemetry`, telemetryData);
      console.log("Telemetry sent:", response.data);

      // Auto-generate next reading
      setReading({
        ...reading,
        timestamp: new Date().toISOString().slice(0, 16),
        odometer: reading.odometer + Math.floor(Math.random() * 10) + 1,
        fuel_level: Math.max(0, reading.fuel_level - Math.floor(Math.random() * 5)),
        speed: Math.floor(Math.random() * 120),
        latitude: reading.latitude + (Math.random() - 0.5) * 0.01,
        longitude: reading.longitude + (Math.random() - 0.5) * 0.01,
        engine_status: Math.random() > 0.3 ? "running" : "stopped"
      });

      fetchTelemetry();
    } catch (err: any) {
      console.error("Failed to send telemetry:", err);
      if (err.response?.data?.detail) {
        alert(`Error: ${err.response.data.detail}`);
      } else {
        alert("Failed to send telemetry");
      }
    } finally {
      setSending(false);
    }
  }

  const getEngineStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'stopped':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'idle':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEngineStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return '🟢';
      case 'stopped':
        return '🔴';
      case 'idle':
        return '🟡';
      default:
        return '⚪';
    }
  };

  const getFuelLevelColor = (level: number) => {
    if (level > 50) return 'text-green-600';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSpeedColor = (speed: number) => {
    if (speed > 100) return 'text-red-600';
    if (speed > 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const getSelectedVehicle = () => {
    return vehicles.find(v => v.vin === selectedVin);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-16 bg-gray-300 rounded-2xl w-80"></div>
            <div className="h-16 bg-gray-300 rounded-2xl w-48"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-300 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-4">📡</span>
                Telemetry Management
              </h1>
              <p className="text-xl text-gray-600">Monitor and send real-time vehicle telemetry data</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-teal-600">{telemetryList.length}</div>
              <div className="text-sm text-gray-500 font-semibold">Total Readings</div>
            </div>
          </div>
        </div>

        {/* Vehicle Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-teal-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">🚗</span>
            Vehicle Selection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Select Vehicle</label>
              <select
                value={selectedVin}
                onChange={e => setSelectedVin(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              >
                <option value="">Select a vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle._id || vehicle.id || vehicle.vin} value={vehicle.vin}>
                    {vehicle.manufacturer} {vehicle.model} ({vehicle.vin})
                  </option>
                ))}
              </select>
            </div>
            {getSelectedVehicle() && (
              <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
                <h3 className="font-semibold text-teal-800 mb-2">Selected Vehicle</h3>
                <p className="text-lg font-bold text-gray-900">{getSelectedVehicle()?.manufacturer} {getSelectedVehicle()?.model}</p>
                <p className="text-sm text-gray-600 font-mono">{getSelectedVehicle()?.vin}</p>
              </div>
            )}
          </div>
        </div>

        {/* Send Telemetry Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-teal-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">📤</span>
            Send Telemetry Data
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Timestamp</label>
              <input
                type="datetime-local"
                value={reading.timestamp}
                onChange={e => setReading({ ...reading, timestamp: e.target.value })}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={reading.latitude}
                onChange={e => setReading({ ...reading, latitude: parseFloat(e.target.value) })}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={reading.longitude}
                onChange={e => setReading({ ...reading, longitude: parseFloat(e.target.value) })}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Speed (km/h)</label>
              <input
                type="number"
                min="0"
                max="200"
                value={reading.speed}
                onChange={e => setReading({ ...reading, speed: parseInt(e.target.value) })}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Engine Status</label>
              <select
                value={reading.engine_status}
                onChange={e => setReading({ ...reading, engine_status: e.target.value })}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              >
                <option value="running">🟢 Running</option>
                <option value="stopped">🔴 Stopped</option>
                <option value="idle">🟡 Idle</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Fuel Level (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={reading.fuel_level}
                onChange={e => setReading({ ...reading, fuel_level: parseInt(e.target.value) })}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Odometer (km)</label>
              <input
                type="number"
                min="0"
                value={reading.odometer}
                onChange={e => setReading({ ...reading, odometer: parseInt(e.target.value) })}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              onClick={sendTelemetry}
              disabled={!selectedVin || sending}
              className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-8 py-4 rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-2">{sending ? "⏳" : "📤"}</span>
              {sending ? "Sending..." : "Send Telemetry"}
            </button>
            <button
              onClick={fetchTelemetry}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center"
            >
              <span className="mr-2">🔄</span>
              Refresh Data
            </button>
          </div>
        </div>

        {/* Telemetry Readings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {telemetryList.map((telemetry, index) => (
            <div key={telemetry._id || index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-teal-100 overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📡</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Telemetry #{index + 1}</h3>
                      <p className="text-sm text-gray-500 font-mono">{telemetry.vin}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getEngineStatusColor(telemetry.engine_status)}`}>
                      <span className="mr-1">{getEngineStatusIcon(telemetry.engine_status)}</span>
                      {telemetry.engine_status}
                    </div>
                  </div>
                </div>

                {/* Telemetry Data */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-2">📍</span>
                      <span className="font-semibold text-blue-800">Location</span>
                    </div>
                    <span className="text-sm text-gray-700">
                      {telemetry.latitude.toFixed(6)}, {telemetry.longitude.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-green-600 mr-2">🚗</span>
                      <span className="font-semibold text-green-800">Speed</span>
                    </div>
                    <span className={`text-sm font-semibold ${getSpeedColor(telemetry.speed)}`}>
                      {telemetry.speed} km/h
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-yellow-600 mr-2">⛽</span>
                      <span className="font-semibold text-yellow-800">Fuel Level</span>
                    </div>
                    <span className={`text-sm font-semibold ${getFuelLevelColor(telemetry.fuel_level)}`}>
                      {telemetry.fuel_level}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-purple-600 mr-2">📏</span>
                      <span className="font-semibold text-purple-800">Odometer</span>
                    </div>
                    <span className="text-sm text-gray-700 font-semibold">
                      {telemetry.odometer} km
                    </span>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold">Timestamp:</span> {formatDateTime(telemetry.timestamp)}
                  </div>
                </div>

                {/* Diagnostic Codes */}
                {telemetry.diagnostic_codes && telemetry.diagnostic_codes.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center">
                      <span className="mr-1">🔧</span>
                      Diagnostic Codes:
                    </h4>
                    <div className="space-y-1">
                      {telemetry.diagnostic_codes.map((code, idx) => (
                        <div key={idx} className="text-xs text-red-700 font-mono bg-red-100 px-2 py-1 rounded">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {telemetryList.length === 0 && selectedVin && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📡</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No telemetry data found</h3>
            <p className="text-gray-600 text-lg mb-8">Send your first telemetry reading to see data here.</p>
            <button
              onClick={sendTelemetry}
              disabled={!selectedVin || sending}
              className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-8 py-4 rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📤 Send First Reading
            </button>
          </div>
        )}

        {!selectedVin && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🚗</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Select a vehicle</h3>
            <p className="text-gray-600 text-lg mb-8">Choose a vehicle to view and send telemetry data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
