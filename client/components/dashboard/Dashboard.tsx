"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Folder,
  Star,
  Trash2,
  Share2,
  Upload,
  Plus,
  Clock3,
  HardDrive,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import StorageCard from "./StorageCard";
import UploadZone from "@/components/upload/UploadZone";
import FileList from "../files/FileList";
import api from "@/lib/axios";

interface FileItem {
  _id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
  isFavorite?: boolean;
  isTrashed?: boolean;
  sharedWith?: unknown[];
  shareLinks?: unknown[];
}

interface FolderItem {
  _id: string;
  name: string;
  parent: string | null;
  isTrashed: boolean;
}

interface DashboardStats {
  files: number;
  folders: number;
  favorites: number;
  trash: number;
  shared: number;
}

export default function Dashboard() {
  const [stats, setStats] =
    useState<DashboardStats>({
      files: 0,
      folders: 0,
      favorites: 0,
      trash: 0,
      shared: 0,
    });

  const [recentFiles, setRecentFiles] =
    useState<FileItem[]>([]);

  const [loadingStats, setLoadingStats] =
    useState(true);

  const userId =
    "6a74d3deddb93b41d70d2e41";

  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  const fetchDashboard = async () => {
    try {
      setLoadingStats(true);

      const [
        filesRes,
        favoritesRes,
        trashRes,
        sharedRes,
      ] = await Promise.all([
        api.get("/files/list", {
          params: { userId },
        }),

        api.get("/files/favorites", {
          params: { userId },
        }),

        api.get("/files/trash", {
          params: { userId },
        }),

        api.get("/files/shared", {
          params: { userId },
        }),
      ]);

      const files: FileItem[] =
        filesRes.data.success
          ? filesRes.data.files || []
          : [];

      const favorites =
        favoritesRes.data.success
          ? favoritesRes.data.files || []
          : [];

      const trashFiles =
        trashRes.data.success
          ? trashRes.data.files || []
          : [];

      const shared =
        sharedRes.data.success
          ? sharedRes.data.files || []
          : [];

      // ---------------------------------------------------
      // LOAD ALL ACTIVE FOLDERS
      // ---------------------------------------------------

      const allFolders: FolderItem[] = [];

      const loadFolders = async (
        parent: string | null
      ): Promise<void> => {
        const res = await api.get(
          "/folders",
          {
            params: {
              parent,
            },
          }
        );

        if (!res.data.success) {
          return;
        }

        const folders: FolderItem[] =
          res.data.folders || [];

        for (const folder of folders) {
          allFolders.push(folder);

          await loadFolders(
            folder._id
          );
        }
      };

      await loadFolders(null);

      // ---------------------------------------------------
      // RECENT FILES
      // ---------------------------------------------------

      const recent = [...files]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

      setRecentFiles(recent);

      setStats({
        files: files.length,
        folders: allFolders.length,
        favorites: favorites.length,
        trash: trashFiles.length,
        shared: shared.length,
      });
    } catch (error: any) {
      console.error(
        "DASHBOARD ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const handleRefresh = () => {
      fetchDashboard();
    };

    window.addEventListener(
      "files-updated",
      handleRefresh
    );

    return () => {
      window.removeEventListener(
        "files-updated",
        handleRefresh
      );
    };
  }, []);

  // =====================================================
  // HELPERS
  // =====================================================

  const formatSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`;
    }

    if (
      size <
      1024 * 1024 * 1024
    ) {
      return `${(
        size /
        1024 /
        1024
      ).toFixed(1)} MB`;
    }

    return `${(
      size /
      1024 /
      1024 /
      1024
    ).toFixed(1)} GB`;
  };

  const formatDate = (date: string) => {
    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const statsCards = useMemo(
    () => [
      {
        title: "Total Files",
        value: stats.files,
        icon: FileText,
        iconClass:
          "bg-blue-500/10 text-blue-400",
      },
      {
        title: "Folders",
        value: stats.folders,
        icon: Folder,
        iconClass:
          "bg-cyan-500/10 text-cyan-400",
      },
      {
        title: "Favorites",
        value: stats.favorites,
        icon: Star,
        iconClass:
          "bg-yellow-500/10 text-yellow-400",
      },
      {
        title: "Trash",
        value: stats.trash,
        icon: Trash2,
        iconClass:
          "bg-red-500/10 text-red-400",
      },
    ],
    [stats]
  );

  return (
    <main className="flex min-h-screen bg-[#080B14] text-white">

      <Sidebar />

      <section className="min-w-0 flex-1">

        <Navbar />

        <div className="space-y-8 p-5 sm:p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <p className="mb-2 text-sm font-medium text-blue-400">
                LoveDrive Private Cloud
              </p>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome Back 👋
              </h2>

              <p className="mt-2 text-zinc-400">
                Everything you need is right here.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById(
                      "upload-zone"
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    })
                }
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
              >
                <Upload className="h-4 w-4" />
                Upload
              </button>

              <button
                type="button"
                onClick={() =>
                  window.location.href =
                    "/my-files"
                }
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
              >
                <Folder className="h-4 w-4" />
                My Files
              </button>

            </div>
          </div>

          {/* =================================================
              QUICK STATS
          ================================================= */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {statsCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-white/5 bg-[#10192E] p-5 transition hover:-translate-y-0.5 hover:border-blue-500/20"
                >
                  <div className="flex items-center justify-between">

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {loadingStats && (
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
                    )}

                  </div>

                  <p className="mt-5 text-sm text-zinc-500">
                    {card.title}
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {card.value}
                  </p>

                </div>
              );
            })}

          </div>

          {/* =================================================
              STORAGE
          ================================================= */}

          <StorageCard />

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section>

            <div className="mb-4">
              <h2 className="text-xl font-bold">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Manage your cloud in one click.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById(
                      "upload-zone"
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    })
                }
                className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-[#10192E] p-5 text-left transition hover:border-blue-500/30 hover:bg-[#14203A]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition group-hover:scale-105">
                  <Upload className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-semibold">
                    Upload File
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Add a new file
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  window.location.href =
                    "/my-files"
                }
                className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-[#10192E] p-5 text-left transition hover:border-cyan-500/30 hover:bg-[#14203A]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 transition group-hover:scale-105">
                  <Plus className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-semibold">
                    New Folder
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Organize your files
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  window.location.href =
                    "/favorites"
                }
                className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-[#10192E] p-5 text-left transition hover:border-yellow-500/30 hover:bg-[#14203A]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400 transition group-hover:scale-105">
                  <Star className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-semibold">
                    Favorites
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {stats.favorites} saved files
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  window.location.href =
                    "/trash"
                }
                className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-[#10192E] p-5 text-left transition hover:border-red-500/30 hover:bg-[#14203A]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400 transition group-hover:scale-105">
                  <Trash2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-semibold">
                    Trash
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {stats.trash} deleted files
                  </p>
                </div>
              </button>

            </div>
          </section>

          {/* =================================================
              UPLOAD
          ================================================= */}

          <UploadZone />

          {/* =================================================
              RECENT FILES
          ================================================= */}

          {recentFiles.length > 0 && (
            <section>

              <div className="mb-4 flex items-end justify-between">

                <div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-5 w-5 text-blue-400" />

                    <h2 className="text-xl font-bold">
                      Recent Files
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-zinc-500">
                    Your latest uploaded files.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    window.location.href =
                      "/my-files"
                  }
                  className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
                >
                  View all →
                </button>

              </div>

              <div className="space-y-3">

                {recentFiles.map(
                  (file) => (
                    <div
                      key={file._id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#10192E] p-4 transition hover:border-blue-500/20"
                    >

                      <div className="flex min-w-0 items-center gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                          <FileText className="h-5 w-5 text-blue-400" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {file.name}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {formatSize(
                              file.size
                            )}{" "}
                            •{" "}
                            {formatDate(
                              file.createdAt
                            )}
                          </p>
                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            `/my-files`,
                            "_self"
                          )
                        }
                        className="shrink-0 rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10"
                      >
                        Open
                      </button>

                    </div>
                  )
                )}

              </div>

            </section>
          )}

          {/* =================================================
              ALL FILES
          ================================================= */}

          <FileList />

        </div>

      </section>

    </main>
  );
}
