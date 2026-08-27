"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  FileText,
  ImageIcon,
  Video,
  FileArchive,
  ExternalLink,
  Trash2,
  Loader2,
  Music,
  Download,
} from "lucide-react";

import toast from "react-hot-toast";
import api from "@/lib/axios";

interface FileItem {
  _id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  createdAt: string;
}

export default function FileList() {
  const router = useRouter();

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // =====================================================
  // FETCH FILES
  // =====================================================

  const fetchFiles = async () => {
    try {
      setLoading(true);

      const res = await api.get("/files/list");

      if (res.data?.success) {
        setFiles(res.data.files || []);
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {
    fetchFiles();

    const handleRefresh = () => {
      fetchFiles();
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
  // FILE TYPES
  // =====================================================

  const isImage = (type: string) => {
    return type?.toLowerCase().startsWith("image/");
  };

  const isVideo = (type: string) => {
    return type?.toLowerCase().startsWith("video/");
  };

  const isAudio = (type: string) => {
    return type?.toLowerCase().startsWith("audio/");
  };

  const isPdf = (file: FileItem) => {
    return (
      file.type?.toLowerCase() ===
        "application/pdf" ||
      file.name?.toLowerCase().endsWith(".pdf")
    );
  };

  const isArchive = (type: string) => {
    const value = type?.toLowerCase() || "";

    return (
      value.includes("zip") ||
      value.includes("archive") ||
      value.includes("rar") ||
      value.includes("7z")
    );
  };

  // =====================================================
  // ICON
  // =====================================================

  const getIcon = (file: FileItem) => {
    if (isImage(file.type)) {
      return (
        <ImageIcon className="h-6 w-6 text-purple-400" />
      );
    }

    if (isVideo(file.type)) {
      return (
        <Video className="h-6 w-6 text-pink-400" />
      );
    }

    if (isAudio(file.type)) {
      return (
        <Music className="h-6 w-6 text-green-400" />
      );
    }

    if (isArchive(file.type)) {
      return (
        <FileArchive className="h-6 w-6 text-yellow-400" />
      );
    }

    return (
      <FileText className="h-6 w-6 text-blue-400" />
    );
  };

  // =====================================================
  // SIZE
  // =====================================================

  const formatSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    }

    if (size < 1024 * 1024 * 1024) {
      return `${(
        size /
        1024 /
        1024
      ).toFixed(2)} MB`;
    }

    return `${(
      size /
      1024 /
      1024 /
      1024
    ).toFixed(2)} GB`;
  };

  // =====================================================
  // DATE
  // =====================================================

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

  // =====================================================
  // OPEN FILE
  // =====================================================

  const handleOpen = (file: FileItem) => {
    // ==========================================
    // PDF
    // ==========================================

    if (isPdf(file)) {
      router.push(`/pdf/${file._id}`);
      return;
    }

    // ==========================================
    // OTHER FILES
    // ==========================================

    if (!file.url) {
      toast.error("File URL not available");
      return;
    }

    window.open(
      file.url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================================
  // DOWNLOAD
  // =====================================================

  const handleDownload = (file: FileItem) => {
    if (!file.url) {
      toast.error("Download URL not available");
      return;
    }

    const link =
      document.createElement("a");

    link.href = file.url;

    link.download = file.name;

    link.target = "_blank";

    link.rel = "noopener noreferrer";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (
    file: FileItem
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${file.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(file._id);

      const res = await api.delete(
        `/files/${file._id}`
      );

      if (res.data?.success) {
        setFiles((prev) =>
          prev.filter(
            (item) =>
              item._id !== file._id
          )
        );

        toast.success(
          "File moved to trash 🗑️"
        );

        window.dispatchEvent(
          new Event("files-updated")
        );
      }
    } catch (error: any) {
      console.error(
        "Delete failed:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete file"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="rounded-3xl bg-[#10192E] p-10">
        <div className="flex items-center justify-center gap-3 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />

          Loading your files...
        </div>
      </div>
    );
  }

  // =====================================================
  // EMPTY
  // =====================================================

  if (files.length === 0) {
    return (
      <div className="rounded-3xl border border-white/5 bg-[#10192E] p-10 text-center">
        <FileText className="mx-auto h-12 w-12 text-zinc-600" />

        <h2 className="mt-4 text-xl font-semibold text-white">
          No files yet
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          Upload your first file to see it here.
        </p>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <section className="space-y-4">

      {/* HEADER */}

      <div>
        <h2 className="text-2xl font-bold text-white">
          Uploaded Files
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          {files.length}{" "}
          {files.length === 1
            ? "file"
            : "files"}{" "}
          in your LoveDrive
        </p>
      </div>

      {/* FILES */}

      <div className="space-y-4">

        {files.map((file) => (
          <div
            key={file._id}
            className="overflow-hidden rounded-2xl border border-white/5 bg-[#16233f] transition hover:border-blue-500/30"
          >

            {/* =================================================
                IMAGE PREVIEW
            ================================================= */}

            {isImage(file.type) && (
              <div className="border-b border-white/5 bg-black/20 p-3">
                <div className="overflow-hidden rounded-xl bg-black/30">

                  <img
                    src={file.url}
                    alt={file.name}
                    className="mx-auto max-h-[350px] w-full object-contain"
                    loading="lazy"
                  />

                </div>
              </div>
            )}

            {/* =================================================
                VIDEO PREVIEW
            ================================================= */}

            {isVideo(file.type) && (
              <div className="border-b border-white/5 bg-black/20 p-3">

                <video
                  controls
                  preload="metadata"
                  className="mx-auto max-h-[400px] w-full rounded-xl bg-black"
                >
                  <source
                    src={file.url}
                    type={file.type}
                  />

                  Your browser does not support video playback.
                </video>

              </div>
            )}

            {/* =================================================
                AUDIO PREVIEW
            ================================================= */}

            {isAudio(file.type) && (
              <div className="border-b border-white/5 bg-black/20 p-4">

                <div className="mb-3 flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                    <Music className="h-6 w-6 text-green-400" />
                  </div>

                  <div className="min-w-0">

                    <p className="truncate font-medium text-white">
                      {file.name}
                    </p>

                    <p className="text-xs text-zinc-500">
                      Audio file
                    </p>

                  </div>

                </div>

                <audio
                  controls
                  preload="metadata"
                  className="w-full"
                >
                  <source
                    src={file.url}
                    type={file.type}
                  />

                  Your browser does not support audio playback.
                </audio>

              </div>
            )}

            {/* =================================================
                PDF PREVIEW CARD
            ================================================= */}

            {isPdf(file) && (
              <div className="border-b border-white/5 bg-black/20 p-4">

                <div className="flex items-center gap-4 rounded-2xl border border-red-500/10 bg-[#0b1220] p-5">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-500/10">

                    <FileText className="h-7 w-7 text-red-400" />

                  </div>

                  <div className="min-w-0">

                    <p className="font-semibold text-white">
                      PDF Document
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Open this PDF in LoveDrive's secure viewer
                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                FILE INFO
            ================================================= */}

            <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">

              {/* INFO */}

              <div className="flex min-w-0 items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5">
                  {getIcon(file)}
                </div>

                <div className="min-w-0">

                  <h3 className="truncate font-semibold text-white">
                    {file.name}
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    {formatSize(file.size)}
                    {" • "}
                    {formatDate(
                      file.createdAt
                    )}
                  </p>

                </div>

              </div>

              {/* BUTTONS */}

              <div className="flex shrink-0 flex-wrap items-center gap-2">

                {/* OPEN */}

                <button
                  type="button"
                  onClick={() =>
                    handleOpen(file)
                  }
                  className="flex items-center gap-2 rounded-xl bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-400 transition hover:bg-blue-600/30 hover:text-blue-300"
                >
                  <ExternalLink className="h-4 w-4" />

                  {isPdf(file)
                    ? "Open PDF"
                    : "Open"}
                </button>

                {/* DOWNLOAD */}

                <button
                  type="button"
                  onClick={() =>
                    handleDownload(file)
                  }
                  className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
                >
                  <Download className="h-4 w-4" />

                  Download
                </button>

                {/* DELETE */}

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(file)
                  }
                  disabled={
                    deletingId ===
                    file._id
                  }
                  className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {deletingId ===
                  file._id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}