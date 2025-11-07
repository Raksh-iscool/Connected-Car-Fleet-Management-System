"use client";
import { useEffect, useState } from "react";
import api from "../../lib/api";

interface Alert {
  _id?: string;
  id?: string;
  vin: string;
  timestamp: string;
  alert_type: string;
  message: string;
  severity: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    try {
      setLoading(true);
      const res = await api.get('/alerts');
      console.log("Alerts fetched:", res.data);
      setAlerts(res.data);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === "all" || alert.severity.toLowerCase() === filter;
    const matchesSearch = alert.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.alert_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType.toLowerCase()) {
      case 'speedviolation':
        return '🚨';
      case 'lowfuel':
        return '⛽';
      case 'maintenance':
        return '🔧';
      case 'engine':
        return '⚙️';
      default:
        return '⚠️';
    }
  };

  const getSeverityCount = (severity: string) => {
    return alerts.filter(alert => alert.severity.toLowerCase() === severity.toLowerCase()).length;
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-4">⚠️</span>
                Alert Management
              </h1>
              <p className="text-xl text-gray-600">Monitor and manage fleet alerts and notifications</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-red-600">{alerts.length}</div>
              <div className="text-sm text-gray-500 font-semibold">Total Alerts</div>
            </div>
          </div>
        </div>

        {/* Alert Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-red-50">
                <span className="text-2xl">🚨</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-red-600 font-semibold">Critical</div>
                <div className="text-xs text-gray-500">Priority</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Critical Alerts</h3>
            <div className="text-3xl font-bold text-red-600">{getSeverityCount('critical')}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-orange-50">
                <span className="text-2xl">🔥</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-orange-600 font-semibold">High</div>
                <div className="text-xs text-gray-500">Priority</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">High Priority</h3>
            <div className="text-3xl font-bold text-orange-600">{getSeverityCount('high')}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-yellow-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-yellow-50">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-yellow-600 font-semibold">Medium</div>
                <div className="text-xs text-gray-500">Priority</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Medium Priority</h3>
            <div className="text-3xl font-bold text-yellow-600">{getSeverityCount('medium')}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-50">
                <span className="text-2xl">ℹ️</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-600 font-semibold">Low</div>
                <div className="text-xs text-gray-500">Priority</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Low Priority</h3>
            <div className="text-3xl font-bold text-blue-600">{getSeverityCount('low')}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-red-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Filter by Severity</label>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              >
                <option value="all">All Alerts</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Search Alerts</label>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by VIN, message, or alert type..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAlerts.map((alert, index) => (
            <div key={alert._id || alert.id || index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-red-100 overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{getAlertIcon(alert.alert_type)}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{alert.alert_type}</h3>
                      <p className="text-sm text-gray-500 font-mono">{alert.vin}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                      <span className="mr-1">
                        {alert.severity === 'critical' ? '🚨' : alert.severity === 'high' ? '🔥' : alert.severity === 'medium' ? '⚠️' : 'ℹ️'}
                      </span>
                      {alert.severity}
                    </div>
                  </div>
                </div>

                {/* Alert Message */}
                <div className="mb-4">
                  <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-red-500">
                    <p className="text-sm text-gray-700 font-medium">{alert.message}</p>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">🕒</span>
                    <span className="font-semibold text-gray-800">Timestamp</span>
                  </div>
                  <span className="text-sm text-gray-700">{formatDateTime(alert.timestamp)}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      // Handle alert acknowledgment
                      console.log("Acknowledging alert:", alert._id || alert.id);
                    }}
                    className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center mr-2"
                  >
                    <span className="mr-1">✅</span>
                    Acknowledge
                  </button>
                  <button
                    onClick={() => {
                      // Handle alert resolution
                      console.log("Resolving alert:", alert._id || alert.id);
                    }}
                    className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center"
                  >
                    <span className="mr-1">🔧</span>
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAlerts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">✅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No alerts found</h3>
            <p className="text-gray-600 text-lg mb-8">
              {alerts.length === 0
                ? "Great! Your fleet is running smoothly with no active alerts."
                : "No alerts match your current filter criteria."
              }
            </p>
            {alerts.length > 0 && (
              <button
                onClick={() => {
                  setFilter("all");
                  setSearchTerm("");
                }}
                className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg"
              >
                🔄 Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={fetchAlerts}
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center mx-auto"
          >
            <span className="mr-2">🔄</span>
            Refresh Alerts
          </button>
        </div>
      </div>
    </div>
  );
}
