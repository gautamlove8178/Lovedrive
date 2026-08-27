"use client";

import { ReactNode } from "react";

import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({
  children,
}: MainLayoutProps) {
  return (
    <main className="min-h-screen bg-[#080B14] text-white">

      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <Sidebar />

        {/* CONTENT */}
        <div className="min-w-0 flex-1">

          {/* NAVBAR */}
          <Navbar />

          {/* PAGE */}
          <section className="min-h-[calc(100vh-72px)]">
            {children}
          </section>

        </div>

      </div>

    </main>
  );
}