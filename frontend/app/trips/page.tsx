"use client";
import { useEffect, useState } from "react";
import api from "../../lib/api";

interface Trip {
  _id?: string;
  trip_id: string;
  vin: string;
  driver_id: string;
  start_time: string;
  end_time: string;
  start_location: string;
  end_location: string;
  distance: number;
  metadata?: any;
}

interface Vehicle {
  _id?: string;
  id?: string;
  vin: string;
  manufacturer: string;
  model: string;
}

interface Driver {
  _id?: string;
  driver_id: string;
  name: string;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Trip>>({
    vin: "",
    driver_id: "",
    start_time: "",
    end_time: "",
    start_location: "",
    end_location: "",
    distance: 0
  });

  useEffect(() => {
    fetchTrips();
    fetchVehicles();
    fetchDrivers();
  }, []);

  async function fetchTrips() {
    try {
      setLoading(true);
      const res = await api.get("/trips");
      console.log("Trips fetched:", res.data);
      setTrips(res.data);
    } catch (err) {
      console.error("Failed to fetch trips:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchVehicles() {
    try {
      const res = await api.get("/vehicles");
      console.log("Vehicles fetched:", res.data);
      setVehicles(res.data);
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
    }
  }

  async function fetchDrivers() {
    try {
      const res = await api.get("/drivers");
      console.log("Drivers fetched:", res.data);
      setDrivers(res.data);
    } catch (err) {
      console.error("Failed to fetch drivers:", err);
    }
  }

  async function createTrip(e: React.FormEvent) {
    e.preventDefault();
    if (!form.vin || !form.driver_id || !form.start_time || !form.end_time || !form.start_location || !form.end_location) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const tripData = {
        ...form,
        trip_id: `TRP${Date.now()}`, // Generate a unique trip ID
        distance: form.distance || 0,
        metadata: {}
      };

      console.log("Creating trip:", tripData);
      const response = await api.post("/trips", tripData);
      console.log("Trip created:", response.data);

      setForm({ vin: "", driver_id: "", start_time: "", end_time: "", start_location: "", end_location: "", distance: 0 });
      setShowForm(false);
      fetchTrips();
    } catch (err: any) {
      console.error("Failed to create trip:", err);
      if (err.response?.data?.detail) {
        alert(`Error: ${err.response.data.detail}`);
      } else {
        alert("Failed to create trip");
      }
    }
  }

  async function deleteTrip(tripId: string) {
    if (!confirm("Are you sure you want to delete this trip?")) return;

    try {
      await api.delete(`/trips/${tripId}`);
      console.log("Trip deleted:", tripId);
      fetchTrips();
    } catch (err) {
      console.error("Failed to delete trip:", err);
      alert("Failed to delete trip");
    }
  }

  const getVehicleInfo = (vin: string) => {
    const vehicle = vehicles.find(v => v.vin === vin);
    return vehicle ? `${vehicle.manufacturer} ${vehicle.model}` : vin;
  };

  const getDriverName = (driverId: string) => {
    const driver = drivers.find(d => d.driver_id === driverId);
    return driver ? driver.name : driverId;
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-4">🗺️</span>
                Trip Management
              </h1>
              <p className="text-xl text-gray-600">Track and manage your fleet trips and routes</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-indigo-600">{trips.length}</div>
              <div className="text-sm text-gray-500 font-semibold">Total Trips</div>
            </div>
          </div>
        </div>

        {/* Add Trip Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-indigo-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center"
          >
            <span className="mr-2">{showForm ? "✕" : "🗺️"}</span>
            {showForm ? "Cancel" : "Add New Trip"}
          </button>
        </div>

        {/* Add Trip Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-indigo-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">📝</span>
              Add New Trip
            </h2>
            <form onSubmit={createTrip} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Vehicle</label>
                  <select
                    value={form.vin || ""}
                    onChange={e => setForm({ ...form, vin: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    required
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle._id || vehicle.id || vehicle.vin} value={vehicle.vin}>
                        {vehicle.manufacturer} {vehicle.model} ({vehicle.vin})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Driver</label>
                  <select
                    value={form.driver_id || ""}
                    onChange={e => setForm({ ...form, driver_id: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    required
                  >
                    <option value="">Select Driver</option>
                    {drivers.map(driver => (
                      <option key={driver._id || driver.driver_id} value={driver.driver_id}>
                        {driver.name} ({driver.driver_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Distance (km)</label>
                  <input
                    type="number"
                    value={form.distance || ""}
                    onChange={e => setForm({ ...form, distance: parseFloat(e.target.value) || 0 })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="0.0"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Start Time</label>
                  <input
                    type="datetime-local"
                    value={form.start_time || ""}
                    onChange={e => setForm({ ...form, start_time: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">End Time</label>
                  <input
                    type="datetime-local"
                    value={form.end_time || ""}
                    onChange={e => setForm({ ...form, end_time: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Start Location</label>
                  <input
                    type="text"
                    value={form.start_location || ""}
                    onChange={e => setForm({ ...form, start_location: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g., Chennai Central"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">End Location</label>
                  <input
                    type="text"
                    value={form.end_location || ""}
                    onChange={e => setForm({ ...form, end_location: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g., Bangalore Airport"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center"
                >
                  <span className="mr-2">✅</span>
                  Create Trip
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center"
                >
                  <span className="mr-2">✕</span>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Trips Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {trips.map((trip, index) => (
            <div key={trip._id || trip.trip_id || index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-indigo-100 overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🗺️</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Trip #{trip.trip_id}</h3>
                      <p className="text-sm text-gray-500">{getVehicleInfo(trip.vin)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                      <span className="mr-1">👨‍💼</span>
                      {getDriverName(trip.driver_id)}
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-2">📍</span>
                      <span className="font-semibold text-blue-800">From</span>
                    </div>
                    <span className="text-sm text-gray-700">{trip.start_location}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-green-600 mr-2">🎯</span>
                      <span className="font-semibold text-green-800">To</span>
                    </div>
                    <span className="text-sm text-gray-700">{trip.end_location}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-purple-600 mr-2">📏</span>
                      <span className="font-semibold text-purple-800">Distance</span>
                    </div>
                    <span className="text-sm text-gray-700 font-semibold">{trip.distance} km</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-orange-600 mr-2">⏱️</span>
                      <span className="font-semibold text-orange-800">Duration</span>
                    </div>
                    <span className="text-sm text-gray-700">{getDuration(trip.start_time, trip.end_time)}</span>
                  </div>
                </div>

                {/* Time Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><span className="font-semibold">Start:</span> {formatDateTime(trip.start_time)}</div>
                    <div><span className="font-semibold">End:</span> {formatDateTime(trip.end_time)}</div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={() => deleteTrip(trip.trip_id)}
                    className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center"
                  >
                    <span className="mr-1">🗑️</span>
                    Delete Trip
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {trips.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🗺️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No trips found</h3>
            <p className="text-gray-600 text-lg mb-8">Get started by creating your first trip.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-indigo-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg"
            >
              🗺️ Create First Trip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

