"use client";

import { useState } from "react";

import Background from "./Background";
import LoginCard from "./LoginCard";
import Dashboard from "@/components/dashboard/Dashboard";

export default function LoginPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (loggedIn) {
    return <Dashboard />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080B14]">
      <Background />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <LoginCard onLogin={() => setLoggedIn(true)} />
      </div>
    </main>
  );
}