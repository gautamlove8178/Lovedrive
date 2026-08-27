"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Star,
  Search,
  Grid3X3,
  List,
  ExternalLink,
  Download,
  Trash2,
  Loader2,
  FolderOpen,
  FileText,
  ImageIcon,
  Video,
  FileArchive,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import MainLayout from "@/components/layout/MainLayout";

interface FileItem {
  _id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  createdAt: string;
  isFavorite: boolean;
}

export default function FavoritesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("list");
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const userId = "6a74d3deddb93b41d70d2e41";

  // ===============================
  // FETCH FAVORITES
  // ===============================
  const fetchFavorites = async () => {
    try {
      setLoading(true);

      const res = await api.get("/files/favorites", {
        params: { userId },
      });

      if (res.data.success) {
        setFiles(res.data.files);
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      toast.error("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // ===============================
  // SEARCH
  // ===============================
  const filteredFiles = useMemo(() => {
    if (!search.trim()) {
      return files;
    }

    const query = search.toLowerCase();

    return files.filter((file) =>
      file.name.toLowerCase().includes(query)
    );
  }, [files, search]);

  // ===============================
  // FORMAT SIZE
  // ===============================
  const formatSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    }

    if (size < 1024 * 1024 * 1024) {
      return `${(size / 1024 / 1024).toFixed(2)} MB`;
    }

    return `${(
      size /
      1024 /
      1024 /
      1024
    ).toFixed(2)} GB`;
  };

  // ===============================
  // FORMAT DATE
  // ===============================
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ===============================
  // FILE ICON
  // ===============================
  const getIcon = (type: string) => {
    if (type?.startsWith("image/")) {
      return (
        <ImageIcon className="h-7 w-7 text-purple-400" />
      );
    }

    if (type?.startsWith("video/")) {
      return (
        <Video className="h-7 w-7 text-pink-400" />
      );
    }

    if (
      type?.includes("zip") ||
      type?.includes("rar") ||
      type?.includes("archive")
    ) {
      return (
        <FileArchive className="h-7 w-7 text-yellow-400" />
      );
    }

    return (
      <FileText className="h-7 w-7 text-blue-400" />
    );
  };

  // ===============================
  // UNFAVORITE
  // ===============================
  const handleFavorite = async (file: FileItem) => {
    try {
      setFavoriteId(file._id);

      const res = await api.patch(
        `/files/${file._id}/favorite`
      );

      if (res.data.success) {
        setFiles((prev) =>
          prev.filter(
            (item) => item._id !== file._id
          )
        );

        window.dispatchEvent(
          new Event("files-updated")
        );

        toast.success("Removed from Favorites ☆");
      }
    } catch (error: any) {
      console.error("Unfavorite failed:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to remove favorite"
      );
    } finally {
      setFavoriteId(null);
    }
  };

  // ===============================
  // DELETE
  // ===============================
  const handleDelete = async (file: FileItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${file.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(file._id);

      const res = await api.delete(
        `/files/${file._id}`
      );

      if (res.data.success) {
        setFiles((prev) =>
          prev.filter(
            (item) => item._id !== file._id
          )
        );

        window.dispatchEvent(
          new Event("files-updated")
        );

        toast.success("File deleted 🗑️");
      }
    } catch (error: any) {
      console.error("Delete failed:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete file"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ===============================
  // DOWNLOAD
  // ===============================
  const handleDownload = async (file: FileItem) => {
    try {
      const response = await fetch(file.url);

      if (!response.ok) {
        throw new Error("Download request failed");
      }

      const blob = await response.blob();

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download = file.name;

      document.body.appendChild(link);
      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Download started ⬇️");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed");
    }
  };

  return (
    <MainLayout>
      <main className="min-h-screen bg-[#080d1a] px-4 py-8 text-white md:px-8">

      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/10">
                <Star className="h-7 w-7 fill-yellow-400 text-yellow-400" />
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  Favorites
                </h1>

                <p className="mt-1 text-sm text-zinc-500">
                  Your most important files in one place.
                </p>
              </div>

            </div>

          </div>

          {/* VIEW SWITCH */}

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">

            <button
              onClick={() => setView("list")}
              className={`rounded-lg p-2 ${
                view === "list"
                  ? "bg-blue-600 text-white"
                  : "text-zinc-500 hover:text-white"
              }`}
              title="List view"
            >
              <List className="h-5 w-5" />
            </button>

            <button
              onClick={() => setView("grid")}
              className={`rounded-lg p-2 ${
                view === "grid"
                  ? "bg-blue-600 text-white"
                  : "text-zinc-500 hover:text-white"
              }`}
              title="Grid view"
            >
              <Grid3X3 className="h-5 w-5" />
            </button>

          </div>

        </div>

        {/* ================= SEARCH ================= */}

        <div className="relative mt-8">

          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search favorite files..."
            className="w-full rounded-2xl border border-white/10 bg-[#10192E] py-3 pl-12 pr-4 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500/50"
          />

        </div>

        {/* ================= COUNT ================= */}

        {!loading && (
          <p className="mt-5 text-sm text-zinc-500">
            {filteredFiles.length}{" "}
            {filteredFiles.length === 1
              ? "favorite file"
              : "favorite files"}
          </p>
        )}

        {/* ================= CONTENT ================= */}

        <div className="mt-6">

          {/* LOADING */}

          {loading ? (

            <div className="flex items-center justify-center rounded-3xl border border-white/5 bg-[#10192E] py-20 text-zinc-500">

              <Loader2 className="mr-3 h-6 w-6 animate-spin" />

              Loading your favorites...

            </div>

          ) : filteredFiles.length === 0 ? (

            /* EMPTY */

            <div className="rounded-3xl border border-white/5 bg-[#10192E] py-20 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400/10">

                <Star className="h-8 w-8 text-yellow-400" />

              </div>

              <h2 className="mt-5 text-xl font-semibold">
                No favorite files
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                Mark files as favorites from My Files
                and they will appear here.
              </p>

            </div>

          ) : view === "list" ? (

            /* ================= LIST VIEW ================= */

            <div className="space-y-3">

              {filteredFiles.map((file) => (

                <div
                  key={file._id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-[#10192E] p-4 transition hover:border-yellow-400/20 md:flex-row md:items-center md:justify-between"
                >

                  {/* FILE INFO */}

                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5">
                      {getIcon(file.type)}
                    </div>

                    <div className="min-w-0">

                      <div className="flex items-center gap-2">

                        <h3 className="truncate font-semibold">
                          {file.name}
                        </h3>

                        <Star className="h-4 w-4 shrink-0 fill-yellow-400 text-yellow-400" />

                      </div>

                      <p className="mt-1 text-sm text-zinc-500">
                        {formatSize(file.size)} •{" "}
                        {formatDate(file.createdAt)}
                      </p>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="flex flex-wrap items-center gap-2">

                    {/* UNFAVORITE */}

                    <button
                      onClick={() =>
                        handleFavorite(file)
                      }
                      disabled={
                        favoriteId === file._id
                      }
                      className="flex items-center gap-2 rounded-xl bg-yellow-400/10 px-4 py-2 text-sm text-yellow-300 transition hover:bg-yellow-400/20 disabled:opacity-50"
                    >
                      {favoriteId === file._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Star className="h-4 w-4 fill-current" />
                      )}

                      Unfavorite
                    </button>

                    {/* OPEN */}

                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-4 py-2 text-sm text-blue-400 transition hover:bg-blue-500/20"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open
                    </a>

                    {/* DOWNLOAD */}

                    <button
                      onClick={() =>
                        handleDownload(file)
                      }
                      className="flex items-center gap-2 rounded-xl bg-green-500/10 px-4 py-2 text-sm text-green-400 transition hover:bg-green-500/20"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>

                    {/* DELETE */}

                    <button
                      onClick={() =>
                        handleDelete(file)
                      }
                      disabled={
                        deletingId === file._id
                      }
                      className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {deletingId === file._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}

                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          ) : (

            /* ================= GRID VIEW ================= */

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {filteredFiles.map((file) => (

                <div
                  key={file._id}
                  className="rounded-2xl border border-white/5 bg-[#10192E] p-5 transition hover:-translate-y-1 hover:border-yellow-400/20"
                >

                  {/* FILE ICON */}

                  <div className="relative flex h-32 items-center justify-center rounded-xl bg-white/5">

                    {getIcon(file.type)}

                    <button
                      onClick={() =>
                        handleFavorite(file)
                      }
                      disabled={
                        favoriteId === file._id
                      }
                      className="absolute right-3 top-3 rounded-lg bg-yellow-400/10 p-2 text-yellow-300 transition hover:bg-yellow-400/20 disabled:opacity-50"
                      title="Remove from Favorites"
                    >
                      {favoriteId === file._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Star className="h-4 w-4 fill-current" />
                      )}
                    </button>

                  </div>

                  {/* FILE NAME */}

                  <h3 className="mt-4 truncate font-semibold">
                    {file.name}
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    {formatSize(file.size)} •{" "}
                    {formatDate(file.createdAt)}
                  </p>

                  {/* ACTIONS */}

                  <div className="mt-4 flex gap-2">

                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center rounded-xl bg-blue-500/10 py-2 text-blue-400 transition hover:bg-blue-500/20"
                      title="Open"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>

                    <button
                      onClick={() =>
                        handleDownload(file)
                      }
                      className="flex flex-1 items-center justify-center rounded-xl bg-green-500/10 py-2 text-green-400 transition hover:bg-green-500/20"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(file)
                      }
                      disabled={
                        deletingId === file._id
                      }
                      className="flex flex-1 items-center justify-center rounded-xl bg-red-500/10 py-2 text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === file._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>
      </div>
      </main>
    </MainLayout>
  );
}