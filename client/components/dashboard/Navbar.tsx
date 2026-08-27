"use client";

import {
  Bell,
  Search,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import api from "@/lib/axios";

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function Navbar() {
  const [user, setUser] =
    useState<UserData | null>(null);

  const [loading, setLoading] =
    useState(true);

  // =====================================================
  // GET CURRENT USER
  // =====================================================

  const fetchUser = async () => {
    try {
      const res =
        await api.get("/auth/me");

      if (res.data.success) {
        setUser(res.data.user);
      }

    } catch (error) {
      console.error(
        "NAVBAR USER ERROR:",
        error
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD USER + LISTEN FOR PROFILE UPDATES
  // =====================================================

  useEffect(() => {
    fetchUser();

    const handleUserUpdated = () => {
      fetchUser();
    };

    window.addEventListener(
      "user-updated",
      handleUserUpdated
    );

    return () => {
      window.removeEventListener(
        "user-updated",
        handleUserUpdated
      );
    };
  }, []);

  // =====================================================
  // INITIALS
  // =====================================================

  const getInitials = (
    name?: string
  ) => {
    if (!name?.trim()) {
      return "U";
    }

    const parts =
      name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  return (
    <header className="flex min-h-[96px] items-center justify-between border-b border-white/10 bg-[#0D1528] px-4 py-5 md:px-8">

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="relative w-full max-w-[520px]">

        <Search
          className="absolute left-7 top-1/2 -translate-y-1/2 text-zinc-500"
          size={32}
        />

        <input
          type="text"
          placeholder="Search files..."
          className="w-full rounded-2xl border border-white/10 bg-[#111C34] py-5 pl-20 pr-5 text-xl text-white outline-none placeholder:text-zinc-500 focus:border-blue-500/40"
        />

      </div>

      {/* =================================================
          RIGHT SIDE
      ================================================= */}

      <div className="ml-5 flex shrink-0 items-center gap-5">

        {/* NOTIFICATION */}

        <button
          type="button"
          className="text-zinc-400 transition hover:text-white"
        >
          <Bell
            size={34}
          />
        </button>

        {/* =================================================
            USER PROFILE
        ================================================= */}

        <div className="flex items-center gap-4">

          {/* AVATAR */}

          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-2xl font-bold text-white shadow-lg">

            {loading ? (

              <span>
                ...
              </span>

            ) : user?.avatar ? (

              <img
                src={user.avatar}
                alt={
                  user.name ||
                  "Profile"
                }
                className="h-full w-full object-cover"
              />

            ) : (

              <span>
                {getInitials(
                  user?.name
                )}
              </span>

            )}

          </div>

          {/* NAME */}

          <div className="min-w-0">

            <p className="max-w-[190px] text-2xl font-bold leading-tight text-white">

              {loading
                ? "Loading..."
                : user?.name ||
                  "User"}

            </p>

            <p className="mt-1 max-w-[220px] truncate text-lg text-zinc-400">

              {loading
                ? ""
                : user?.email ||
                  ""}

            </p>

          </div>

        </div>

      </div>

    </header>
  );
}