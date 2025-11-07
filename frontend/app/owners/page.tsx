"use client";
import { useEffect, useState } from "react";
import api from "../../lib/api";

interface Owner {
  _id?: string;
  owner_id: string;
  name: string;
  email: string;
  phone: string;
}

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Owner>>({
    name: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    fetchOwners();
  }, []);

  async function fetchOwners() {
    try {
      setLoading(true);
      const res = await api.get("/owners");
      console.log("Owners fetched:", res.data);
      setOwners(res.data);
    } catch (err) {
      console.error("Failed to fetch owners:", err);
    } finally {
      setLoading(false);
    }
  }

  async function createOwner(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const ownerData = {
        ...form,
        owner_id: `OWN${Date.now()}`, // Generate a unique owner ID
      };

      console.log("Creating owner:", ownerData);
      const response = await api.post("/owners", ownerData);
      console.log("Owner created:", response.data);

      setForm({ name: "", email: "", phone: "" });
      setShowForm(false);
      fetchOwners();
    } catch (err: any) {
      console.error("Failed to create owner:", err);
      if (err.response?.data?.detail) {
        alert(`Error: ${err.response.data.detail}`);
      } else {
        alert("Failed to create owner");
      }
    }
  }

  async function deleteOwner(ownerId: string) {
    if (!confirm("Are you sure you want to delete this owner?")) return;

    try {
      await api.delete(`/owners/${ownerId}`);
      console.log("Owner deleted:", ownerId);
      fetchOwners();
    } catch (err) {
      console.error("Failed to delete owner:", err);
      alert("Failed to delete owner");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-4">👥</span>
                Owner Management
              </h1>
              <p className="text-xl text-gray-600">Manage fleet owners and their contact information</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-emerald-600">{owners.length}</div>
              <div className="text-sm text-gray-500 font-semibold">Total Owners</div>
            </div>
          </div>
        </div>

        {/* Add Owner Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center"
          >
            <span className="mr-2">{showForm ? "✕" : "👥"}</span>
            {showForm ? "Cancel" : "Add New Owner"}
          </button>
        </div>

        {/* Add Owner Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-emerald-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">📝</span>
              Add New Owner
            </h2>
            <form onSubmit={createOwner} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={form.name || ""}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g., John Smith"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                  <input
                    type="email"
                    value={form.email || ""}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g., john@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone || ""}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g., +1234567890"
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
                  Create Owner
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

        {/* Owners Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {owners.map((owner, index) => (
            <div key={owner._id || owner.owner_id || index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-emerald-100 overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">👥</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{owner.name}</h3>
                      <p className="text-sm text-gray-500 font-mono">{owner.owner_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <span className="mr-1">👑</span>
                      Owner
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-emerald-600 mr-2">📧</span>
                      <span className="font-semibold text-emerald-800">Email</span>
                    </div>
                    <span className="text-sm text-gray-700 truncate">{owner.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-teal-600 mr-2">📞</span>
                      <span className="font-semibold text-teal-800">Phone</span>
                    </div>
                    <span className="text-sm text-gray-700">{owner.phone}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={() => deleteOwner(owner.owner_id)}
                    className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center"
                  >
                    <span className="mr-1">🗑️</span>
                    Delete Owner
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {owners.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">👥</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No owners found</h3>
            <p className="text-gray-600 text-lg mb-8">Get started by adding your first fleet owner.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg"
            >
              👥 Add First Owner
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

