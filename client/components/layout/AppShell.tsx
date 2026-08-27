"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import MainLayout from "./MainLayout";
import Dashboard from "@/components/dashboard/Dashboard";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({
  children,
}: AppShellProps) {

  const pathname = usePathname();

  const [loggedIn, setLoggedIn] =
    useState<boolean | null>(null);

  useEffect(() => {

    const checkAuth = () => {
      const token =
        localStorage.getItem("token");

      setLoggedIn(!!token);
    };

    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener(
      "auth-changed",
      handleAuthChange
    );

    window.addEventListener(
      "storage",
      handleAuthChange
    );

    return () => {

      window.removeEventListener(
        "auth-changed",
        handleAuthChange
      );

      window.removeEventListener(
        "storage",
        handleAuthChange
      );
    };

  }, []);

  // Loading
  if (loggedIn === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080B14]">

        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />

      </main>
    );
  }

  // Not logged in
  if (!loggedIn) {
    return <>{children}</>;
  }

  // Logged in
  return (
    <MainLayout>

      {pathname === "/" ? (
        <Dashboard />
      ) : (
        children
      )}

    </MainLayout>
  );
}