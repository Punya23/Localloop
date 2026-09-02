import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";
import LayoutShell from "@/components/LayoutShell";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";


export const metadata: Metadata = {
  title: "LocalLoop — Your Relocation Companion",
  description: "Simplify your city relocation with verified housing, local communities, mentors, and real-time guidance.",
  keywords: ["relocation", "housing", "community", "students", "PG", "hostel", "Pune", "mentor"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <LayoutShell>
            {children}
            <Analytics />
            <SpeedInsights />
          </LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
