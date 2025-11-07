"use client";
import { useEffect, useState } from "react";
import api from "../lib/api";

interface DashboardData {
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

export default function Page() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function loadDashboardData() {
        try {
            setLoading(true);
            setError(null);

            console.log("Loading dashboard data...");

            // Use the dashboard stats endpoint for better performance
            const dashboardRes = await api.get("/dashboard/stats");
            console.log("Dashboard stats:", dashboardRes.data);

            setData(dashboardRes.data);
        } catch (err: any) {
            console.error("Dashboard load error:", err);
            if (err.response?.data?.detail) {
                setError(`Failed to load dashboard data: ${err.response.data.detail}`);
            } else {
                setError("Failed to load dashboard data");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
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
                        <h2 className="text-2xl font-bold mb-2">Dashboard Error</h2>
                        <p className="text-lg">{error}</p>
                    </div>
                    <button
                        onClick={loadDashboardData}
                        className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg"
                    >
                        🔄 Retry Loading
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const metricCards = [
        {
            title: "Total Vehicles",
            value: data.totalVehicles,
            icon: "🚗",
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
            change: "+12%",
            changeType: "positive"
        },
        {
            title: "Active Vehicles",
            value: data.activeVehicles,
            icon: "✅",
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-50",
            textColor: "text-green-600",
            change: "+8%",
            changeType: "positive"
        },
        {
            title: "Total Drivers",
            value: data.totalDrivers,
            icon: "👨‍💼",
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-50",
            textColor: "text-purple-600",
            change: "+15%",
            changeType: "positive"
        },
        {
            title: "Total Fleets",
            value: data.totalFleets,
            icon: "🚚",
            color: "from-orange-500 to-orange-600",
            bgColor: "bg-orange-50",
            textColor: "text-orange-600",
            change: "+5%",
            changeType: "positive"
        },
        {
            title: "Total Trips",
            value: data.totalTrips,
            icon: "🗺️",
            color: "from-indigo-500 to-indigo-600",
            bgColor: "bg-indigo-50",
            textColor: "text-indigo-600",
            change: "+20%",
            changeType: "positive"
        },
        {
            title: "Maintenance Records",
            value: data.totalMaintenance,
            icon: "🔧",
            color: "from-yellow-500 to-yellow-600",
            bgColor: "bg-yellow-50",
            textColor: "text-yellow-600",
            change: "+3%",
            changeType: "positive"
        },
        {
            title: "Recent Alerts",
            value: data.recentAlerts,
            icon: "⚠️",
            color: "from-red-500 to-red-600",
            bgColor: "bg-red-50",
            textColor: "text-red-600",
            change: "-10%",
            changeType: "negative"
        },
        {
            title: "Avg Fuel Level",
            value: `${data.avgFuel.toFixed(1)}%`,
            icon: "⛽",
            color: "from-teal-500 to-teal-600",
            bgColor: "bg-teal-50",
            textColor: "text-teal-600",
            change: "+2%",
            changeType: "positive"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-5xl font-bold text-gray-900 mb-3 flex items-center">
                                <span className="mr-4">📊</span>
                                Fleet Dashboard
                            </h1>
                            <p className="text-xl text-gray-600">Real-time insights into your connected car fleet operations</p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold text-indigo-600">{data.totalVehicles}</div>
                            <div className="text-sm text-gray-500 font-semibold">Total Assets</div>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {metricCards.map((card, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${card.bgColor}`}>
                                        <span className="text-2xl">{card.icon}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xs font-semibold ${card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                                            {card.change}
                                        </div>
                                        <div className="text-xs text-gray-500">vs last month</div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-1">{card.title}</h3>
                                    <div className={`text-3xl font-bold ${card.textColor}`}>{card.value}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Performance Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Fleet Utilization */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <span className="mr-3">📈</span>
                            Fleet Utilization
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                                <div className="flex items-center">
                                    <span className="text-blue-600 mr-3">🚗</span>
                                    <span className="font-semibold text-gray-900">Active Vehicles</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-600">{data.activeVehicles}</div>
                                    <div className="text-sm text-gray-500">of {data.totalVehicles} total</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                                <div className="flex items-center">
                                    <span className="text-green-600 mr-3">👨‍💼</span>
                                    <span className="font-semibold text-gray-900">Assigned Drivers</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-600">{data.totalDrivers}</div>
                                    <div className="text-sm text-gray-500">drivers available</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                                <div className="flex items-center">
                                    <span className="text-purple-600 mr-3">🚚</span>
                                    <span className="font-semibold text-gray-900">Active Fleets</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-purple-600">{data.totalFleets}</div>
                                    <div className="text-sm text-gray-500">fleet operations</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <span className="mr-3">⚡</span>
                            Recent Activity
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                                <div className="flex items-center">
                                    <span className="text-orange-600 mr-3">🗺️</span>
                                    <span className="font-semibold text-gray-900">Total Trips</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-orange-600">{data.totalTrips}</div>
                                    <div className="text-sm text-gray-500">completed today</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                                <div className="flex items-center">
                                    <span className="text-yellow-600 mr-3">🔧</span>
                                    <span className="font-semibold text-gray-900">Maintenance</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-yellow-600">{data.totalMaintenance}</div>
                                    <div className="text-sm text-gray-500">records this month</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                                <div className="flex items-center">
                                    <span className="text-red-600 mr-3">⚠️</span>
                                    <span className="font-semibold text-gray-900">Active Alerts</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-red-600">{data.recentAlerts}</div>
                                    <div className="text-sm text-gray-500">in last 24h</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <span className="mr-3">🚀</span>
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold flex flex-col items-center">
                            <span className="text-2xl mb-2">🚗</span>
                            Add Vehicle
                        </button>
                        <button className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold flex flex-col items-center">
                            <span className="text-2xl mb-2">👨‍💼</span>
                            Add Driver
                        </button>
                        <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold flex flex-col items-center">
                            <span className="text-2xl mb-2">🔧</span>
                            Schedule Maintenance
                        </button>
                        <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold flex flex-col items-center">
                            <span className="text-2xl mb-2">📊</span>
                            View Analytics
                        </button>
                    </div>
                </div>

                {/* Refresh Button */}
                <div className="text-center mt-8">
                    <button
                        onClick={loadDashboardData}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center mx-auto"
                    >
                        <span className="mr-2">🔄</span>
                        Refresh Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
