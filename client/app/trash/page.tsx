"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Grid3X3,
  List,
  FileText,
  ImageIcon,
  Video,
  FileArchive,
  ExternalLink,
  Download,
  Trash2,
  RotateCcw,
  Loader2,
  FolderOpen,
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
  updatedAt: string;
  isFavorite: boolean;
  isTrashed: boolean;
  folder?: string | null;
}

interface FolderItem {
  _id: string;
  name: string;
  parent: string | null;
  updatedAt?: string;
  isTrashed: boolean;
}

export default function TrashPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("list");

  const [restoringId, setRestoringId] =
    useState<string | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [restoringFolderId, setRestoringFolderId] =
    useState<string | null>(null);

  const [deletingFolderId, setDeletingFolderId] =
    useState<string | null>(null);

  const [emptyingTrash, setEmptyingTrash] =
    useState(false);

  const userId = "6a74d3deddb93b41d70d2e41";

  // ===============================
  // FETCH TRASH
  // ===============================
  const fetchTrash = async () => {
    try {
      setLoading(true);

      const res = await api.get("/files/trash", {
        params: { userId },
      });

      if (res.data.success) {
        setFiles(res.data.files);
      }
    } catch (error) {
      console.error("Failed to fetch trash:", error);
      toast.error("Failed to load Trash");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  // ===============================
  // FETCH TRASHED FOLDERS
  // ===============================

  const fetchTrashFolders = async () => {
    try {
      setFoldersLoading(true);

      const res = await api.get("/folders/trash");

      if (res.data.success) {
        setFolders(res.data.folders || []);
      }
    } catch (error: any) {
      console.error("Failed to fetch trash folders:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load Trash folders"
      );
    } finally {
      setFoldersLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashFolders();
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

  const filteredFolders = useMemo(() => {
    if (!search.trim()) {
      return folders;
    }

    const query = search.toLowerCase();

    return folders.filter((folder) =>
      folder.name.toLowerCase().includes(query)
    );
  }, [folders, search]);

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
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
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
  // RESTORE FILE
  // ===============================
  const handleRestore = async (
    file: FileItem
  ) => {
    try {
      setRestoringId(file._id);

      const res = await api.patch(
        `/files/${file._id}/restore`
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

        toast.success("File restored ♻️");
      }
    } catch (error: any) {
      console.error(
        "Restore failed:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to restore file"
      );
    } finally {
      setRestoringId(null);
    }
  };

  // ===============================
  // PERMANENT DELETE
  // ===============================
  const handlePermanentDelete = async (
    file: FileItem
  ) => {
    const confirmed = window.confirm(
      `This will permanently delete "${file.name}". This action cannot be undone. Continue?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(file._id);

      const res = await api.delete(
        `/files/${file._id}/permanent`
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

        toast.success(
          "File permanently deleted 🗑️"
        );
      }
    } catch (error: any) {
      console.error(
        "Permanent delete failed:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to permanently delete file"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ===============================
  // RESTORE FOLDER
  // ===============================

  const handleRestoreFolder = async (
    folder: FolderItem
  ) => {
    try {
      setRestoringFolderId(folder._id);

      const res = await api.patch(
        `/folders/${folder._id}/restore`
      );

      if (res.data.success) {
        setFolders((prev) =>
          prev.filter(
            (item) => item._id !== folder._id
          )
        );

        window.dispatchEvent(
          new Event("files-updated")
        );

        toast.success("Folder restored ♻️");
      }
    } catch (error: any) {
      console.error(
        "Restore folder failed:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to restore folder"
      );
    } finally {
      setRestoringFolderId(null);
    }
  };

  // ===============================
  // PERMANENT DELETE FOLDER
  // ===============================

  const handlePermanentDeleteFolder = async (
    folder: FolderItem
  ) => {
    const confirmed = window.confirm(
      `This will permanently delete "${folder.name}". This action cannot be undone. Continue?`
    );

    if (!confirmed) return;

    try {
      setDeletingFolderId(folder._id);

      const res = await api.delete(
        `/folders/${folder._id}/permanent`
      );

      if (res.data.success) {
        setFolders((prev) =>
          prev.filter(
            (item) => item._id !== folder._id
          )
        );

        window.dispatchEvent(
          new Event("files-updated")
        );

        toast.success(
          "Folder permanently deleted 🗑️"
        );
      }
    } catch (error: any) {
      console.error(
        "Permanent folder delete failed:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to permanently delete folder"
      );
    } finally {
      setDeletingFolderId(null);
    }
  };

  // ===============================
  // EMPTY TRASH
  // ===============================

  const handleEmptyTrash = async () => {
    if (
      files.length === 0 &&
      folders.length === 0
    ) {
      toast.error("Trash is already empty");
      return;
    }

    const confirmed = window.confirm(
      `Permanently delete ${files.length} file(s) and ${folders.length} folder(s)? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setEmptyingTrash(true);

      const fileResults =
        await Promise.allSettled(
          files.map((file) =>
            api.delete(
              `/files/${file._id}/permanent`
            )
          )
        );

      const folderResults =
        await Promise.allSettled(
          folders.map((folder) =>
            api.delete(
              `/folders/${folder._id}/permanent`
            )
          )
        );

      const failed =
        fileResults.filter(
          (result) =>
            result.status === "rejected"
        ).length +
        folderResults.filter(
          (result) =>
            result.status === "rejected"
        ).length;

      await Promise.all([
        fetchTrash(),
        fetchTrashFolders(),
      ]);

      window.dispatchEvent(
        new Event("files-updated")
      );

      if (failed === 0) {
        toast.success(
          "Trash emptied successfully 🗑️"
        );
      } else {
        toast.error(
          `${failed} item(s) could not be deleted`
        );
      }
    } catch (error) {
      console.error(
        "EMPTY TRASH ERROR:",
        error
      );

      toast.error("Failed to empty Trash");
    } finally {
      setEmptyingTrash(false);
    }
  };

  // ===============================
  // DOWNLOAD
  // ===============================
  const handleDownload = async (
    file: FileItem
  ) => {
    try {
      const response = await fetch(file.url);

      if (!response.ok) {
        throw new Error(
          "Download request failed"
        );
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

      toast.success(
        "Download started ⬇️"
      );
    } catch (error) {
      console.error(
        "Download failed:",
        error
      );

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

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
                <Trash2 className="h-7 w-7 text-red-400" />
              </div>

              <div>

                <h1 className="text-3xl font-bold">
                  Trash
                </h1>

                <p className="mt-1 text-sm text-zinc-500">
                  Deleted files and folders stay here until you restore or permanently remove them.
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
            placeholder="Search deleted files and folders..."
            className="w-full rounded-2xl border border-white/10 bg-[#10192E] py-3 pl-12 pr-4 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500/50"
          />

        </div>

        {/* COUNT */}

        {!loading && !foldersLoading && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500">
              {filteredFiles.length}{" "}
              {filteredFiles.length === 1
                ? "file"
                : "files"}{" "}
              • {filteredFolders.length}{" "}
              {filteredFolders.length === 1
                ? "folder"
                : "folders"}{" "}
              in Trash
            </p>

            {(files.length > 0 ||
              folders.length > 0) && (
              <button
                type="button"
                onClick={handleEmptyTrash}
                disabled={emptyingTrash}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {emptyingTrash ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {emptyingTrash
                  ? "Emptying..."
                  : "Empty Trash"}
              </button>
            )}
          </div>
        )}

        {/* ================= CONTENT ================= */}

        <div className="mt-6">

          {/* LOADING */}

          {loading || foldersLoading ? (

            <div className="flex items-center justify-center rounded-3xl border border-white/5 bg-[#10192E] py-20 text-zinc-500">

              <Loader2 className="mr-3 h-6 w-6 animate-spin" />

              Loading Trash...

            </div>

          ) : filteredFiles.length === 0 &&
            filteredFolders.length === 0 ? (

            /* EMPTY */

            <div className="rounded-3xl border border-white/5 bg-[#10192E] py-20 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">

                <Trash2 className="h-8 w-8 text-red-400" />

              </div>

              <h2 className="mt-5 text-xl font-semibold">
                Trash is empty
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                Deleted files and folders will appear here.
                You can restore them or permanently delete them.
              </p>

            </div>

          ) : view === "list" ? (

            /* ================= LIST ================= */

            <div className="space-y-6">

              {filteredFolders.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                      Folders
                    </h2>
                    <span className="text-xs text-zinc-600">
                      {filteredFolders.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {filteredFolders.map((folder) => (
                      <div
                        key={folder._id}
                        className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-[#10192E] p-4 transition hover:border-red-500/20 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                            <FolderOpen className="h-7 w-7 text-blue-400" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-semibold">
                              {folder.name}
                            </h3>
                            <p className="mt-1 text-sm text-zinc-500">
                              Folder • Deleted{" "}
                              {folder.updatedAt
                                ? formatDate(folder.updatedAt)
                                : "recently"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() =>
                              handleRestoreFolder(folder)
                            }
                            disabled={
                              restoringFolderId ===
                              folder._id
                            }
                            className="flex items-center gap-2 rounded-xl bg-green-500/10 px-4 py-2 text-sm text-green-400 transition hover:bg-green-500/20 disabled:opacity-50"
                          >
                            {restoringFolderId ===
                            folder._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                            Restore
                          </button>

                          <button
                            onClick={() =>
                              handlePermanentDeleteFolder(folder)
                            }
                            disabled={
                              deletingFolderId ===
                              folder._id
                            }
                            className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                          >
                            {deletingFolderId ===
                            folder._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Delete Forever
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {filteredFiles.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                      Files
                    </h2>
                    <span className="text-xs text-zinc-600">
                      {filteredFiles.length}
                    </span>
                  </div>

                  <div className="space-y-3">

              {filteredFiles.map((file) => (

                <div
                  key={file._id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-[#10192E] p-4 transition hover:border-red-500/20 md:flex-row md:items-center md:justify-between"
                >

                  {/* FILE INFO */}

                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5">
                      {getIcon(file.type)}
                    </div>

                    <div className="min-w-0">

                      <h3 className="truncate font-semibold">
                        {file.name}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        {formatSize(file.size)} • Deleted{" "}
                        {formatDate(file.updatedAt)}
                      </p>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="flex flex-wrap items-center gap-2">

                    {/* RESTORE */}

                    <button
                      onClick={() =>
                        handleRestore(file)
                      }
                      disabled={
                        restoringId === file._id
                      }
                      className="flex items-center gap-2 rounded-xl bg-green-500/10 px-4 py-2 text-sm text-green-400 transition hover:bg-green-500/20 disabled:opacity-50"
                    >
                      {restoringId === file._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}

                      Restore
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
                      className="flex items-center gap-2 rounded-xl bg-purple-500/10 px-4 py-2 text-sm text-purple-400 transition hover:bg-purple-500/20"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>

                    {/* PERMANENT DELETE */}

                    <button
                      onClick={() =>
                        handlePermanentDelete(file)
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

                      Delete Forever
                    </button>

                  </div>

                </div>

              ))}
                  </div>
                </section>
              )}

            </div>

          ) : (

            /* ================= GRID ================= */

            <div className="space-y-6">

              {filteredFolders.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                      Folders
                    </h2>
                    <span className="text-xs text-zinc-600">
                      {filteredFolders.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredFolders.map((folder) => (
                      <div
                        key={folder._id}
                        className="rounded-2xl border border-white/5 bg-[#10192E] p-5 transition hover:-translate-y-1 hover:border-red-500/20"
                      >
                        <div className="flex h-32 items-center justify-center rounded-xl bg-blue-500/5">
                          <FolderOpen className="h-12 w-12 text-blue-400" />
                        </div>

                        <h3 className="mt-4 truncate font-semibold">
                          {folder.name}
                        </h3>

                        <p className="mt-1 text-sm text-zinc-500">
                          Folder
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            onClick={() =>
                              handleRestoreFolder(folder)
                            }
                            disabled={
                              restoringFolderId ===
                              folder._id
                            }
                            className="flex items-center justify-center rounded-xl bg-green-500/10 py-2 text-green-400 transition hover:bg-green-500/20 disabled:opacity-50"
                            title="Restore"
                          >
                            {restoringFolderId ===
                            folder._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                          </button>

                          <button
                            onClick={() =>
                              handlePermanentDeleteFolder(folder)
                            }
                            disabled={
                              deletingFolderId ===
                              folder._id
                            }
                            className="flex items-center justify-center rounded-xl bg-red-500/10 py-2 text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                            title="Delete forever"
                          >
                            {deletingFolderId ===
                            folder._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {filteredFiles.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                      Files
                    </h2>
                    <span className="text-xs text-zinc-600">
                      {filteredFiles.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {filteredFiles.map((file) => (

                <div
                  key={file._id}
                  className="rounded-2xl border border-white/5 bg-[#10192E] p-5 transition hover:-translate-y-1 hover:border-red-500/20"
                >

                  {/* ICON */}

                  <div className="flex h-32 items-center justify-center rounded-xl bg-white/5">
                    {getIcon(file.type)}
                  </div>

                  <h3 className="mt-4 truncate font-semibold">
                    {file.name}
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    {formatSize(file.size)}
                  </p>

                  {/* ACTIONS */}

                  <div className="mt-4 grid grid-cols-2 gap-2">

                    {/* RESTORE */}

                    <button
                      onClick={() =>
                        handleRestore(file)
                      }
                      disabled={
                        restoringId === file._id
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-green-500/10 py-2 text-sm text-green-400 transition hover:bg-green-500/20 disabled:opacity-50"
                    >
                      {restoringId === file._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}

                      Restore
                    </button>

                    {/* OPEN */}

                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-xl bg-blue-500/10 py-2 text-blue-400 transition hover:bg-blue-500/20"
                      title="Open"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>

                    {/* DOWNLOAD */}

                    <button
                      onClick={() =>
                        handleDownload(file)
                      }
                      className="flex items-center justify-center rounded-xl bg-purple-500/10 py-2 text-purple-400 transition hover:bg-purple-500/20"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>

                    {/* DELETE FOREVER */}

                    <button
                      onClick={() =>
                        handlePermanentDelete(file)
                      }
                      disabled={
                        deletingId === file._id
                      }
                      className="flex items-center justify-center rounded-xl bg-red-500/10 py-2 text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                      title="Delete forever"
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
                </section>
              )}

            </div>

          )}

        </div>
      </div>
      </main>
    </MainLayout>
  );
}