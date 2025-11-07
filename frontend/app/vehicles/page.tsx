"use client";
import { useEffect, useState } from "react";
import api from "../../lib/api";

interface Vehicle {
  _id?: string;
  id?: string;
  vin: string;
  manufacturer: string;
  model: string;
  fleet_id?: string;
  owner_id?: string;
  registration_status: string;
}

interface Fleet {
  _id?: string;
  fleet_id: string;
  name: string;
}

interface Owner {
  _id?: string;
  owner_id: string;
  name: string;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Vehicle>>({
    manufacturer: "",
    model: "",
    registration_status: "Active"
  });

  useEffect(() => {
    fetchVehicles();
    fetchFleets();
    fetchOwners();
  }, []);

  async function fetchVehicles() {
    try {
      setLoading(true);
      const res = await api.get("/vehicles");
      console.log("Vehicles fetched:", res.data);
      setVehicles(res.data);
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFleets() {
    try {
      const res = await api.get("/fleets");
      console.log("Fleets fetched:", res.data);
      setFleets(res.data);
    } catch (err) {
      console.error("Failed to fetch fleets:", err);
    }
  }

  async function fetchOwners() {
    try {
      const res = await api.get("/owners");
      console.log("Owners fetched:", res.data);
      setOwners(res.data);
    } catch (err) {
      console.error("Failed to fetch owners:", err);
    }
  }

  async function createVehicle(e: React.FormEvent) {
    e.preventDefault();
    if (!form.manufacturer || !form.model) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const vehicleData = {
        ...form,
        vin: `VIN${Date.now()}`, // Generate a unique VIN
        registration_status: form.registration_status || "Active"
      };

      console.log("Creating vehicle:", vehicleData);
      const response = await api.post("/vehicles", vehicleData);
      console.log("Vehicle created:", response.data);

      setForm({ manufacturer: "", model: "", registration_status: "Active" });
      setShowForm(false);
      fetchVehicles();
    } catch (err: any) {
      console.error("Failed to create vehicle:", err);
      if (err.response?.data?.detail) {
        alert(`Error: ${err.response.data.detail}`);
      } else {
        alert("Failed to create vehicle");
      }
    }
  }

  async function deleteVehicle(vin: string) {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      await api.delete(`/vehicles/${vin}`);
      console.log("Vehicle deleted:", vin);
      fetchVehicles();
    } catch (err) {
      console.error("Failed to delete vehicle:", err);
      alert("Failed to delete vehicle");
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '✅';
      case 'inactive':
        return '⏸️';
      case 'maintenance':
        return '🔧';
      case 'suspended':
        return '🚫';
      default:
        return '❓';
    }
  };

  const getFleetName = (fleetId?: string) => {
    if (!fleetId) return "—";
    const fleet = fleets.find(f => f.fleet_id === fleetId);
    return fleet ? fleet.name : fleetId;
  };

  const getOwnerName = (ownerId?: string) => {
    if (!ownerId) return "—";
    const owner = owners.find(o => o.owner_id === ownerId);
    return owner ? owner.name : ownerId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-4">🚗</span>
                Vehicle Management
              </h1>
              <p className="text-xl text-gray-600">Manage your fleet vehicles and their configurations</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">{vehicles.length}</div>
              <div className="text-sm text-gray-500 font-semibold">Total Vehicles</div>
            </div>
          </div>
        </div>

        {/* Add Vehicle Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center"
          >
            <span className="mr-2">{showForm ? "✕" : "🚗"}</span>
            {showForm ? "Cancel" : "Add New Vehicle"}
          </button>
        </div>

        {/* Add Vehicle Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">📝</span>
              Add New Vehicle
            </h2>
            <form onSubmit={createVehicle} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Manufacturer</label>
                  <input
                    type="text"
                    value={form.manufacturer || ""}
                    onChange={e => setForm({ ...form, manufacturer: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g., Toyota"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Model</label>
                  <input
                    type="text"
                    value={form.model || ""}
                    onChange={e => setForm({ ...form, model: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g., Camry"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Registration Status</label>
                  <select
                    value={form.registration_status || ""}
                    onChange={e => setForm({ ...form, registration_status: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    required
                  >
                    <option value="Active">✅ Active</option>
                    <option value="Inactive">⏸️ Inactive</option>
                    <option value="Maintenance">🔧 Maintenance</option>
                    <option value="Suspended">🚫 Suspended</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Fleet (Optional)</label>
                  <select
                    value={form.fleet_id || ""}
                    onChange={e => setForm({ ...form, fleet_id: e.target.value || undefined })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  >
                    <option value="">Select Fleet</option>
                    {fleets.map(fleet => (
                      <option key={fleet._id || fleet.fleet_id} value={fleet.fleet_id}>
                        {fleet.name} ({fleet.fleet_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Owner (Optional)</label>
                  <select
                    value={form.owner_id || ""}
                    onChange={e => setForm({ ...form, owner_id: e.target.value || undefined })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  >
                    <option value="">Select Owner</option>
                    {owners.map(owner => (
                      <option key={owner._id || owner.owner_id} value={owner.owner_id}>
                        {owner.name} ({owner.owner_id})
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
                  Create Vehicle
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

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((vehicle, index) => (
            <div key={vehicle._id || vehicle.vin || index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100 overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🚗</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{vehicle.manufacturer} {vehicle.model}</h3>
                      <p className="text-sm text-gray-500 font-mono">{vehicle.vin}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(vehicle.registration_status)}`}>
                      <span className="mr-1">{getStatusIcon(vehicle.registration_status)}</span>
                      {vehicle.registration_status}
                    </div>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-2">🚚</span>
                      <span className="font-semibold text-blue-800">Fleet</span>
                    </div>
                    <span className="text-sm text-gray-700">{getFleetName(vehicle.fleet_id)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-green-600 mr-2">👥</span>
                      <span className="font-semibold text-green-800">Owner</span>
                    </div>
                    <span className="text-sm text-gray-700">{getOwnerName(vehicle.owner_id)}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={() => deleteVehicle(vehicle.vin)}
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
        {vehicles.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🚗</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No vehicles found</h3>
            <p className="text-gray-600 text-lg mb-8">Get started by adding your first vehicle to the fleet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg"
            >
              🚗 Add First Vehicle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
