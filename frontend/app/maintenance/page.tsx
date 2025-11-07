"use client";
import { useEffect, useState } from "react";
import api from "../../lib/api";

interface MaintenanceRecord {
  _id?: string;
  record_id: string;
  vin: string;
  service_date: string;
  service_type: string;
  description: string;
  cost: number;
  service_center?: string;
  metadata?: any;
}

interface Vehicle {
  _id?: string;
  id?: string;
  vin: string;
  manufacturer: string;
  model: string;
}

export default function MaintenancePage() {
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<MaintenanceRecord>>({
    vin: "",
    service_date: "",
    service_type: "Oil Change",
    description: "",
    cost: 0,
    service_center: ""
  });

  useEffect(() => {
    fetchMaintenance();
    fetchVehicles();
  }, []);

  async function fetchMaintenance() {
    try {
      setLoading(true);
      const res = await api.get("/maintenance");
      console.log("Maintenance records fetched:", res.data);
      setMaintenance(res.data);
    } catch (err) {
      console.error("Failed to fetch maintenance:", err);
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

  async function createMaintenance(e: React.FormEvent) {
    e.preventDefault();
    if (!form.vin || !form.service_date || !form.service_type || !form.description) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const maintenanceData = {
        ...form,
        record_id: `MNT${Date.now()}`, // Generate a unique record ID
        cost: form.cost || 0,
        metadata: {}
      };

      console.log("Creating maintenance record:", maintenanceData);
      const response = await api.post("/maintenance", maintenanceData);
      console.log("Maintenance record created:", response.data);

      setForm({ vin: "", service_date: "", service_type: "Oil Change", description: "", cost: 0, service_center: "" });
      setShowForm(false);
      fetchMaintenance();
    } catch (err: any) {
      console.error("Failed to create maintenance record:", err);
      if (err.response?.data?.detail) {
        alert(`Error: ${err.response.data.detail}`);
      } else {
        alert("Failed to create maintenance record");
      }
    }
  }

  async function deleteMaintenance(recordId: string) {
    if (!confirm("Are you sure you want to delete this maintenance record?")) return;

    try {
      await api.delete(`/maintenance/${recordId}`);
      console.log("Maintenance record deleted:", recordId);
      fetchMaintenance();
    } catch (err) {
      console.error("Failed to delete maintenance record:", err);
      alert("Failed to delete maintenance record");
    }
  }

  const getVehicleInfo = (vin: string) => {
    const vehicle = vehicles.find(v => v.vin === vin);
    return vehicle ? `${vehicle.manufacturer} ${vehicle.model}` : vin;
  };

  const getServiceTypeColor = (serviceType: string) => {
    switch (serviceType.toLowerCase()) {
      case 'oil change':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'repair':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'inspection':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'tire_rotation':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getServiceTypeIcon = (serviceType: string) => {
    switch (serviceType.toLowerCase()) {
      case 'oil change':
        return '🛢️';
      case 'repair':
        return '🔧';
      case 'inspection':
        return '🔍';
      case 'tire_rotation':
        return '🛞';
      default:
        return '⚙️';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-300 rounded-lg w-64"></div>
            <div className="h-16 bg-gray-300 rounded-lg w-48"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <span className="mr-3">🔧</span>
                Maintenance Management
              </h1>
              <p className="text-gray-600 text-lg">Track and manage vehicle maintenance records with precision</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-orange-600">{maintenance.length}</div>
              <div className="text-sm text-gray-500">Total Records</div>
            </div>
          </div>
        </div>

        {/* Add Maintenance Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center"
          >
            <span className="mr-2">{showForm ? "✕" : "🔧"}</span>
            {showForm ? "Cancel" : "Add Maintenance Record"}
          </button>
        </div>

        {/* Add Maintenance Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-orange-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">📝</span>
              Add New Maintenance Record
            </h2>
            <form onSubmit={createMaintenance} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Vehicle</label>
                  <select
                    value={form.vin || ""}
                    onChange={e => setForm({ ...form, vin: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white"
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
                  <label className="block text-sm font-semibold text-gray-700">Service Type</label>
                  <select
                    value={form.service_type || ""}
                    onChange={e => setForm({ ...form, service_type: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    required
                  >
                    <option value="Oil Change">🛢️ Oil Change</option>
                    <option value="repair">🔧 Repair</option>
                    <option value="inspection">🔍 Inspection</option>
                    <option value="tire_rotation">🛞 Tire Rotation</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Service Date</label>
                  <input
                    type="datetime-local"
                    value={form.service_date || ""}
                    onChange={e => setForm({ ...form, service_date: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Service Center (Optional)</label>
                  <input
                    type="text"
                    value={form.service_center || ""}
                    onChange={e => setForm({ ...form, service_center: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g., Chennai Service Center"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.cost || ""}
                    onChange={e => setForm({ ...form, cost: Number(e.target.value) })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Description</label>
                  <textarea
                    value={form.description || ""}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                    rows={3}
                    placeholder="Describe the maintenance work performed..."
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
                  Create Record
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

        {/* Maintenance Records Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {maintenance.map((record, index) => (
            <div key={record._id || record.record_id || index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-orange-100 overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{getServiceTypeIcon(record.service_type)}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{record.service_type}</h3>
                      <p className="text-sm text-gray-500 font-mono">{record.record_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">${record.cost.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Cost</div>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">🚗</span>
                    <span className="font-semibold text-blue-800">{getVehicleInfo(record.vin)}</span>
                  </div>
                </div>

                {/* Service Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">📅</span>
                    <span className="text-sm text-gray-700">{formatDate(record.service_date)}</span>
                  </div>
                  {record.service_center && (
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">🏢</span>
                      <span className="text-sm text-gray-700">{record.service_center}</span>
                    </div>
                  )}
                  <div className="flex items-start">
                    <span className="text-gray-500 mr-2 mt-1">📝</span>
                    <span className="text-sm text-gray-700 line-clamp-2">{record.description}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={() => deleteMaintenance(record.record_id)}
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
        {maintenance.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🔧</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No maintenance records found</h3>
            <p className="text-gray-600 text-lg mb-8">Get started by adding your first maintenance record to track vehicle services.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg"
            >
              🔧 Add First Record
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

