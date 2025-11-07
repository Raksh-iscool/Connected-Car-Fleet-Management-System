"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname();

    const items = [
        { href: "/", label: "Dashboard", icon: "📊" },
        { href: "/vehicles", label: "Vehicles", icon: "🚗" },
        { href: "/drivers", label: "Drivers", icon: "👨‍💼" },
        { href: "/fleets", label: "Fleets", icon: "🚚" },
        { href: "/trips", label: "Trips", icon: "🗺️" },
        { href: "/owners", label: "Owners", icon: "👥" },
        { href: "/maintenance", label: "Maintenance", icon: "🔧" },
        { href: "/telemetry", label: "Telemetry", icon: "📡" },
        { href: "/alerts", label: "Alerts", icon: "⚠️" },
        { href: "/analytics", label: "Analytics", icon: "📈" },
    ];

    return (
        <aside className="fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-indigo-950 to-indigo-900 text-white shadow-xl flex flex-col">
            {/* Logo/Brand */}
            <div className="p-6 flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🚗</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Fleet Manager</h1>
                        <p className="text-xs text-indigo-300">Connected Car System</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="px-4 flex-1 overflow-y-auto">
                <div className="space-y-2 pb-4">
                    {items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                    ? "bg-indigo-700 text-white shadow"
                                    : "text-indigo-100 hover:bg-indigo-800 hover:text-white"
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 flex-shrink-0 border-t border-indigo-800">
                <div className="text-center">
                    <p className="text-xs text-indigo-300">System Status: Online ✅</p>
                    <p className="text-xs text-indigo-400 mt-1">v2.0.0</p>
                </div>
            </div>
        </aside>
    );
}
