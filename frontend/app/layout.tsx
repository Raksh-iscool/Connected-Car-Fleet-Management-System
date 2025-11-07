// app/layout.tsx
import "../globals.css";
import Sidebar from "../components/Sidebar";
export const metadata = { title: "Fleet Management" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-gray-50">
                <Sidebar />
                <main className="ml-72 min-h-screen p-6">
                    {children}
                </main>
            </body>
        </html>
    );
}
