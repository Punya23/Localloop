import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "LocalLoop — Your Relocation Companion",
  description: "Simplify your city relocation with verified housing, local communities, mentors, and real-time guidance. Built for students and young professionals.",
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
          <Navbar />
          <main className="lg:ml-[240px] min-h-screen pt-[60px] lg:pt-0">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
