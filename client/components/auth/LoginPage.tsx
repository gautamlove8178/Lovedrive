"use client";

import { useEffect, useState } from "react";

import Background from "./Background";
import LoginCard from "./LoginCard";
import Dashboard from "@/components/dashboard/Dashboard";
import { loginUser } from "@/services/auth";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ===============================
  // SESSION BEHAVIOR
  // ===============================
  // Navigation between LoveDrive pages keeps the JWT token.
  // A real browser refresh clears the token and asks for login again.
  useEffect(() => {
    try {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming | undefined;

      const isRefresh =
        navigation?.type === "reload";

      if (isRefresh) {
        localStorage.removeItem("token");
        setLoggedIn(false);
        setCheckingAuth(false);
        return;
      }

      const token = localStorage.getItem("token");

      if (token) {
        setLoggedIn(true);
      }
    } catch (error) {
      console.error(
        "Failed to check login session:",
        error
      );
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  // ===============================
  // LOGIN
  // ===============================
  const handleLogin = async (
    email: string,
    password: string
  ) => {
    try {
      const data = await loginUser(
        email,
        password
      );

      localStorage.setItem(
        "token",
        data.token
      );

      toast.success(
        "Login Successful 🎉"
      );

      setLoggedIn(true);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Login Failed"
      );
    }
  };

  // ===============================
  // AUTH CHECK
  // ===============================
  if (checkingAuth) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#080B14]">
        <Background />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="text-center text-zinc-400">
            Checking secure session...
          </div>
        </div>
      </main>
    );
  }

  // ===============================
  // LOGGED IN
  // ===============================
  if (loggedIn) {
    return <Dashboard />;
  }

  // ===============================
  // LOGIN SCREEN
  // ===============================
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080B14]">
      <Background />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <LoginCard onLogin={handleLogin} />
      </div>
    </main>
  );
}