"use client";

import { useEffect, useState } from "react";
import {
  Download,
  FileArchive,
  FileText,
  ImageIcon,
  Loader2,
  Video,
  AlertCircle,
} from "lucide-react";

import api from "@/lib/axios";

interface SharedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
  permission: "view" | "download";
}

export default function PublicSharePage() {
  const [file, setFile] =
    useState<SharedFile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [downloading, setDownloading] =
    useState(false);

  // ===============================
  // GET TOKEN FROM URL
  // ===============================

  useEffect(() => {
    const loadSharedFile =
      async () => {
        try {
          const path =
            window.location.pathname;

          const parts =
            path.split("/");

          const token =
            parts[parts.length - 1];

          if (!token) {
            setError(
              "Invalid share link"
            );
            return;
          }

          const res =
            await api.get(
              `/files/public/${token}`
            );

          if (
            res.data.success &&
            res.data.file
          ) {
            setFile(
              res.data.file
            );
          } else {
            setError(
              "This share link is invalid or expired"
            );
          }
        } catch (err: any) {
          console.error(
            "Public share error:",
            err
          );

          setError(
            err.response?.data
              ?.message ||
              "This share link is invalid or expired"
          );
        } finally {
          setLoading(false);
        }
      };

    loadSharedFile();
  }, []);

  // ===============================
  // FORMAT SIZE
  // ===============================

  const formatSize = (
    size: number
  ) => {
    if (size < 1024) {
      return `${size} B`;
    }

    if (
      size <
      1024 * 1024
    ) {
      return `${(
        size / 1024
      ).toFixed(2)} KB`;
    }

    if (
      size <
      1024 * 1024 * 1024
    ) {
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

  // ===============================
  // FILE ICON
  // ===============================

  const getIcon = () => {
    if (
      file?.type?.startsWith(
        "image/"
      )
    ) {
      return (
        <ImageIcon className="h-10 w-10 text-purple-400" />
      );
    }

    if (
      file?.type?.startsWith(
        "video/"
      )
    ) {
      return (
        <Video className="h-10 w-10 text-pink-400" />
      );
    }

    if (
      file?.type?.includes("zip") ||
      file?.type?.includes("rar") ||
      file?.type?.includes(
        "archive"
      )
    ) {
      return (
        <FileArchive className="h-10 w-10 text-yellow-400" />
      );
    }

    return (
      <FileText className="h-10 w-10 text-blue-400" />
    );
  };

    // ===============================
  // SECURE FILE URL
  // ===============================

  const getSecureFileUrl = () => {
    const path =
      window.location.pathname;

    const parts =
      path.split("/");

    const token =
      parts[parts.length - 1];

    return `${api.defaults.baseURL}/files/public/${token}/content`;
  };

  // ===============================
  // DOWNLOAD
  // ===============================

  const handleDownload =
    async () => {
      if (!file) {
        return;
      }

      try {
        setDownloading(true);

       const response =
  await fetch(
    `${getSecureFileUrl()}?download=1`
  );

        if (!response.ok) {
          throw new Error(
            "Download failed"
          );
        }

        const blob =
          await response.blob();

        const blobUrl =
          window.URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = blobUrl;
        link.download =
          file.name;

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          blobUrl
        );
      } catch (err) {
        console.error(
          "Download error:",
          err
        );

        alert(
          "Unable to download this file."
        );
      } finally {
        setDownloading(false);
      }
    };

  // ===============================
  // LOADING
  // ===============================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080d1a] px-4 text-white">

        <div className="text-center">

          <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-400" />

          <p className="mt-4 text-sm text-zinc-500">
            Loading shared file...
          </p>

        </div>

      </main>
    );
  }

  // ===============================
  // ERROR
  // ===============================

  if (error || !file) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080d1a] px-4 text-white">

        <div className="w-full max-w-md rounded-3xl border border-red-500/10 bg-[#10192E] p-8 text-center shadow-2xl">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">

            <AlertCircle className="h-8 w-8 text-red-400" />

          </div>

          <h1 className="mt-6 text-2xl font-bold">
            Link unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            {error ||
              "This share link is invalid or expired."}
          </p>

        </div>

      </main>
    );
  }

  // ===============================
  // PUBLIC FILE PAGE
  // ===============================

  return (
    <main className="min-h-screen bg-[#080d1a] px-4 py-10 text-white">

      <div className="mx-auto max-w-4xl">

        {/* BRAND */}

        <div className="mb-8 text-center">

          <h1 className="text-2xl font-bold">
            LoveDrive
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Secure file sharing
          </p>

        </div>

        {/* FILE CARD */}

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#10192E] shadow-2xl">

          {/* HEADER */}

          <div className="border-b border-white/5 p-6">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/5">

                {getIcon()}

              </div>

              <div className="min-w-0">

                <h2 className="truncate text-xl font-semibold">
                  {file.name}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {formatSize(
                    file.size
                  )}
                </p>

              </div>

            </div>

          </div>

          {/* PREVIEW */}

          <div className="flex min-h-[300px] items-center justify-center bg-black/20 p-6">

            {/* IMAGE */}

            {file.type?.startsWith(
              "image/"
            ) ? (

              <img
                src={getSecureFileUrl()}
                alt={file.name}
                className="max-h-[600px] max-w-full rounded-2xl object-contain shadow-xl"
              />

            ) : file.type?.startsWith(
                "video/"
              ) ? (

              /* VIDEO */

              <video
                src={getSecureFileUrl()}
                controls
                className="max-h-[600px] max-w-full rounded-2xl"
              />

            ) : file.type?.includes(
                "pdf"
              ) ? (

              /* PDF */

              <iframe
                src={getSecureFileUrl()}
                title={file.name}
                className="h-[600px] w-full rounded-2xl border border-white/10"
              />

            ) : (

              /* OTHER FILE */

              <div className="text-center">

                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-white/5">

                  {getIcon()}

                </div>

                <p className="mt-5 text-sm text-zinc-500">
                  Preview is not available for this file type.
                </p>

              </div>

            )}

          </div>

          {/* ACTIONS */}

          <div className="border-t border-white/5 p-6">

            {file.permission ===
              "download" ? (

              <button
                onClick={
                  handleDownload
                }
                disabled={
                  downloading
                }
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {downloading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Download File
                  </>
                )}

              </button>

            ) : (

              <div className="rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4 text-center">

                <p className="text-sm text-blue-300">
                  👁 This file is shared for viewing only.
                </p>

              </div>

            )}

          </div>

        </div>

        {/* FOOTER */}

        <p className="mt-6 text-center text-xs text-zinc-700">
          Shared securely with LoveDrive
        </p>

      </div>

    </main>
  );
}