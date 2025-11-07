"use client";
import { useEffect, useState } from "react";
import api from "../../lib/api";

interface AnalyticsData {
  totalVehicles: number;
  totalDrivers: number;
  totalFleets: number;
  totalOwners: number;
  totalTrips: number;
  totalMaintenance: number;
  recentAlerts: number;
  activeVehicles: number;
  avgFuel: number;
}

interface Vehicle {
  _id?: string;
  id?: string;
  vin: string;
  manufacturer: string;
  model: string;
  registration_status: string;
}

interface Trip {
  _id?: string;
  trip_id: string;
  vin: string;
  distance: number;
  start_time: string;
  end_time: string;
}

interface MaintenanceRecord {
  _id?: string;
  record_id: string;
  vin: string;
  service_type: string;
  cost: number;
  service_date: string;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  async function fetchAnalyticsData() {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data concurrently
      const [dashboardRes, vehiclesRes, tripsRes, maintenanceRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/vehicles"),
        api.get("/trips"),
        api.get("/maintenance")
      ]);

      setAnalyticsData(dashboardRes.data);
      setVehicles(vehiclesRes.data);
      setTrips(tripsRes.data);
      setMaintenance(maintenanceRes.data);
    } catch (err: any) {
      console.error("Analytics load error:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }

  const getVehicleStatusDistribution = () => {
    const statusCounts: { [key: string]: number } = {};
    vehicles.forEach(vehicle => {
      statusCounts[vehicle.registration_status] = (statusCounts[vehicle.registration_status] || 0) + 1;
    });
    return statusCounts;
  };

  const getManufacturerDistribution = () => {
    const manufacturerCounts: { [key: string]: number } = {};
    vehicles.forEach(vehicle => {
      manufacturerCounts[vehicle.manufacturer] = (manufacturerCounts[vehicle.manufacturer] || 0) + 1;
    });
    return manufacturerCounts;
  };

  const getMonthlyTrips = () => {
    const monthlyCounts: { [key: string]: number } = {};
    trips.forEach(trip => {
      const month = new Date(trip.start_time).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });
    return monthlyCounts;
  };

  const getMaintenanceCosts = () => {
    const typeCosts: { [key: string]: number } = {};
    maintenance.forEach(record => {
      typeCosts[record.service_type] = (typeCosts[record.service_type] || 0) + record.cost;
    });
    return typeCosts;
  };

  const getTotalDistance = () => {
    return trips.reduce((total, trip) => total + trip.distance, 0);
  };

  const getTotalMaintenanceCost = () => {
    return maintenance.reduce((total, record) => total + record.cost, 0);
  };

  const getAverageTripDistance = () => {
    return trips.length > 0 ? getTotalDistance() / trips.length : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-16 bg-gray-300 rounded-2xl w-80"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-2xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-300 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-red-100 border-2 border-red-300 text-red-700 px-8 py-6 rounded-2xl mb-8 shadow-lg">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Analytics Error</h2>
            <p className="text-lg">{error}</p>
          </div>
          <button
            onClick={fetchAnalyticsData}
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg"
          >
            🔄 Retry Loading
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  const statusDistribution = getVehicleStatusDistribution();
  const manufacturerDistribution = getManufacturerDistribution();
  const monthlyTrips = getMonthlyTrips();
  const maintenanceCosts = getMaintenanceCosts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-4">📊</span>
                Fleet Analytics
              </h1>
              <p className="text-xl text-gray-600">Comprehensive insights into your fleet performance</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-violet-600">{analyticsData.totalVehicles}</div>
              <div className="text-sm text-gray-500 font-semibold">Total Assets</div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-violet-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-50">
                <span className="text-2xl">🚗</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-green-600 font-semibold">+12%</div>
                <div className="text-xs text-gray-500">vs last month</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Total Vehicles</h3>
            <div className="text-3xl font-bold text-blue-600">{analyticsData.totalVehicles}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-violet-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-50">
                <span className="text-2xl">✅</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-green-600 font-semibold">+8%</div>
                <div className="text-xs text-gray-500">vs last month</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Active Vehicles</h3>
            <div className="text-3xl font-bold text-green-600">{analyticsData.activeVehicles}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-violet-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-50">
                <span className="text-2xl">👨‍💼</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-green-600 font-semibold">+15%</div>
                <div className="text-xs text-gray-500">vs last month</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Total Drivers</h3>
            <div className="text-3xl font-bold text-purple-600">{analyticsData.totalDrivers}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-violet-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-orange-50">
                <span className="text-2xl">🚚</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-green-600 font-semibold">+5%</div>
                <div className="text-xs text-gray-500">vs last month</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Total Fleets</h3>
            <div className="text-3xl font-bold text-orange-600">{analyticsData.totalFleets}</div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Trip Performance */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-violet-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">🗺️</span>
              Trip Performance
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
                <div className="flex items-center">
                  <span className="text-indigo-600 mr-3">📊</span>
                  <span className="font-semibold text-gray-900">Total Trips</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">{analyticsData.totalTrips}</div>
                  <div className="text-sm text-gray-500">completed</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center">
                  <span className="text-green-600 mr-3">📏</span>
                  <span className="font-semibold text-gray-900">Total Distance</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{getTotalDistance().toFixed(1)} km</div>
                  <div className="text-sm text-gray-500">covered</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center">
                  <span className="text-purple-600 mr-3">📈</span>
                  <span className="font-semibold text-gray-900">Avg Trip Distance</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{getAverageTripDistance().toFixed(1)} km</div>
                  <div className="text-sm text-gray-500">per trip</div>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Overview */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-violet-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">🔧</span>
              Maintenance Overview
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                <div className="flex items-center">
                  <span className="text-yellow-600 mr-3">🔧</span>
                  <span className="font-semibold text-gray-900">Total Records</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600">{analyticsData.totalMaintenance}</div>
                  <div className="text-sm text-gray-500">maintenance</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                <div className="flex items-center">
                  <span className="text-red-600 mr-3">💰</span>
                  <span className="font-semibold text-gray-900">Total Cost</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">₹{getTotalMaintenanceCost().toFixed(2)}</div>
                  <div className="text-sm text-gray-500">spent</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                <div className="flex items-center">
                  <span className="text-orange-600 mr-3">⛽</span>
                  <span className="font-semibold text-gray-900">Avg Fuel Level</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">{analyticsData.avgFuel.toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">fleet average</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Vehicle Status Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-violet-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">📊</span>
              Vehicle Status Distribution
            </h2>
            <div className="space-y-3">
              {Object.entries(statusDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">
                      {status === 'Active' ? '✅' : status === 'Maintenance' ? '🔧' : status === 'Inactive' ? '⏸️' : '🚫'}
                    </span>
                    <span className="font-semibold text-gray-900">{status}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-violet-600">{count}</div>
                    <div className="text-xs text-gray-500">vehicles</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manufacturer Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-violet-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">🏭</span>
              Manufacturer Distribution
            </h2>
            <div className="space-y-3">
              {Object.entries(manufacturerDistribution).map(([manufacturer, count]) => (
                <div key={manufacturer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">🚗</span>
                    <span className="font-semibold text-gray-900">{manufacturer}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-violet-600">{count}</div>
                    <div className="text-xs text-gray-500">vehicles</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Maintenance Costs by Type */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-violet-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">💰</span>
            Maintenance Costs by Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(maintenanceCosts).map(([type, cost]) => (
              <div key={type} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-yellow-600 mr-2">
                      {type === 'Oil Change' ? '🛢️' : type === 'Brake Service' ? '🛞' : type === 'Engine Repair' ? '🔧' : '🔍'}
                    </span>
                    <span className="font-semibold text-gray-900">{type}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-600">₹{cost.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">total cost</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-violet-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">⚠️</span>
            Recent Alerts
          </h2>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{analyticsData.recentAlerts} Active Alerts</h3>
            <p className="text-gray-600">Monitor your fleet for any issues requiring attention</p>
          </div>
        </div>

        {/* Fleet Utilization */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-violet-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">📈</span>
            Fleet Utilization
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl mb-2">🚗</div>
              <div className="text-2xl font-bold text-blue-600">{analyticsData.activeVehicles}</div>
              <div className="text-sm text-gray-600">Active Vehicles</div>
              <div className="text-xs text-gray-500 mt-1">
                {analyticsData.totalVehicles > 0 ? Math.round((analyticsData.activeVehicles / analyticsData.totalVehicles) * 100) : 0}% utilization
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-3xl mb-2">👨‍💼</div>
              <div className="text-2xl font-bold text-green-600">{analyticsData.totalDrivers}</div>
              <div className="text-sm text-gray-600">Available Drivers</div>
              <div className="text-xs text-gray-500 mt-1">Ready for assignment</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-3xl mb-2">🚚</div>
              <div className="text-2xl font-bold text-purple-600">{analyticsData.totalFleets}</div>
              <div className="text-sm text-gray-600">Active Fleets</div>
              <div className="text-xs text-gray-500 mt-1">Operational groups</div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={fetchAnalyticsData}
            className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center mx-auto"
          >
            <span className="mr-2">🔄</span>
            Refresh Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
