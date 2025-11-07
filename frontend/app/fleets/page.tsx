"use client";
import { useEffect, useState } from "react";
import api from "../../lib/api";

interface Fleet {
  _id?: string;
  fleet_id: string;
  name: string;
  owner_id: string;
  vehicles: string[];
  metadata?: any;
}

interface Owner {
  _id?: string;
  owner_id: string;
  name: string;
  email: string;
  phone: string;
}

interface Vehicle {
  _id?: string;
  id?: string;
  vin: string;
  manufacturer: string;
  model: string;
}

export default function FleetsPage() {
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Fleet>>({
    name: "",
    owner_id: "",
    vehicles: []
  });

  useEffect(() => {
    fetchFleets();
    fetchOwners();
    fetchVehicles();
  }, []);

  async function fetchFleets() {
    try {
      setLoading(true);
      const res = await api.get("/fleets");
      console.log("Fleets fetched:", res.data);
      setFleets(res.data);
    } catch (err) {
      console.error("Failed to fetch fleets:", err);
    } finally {
      setLoading(false);
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

  async function fetchVehicles() {
    try {
      const res = await api.get("/vehicles");
      console.log("Vehicles fetched:", res.data);
      setVehicles(res.data);
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
    }
  }

  async function createFleet(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.owner_id) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const fleetData = {
        ...form,
        fleet_id: `FLT${Date.now()}`, // Generate a unique fleet ID
        vehicles: form.vehicles || [],
        metadata: {}
      };

      console.log("Creating fleet:", fleetData);
      const response = await api.post("/fleets", fleetData);
      console.log("Fleet created:", response.data);

      setForm({ name: "", owner_id: "", vehicles: [] });
      setShowForm(false);
      fetchFleets();
    } catch (err: any) {
      console.error("Failed to create fleet:", err);
      if (err.response?.data?.detail) {
        alert(`Error: ${err.response.data.detail}`);
      } else {
        alert("Failed to create fleet");
      }
    }
  }

  async function deleteFleet(fleetId: string) {
    if (!confirm("Are you sure you want to delete this fleet?")) return;

    try {
      await api.delete(`/fleets/${fleetId}`);
      console.log("Fleet deleted:", fleetId);
      fetchFleets();
    } catch (err) {
      console.error("Failed to delete fleet:", err);
      alert("Failed to delete fleet");
    }
  }

  const getOwnerName = (ownerId: string) => {
    const owner = owners.find(o => o.owner_id === ownerId);
    return owner ? owner.name : ownerId;
  };

  const getVehicleInfo = (vin: string) => {
    const vehicle = vehicles.find(v => v.vin === vin);
    return vehicle ? `${vehicle.manufacturer} ${vehicle.model}` : vin;
  };

  const handleVehicleToggle = (vin: string) => {
    const currentVehicles = form.vehicles || [];
    const updatedVehicles = currentVehicles.includes(vin)
      ? currentVehicles.filter(v => v !== vin)
      : [...currentVehicles, vin];
    setForm({ ...form, vehicles: updatedVehicles });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-4">🚚</span>
                Fleet Management
              </h1>
              <p className="text-xl text-gray-600">Manage your vehicle fleets and their assignments</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-orange-600">{fleets.length}</div>
              <div className="text-sm text-gray-500 font-semibold">Total Fleets</div>
            </div>
          </div>
        </div>

        {/* Add Fleet Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center"
          >
            <span className="mr-2">{showForm ? "✕" : "🚚"}</span>
            {showForm ? "Cancel" : "Add New Fleet"}
          </button>
        </div>

        {/* Add Fleet Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-orange-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">📝</span>
              Add New Fleet
            </h2>
            <form onSubmit={createFleet} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Fleet Name</label>
                  <input
                    type="text"
                    value={form.name || ""}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g., East Coast Fleet"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Owner</label>
                  <select
                    value={form.owner_id || ""}
                    onChange={e => setForm({ ...form, owner_id: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    required
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

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">Assign Vehicles</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                  {vehicles.map(vehicle => (
                    <label key={vehicle._id || vehicle.id || vehicle.vin} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        checked={(form.vehicles || []).includes(vehicle.vin)}
                        onChange={() => handleVehicleToggle(vehicle.vin)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        {vehicle.manufacturer} {vehicle.model} ({vehicle.vin})
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Selected vehicles: <span className="font-semibold text-orange-600">{(form.vehicles || []).length}</span>
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center"
                >
                  <span className="mr-2">✅</span>
                  Create Fleet
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

        {/* Fleets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {fleets.map((fleet, index) => (
            <div key={fleet._id || fleet.fleet_id || index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-orange-100 overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🚚</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{fleet.name}</h3>
                      <p className="text-sm text-gray-500 font-mono">{fleet.fleet_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                      <span className="mr-1">🚗</span>
                      {fleet.vehicles?.length || 0} vehicles
                    </div>
                  </div>
                </div>

                {/* Fleet Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-2">👥</span>
                      <span className="font-semibold text-blue-800">Owner</span>
                    </div>
                    <span className="text-sm text-gray-700">{getOwnerName(fleet.owner_id)}</span>
                  </div>
                </div>

                {/* Vehicle List */}
                {fleet.vehicles && fleet.vehicles.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <span className="mr-1">🚗</span>
                      Assigned Vehicles:
                    </h4>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {fleet.vehicles.slice(0, 3).map(vin => (
                        <div key={vin} className="text-xs bg-gray-50 px-2 py-1 rounded-lg border">
                          {getVehicleInfo(vin)}
                        </div>
                      ))}
                      {fleet.vehicles.length > 3 && (
                        <div className="text-xs text-gray-500 italic">
                          +{fleet.vehicles.length - 3} more vehicles
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={() => deleteFleet(fleet.fleet_id)}
                    className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center"
                  >
                    <span className="mr-1">🗑️</span>
                    Delete Fleet
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {fleets.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🚚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No fleets found</h3>
            <p className="text-gray-600 text-lg mb-8">Get started by creating your first fleet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg"
            >
              🚚 Create First Fleet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

