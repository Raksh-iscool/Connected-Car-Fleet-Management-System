"use client";
import { useEffect, useState } from "react";
import api from "../../lib/api";

interface Driver {
  _id?: string;
  driver_id: string;
  name: string;
  license_number: string;
  phone: string;
  email: string;
  assigned_vehicle: string;
}

interface Vehicle {
  _id?: string;
  id?: string;
  vin: string;
  manufacturer: string;
  model: string;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Driver>>({
    name: "",
    license_number: "",
    phone: "",
    email: "",
    assigned_vehicle: ""
  });

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
  }, []);

  async function fetchDrivers() {
    try {
      setLoading(true);
      const res = await api.get("/drivers");
      console.log("Drivers fetched:", res.data);
      setDrivers(res.data);
    } catch (err) {
      console.error("Failed to fetch drivers:", err);
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

  async function createDriver(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.license_number || !form.phone || !form.email) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const driverData = {
        ...form,
        driver_id: `DRV${Date.now()}`, // Generate a unique driver ID
      };

      console.log("Creating driver:", driverData);
      const response = await api.post("/drivers", driverData);
      console.log("Driver created:", response.data);

      setForm({ name: "", license_number: "", phone: "", email: "", assigned_vehicle: "" });
      setShowForm(false);
      fetchDrivers();
    } catch (err: any) {
      console.error("Failed to create driver:", err);
      if (err.response?.data?.detail) {
        alert(`Error: ${err.response.data.detail}`);
      } else {
        alert("Failed to create driver");
      }
    }
  }

  async function deleteDriver(driverId: string) {
    if (!confirm("Are you sure you want to delete this driver?")) return;

    try {
      await api.delete(`/drivers/${driverId}`);
      console.log("Driver deleted:", driverId);
      fetchDrivers();
    } catch (err) {
      console.error("Failed to delete driver:", err);
      alert("Failed to delete driver");
    }
  }

  const getVehicleInfo = (vin: string) => {
    const vehicle = vehicles.find(v => v.vin === vin);
    return vehicle ? `${vehicle.manufacturer} ${vehicle.model}` : vin;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-4">👨‍💼</span>
                Driver Management
              </h1>
              <p className="text-xl text-gray-600">Manage your fleet drivers and their vehicle assignments</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-purple-600">{drivers.length}</div>
              <div className="text-sm text-gray-500 font-semibold">Total Drivers</div>
            </div>
          </div>
        </div>

        {/* Add Driver Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center"
          >
            <span className="mr-2">{showForm ? "✕" : "👨‍💼"}</span>
            {showForm ? "Cancel" : "Add New Driver"}
          </button>
        </div>

        {/* Add Driver Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-purple-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">📝</span>
              Add New Driver
            </h2>
            <form onSubmit={createDriver} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={form.name || ""}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g., John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">License Number</label>
                  <input
                    type="text"
                    value={form.license_number || ""}
                    onChange={e => setForm({ ...form, license_number: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g., DL12345"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone || ""}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g., +1234567890"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                  <input
                    type="email"
                    value={form.email || ""}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g., john@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Assigned Vehicle</label>
                  <select
                    value={form.assigned_vehicle || ""}
                    onChange={e => setForm({ ...form, assigned_vehicle: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle._id || vehicle.id || vehicle.vin} value={vehicle.vin}>
                        {vehicle.manufacturer} {vehicle.model} ({vehicle.vin})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center"
                >
                  <span className="mr-2">✅</span>
                  Create Driver
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

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {drivers.map((driver, index) => (
            <div key={driver._id || driver.driver_id || index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-purple-100 overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">👨‍💼</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{driver.name}</h3>
                      <p className="text-sm text-gray-500 font-mono">{driver.driver_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      <span className="mr-1">📋</span>
                      {driver.license_number}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-purple-600 mr-2">📧</span>
                      <span className="font-semibold text-purple-800">Email</span>
                    </div>
                    <span className="text-sm text-gray-700 truncate">{driver.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-green-600 mr-2">📞</span>
                      <span className="font-semibold text-green-800">Phone</span>
                    </div>
                    <span className="text-sm text-gray-700">{driver.phone}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-2">🚗</span>
                      <span className="font-semibold text-blue-800">Assigned Vehicle</span>
                    </div>
                    <span className="text-sm text-gray-700">{getVehicleInfo(driver.assigned_vehicle)}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={() => deleteDriver(driver.driver_id)}
                    className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center"
                  >
                    <span className="mr-1">🗑️</span>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {drivers.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">👨‍💼</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No drivers found</h3>
            <p className="text-gray-600 text-lg mb-8">Get started by adding your first driver to the fleet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg"
            >
              👨‍💼 Add First Driver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

