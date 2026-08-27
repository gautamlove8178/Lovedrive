"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/axios";

interface FileData {
  _id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  createdAt: string;
}

export default function PdfViewerPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const [file, setFile] = useState<FileData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] =
    useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // LOAD FILE
  // =====================================================

  useEffect(() => {
    if (!id) return;

    let objectUrl: string | null = null;

    const loadFile = async () => {
      try {
        setLoading(true);
        setError("");

        // ==========================================
        // GET FILE INFORMATION
        // ==========================================

        const fileResponse = await api.get(
          `/files/${id}`
        );

        if (!fileResponse.data?.success) {
          throw new Error(
            "Unable to load file"
          );
        }

        const fileData =
          fileResponse.data.file;

        setFile(fileData);

        // ==========================================
        // CHECK PDF
        // ==========================================

        if (
          fileData.type !==
          "application/pdf"
        ) {
          throw new Error(
            "This file is not a PDF"
          );
        }

        // ==========================================
        // GET PDF FROM OUR BACKEND
        // ==========================================

        console.log(
          "📄 Loading PDF preview..."
        );

        const pdfResponse =
          await api.get(
            `/files/${id}/content`,
            {
              responseType: "blob",
            }
          );

        // ==========================================
        // CREATE LOCAL BLOB URL
        // ==========================================

        const blob =
          new Blob(
            [pdfResponse.data],
            {
              type: "application/pdf",
            }
          );

        objectUrl =
          URL.createObjectURL(blob);

        console.log(
          "✅ PDF preview URL created"
        );

        setPreviewUrl(objectUrl);

      } catch (err: any) {
        console.error(
          "PDF VIEWER ERROR:",
          err
        );

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load PDF";

        setError(message);

        toast.error(message);
      } finally {
        setLoading(false);
        setPreviewLoading(false);
      }
    };

    loadFile();

    // ==========================================
    // CLEANUP
    // ==========================================

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [id]);

  // =====================================================
  // DOWNLOAD
  // =====================================================

  const handleDownload = () => {
    if (!file?.url) {
      toast.error(
        "Download URL not available"
      );

      return;
    }

    const link =
      document.createElement("a");

    link.href = file.url;

    link.download =
      file.name;

    link.target = "_blank";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070b16]">
        <div className="flex flex-col items-center gap-4 text-zinc-400">
          <Loader2 className="h-10 w-10 animate-spin text-blue-400" />

          <p>
            Loading PDF...
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !file) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070b16] p-6">
        <div className="w-full max-w-lg rounded-3xl border border-red-500/20 bg-[#10192e] p-10 text-center">

          <AlertCircle className="mx-auto h-14 w-14 text-red-400" />

          <h1 className="mt-5 text-2xl font-bold text-white">
            Unable to open PDF
          </h1>

          <p className="mt-3 text-zinc-400">
            {error ||
              "File could not be loaded."}
          </p>

          <button
            onClick={() =>
              router.back()
            }
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </main>
    );
  }

  // =====================================================
  // VIEWER
  // =====================================================

  return (
    <main className="min-h-screen bg-[#070b16]">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1220]/95 backdrop-blur-xl">

        <div className="mx-auto flex min-h-[80px] max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">

          {/* BACK */}

          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-zinc-300 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />

            <span className="hidden sm:inline">
              Back
            </span>
          </button>

          {/* FILE INFO */}

          <div className="flex min-w-0 flex-1 items-center justify-center gap-3">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/15">
              <FileText className="h-6 w-6 text-red-400" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-white sm:text-xl">
                {file.name}
              </h1>

              <p className="text-xs text-zinc-500 sm:text-sm">
                LoveDrive PDF Viewer
              </p>
            </div>

          </div>

          {/* DOWNLOAD */}

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-500 sm:px-5"
          >
            <Download className="h-5 w-5" />

            <span className="hidden sm:inline">
              Download
            </span>
          </button>

        </div>

      </header>

      {/* =================================================
          PDF VIEWER
      ================================================= */}

      <section className="mx-auto w-full max-w-[1600px] p-2 sm:p-4">

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#202020] shadow-2xl">

          {/* FILE NAME */}

          <div className="border-b border-white/10 bg-[#10192e] px-4 py-3">

            <p className="truncate text-sm font-medium text-zinc-200 sm:text-base">
              {file.name}
            </p>

          </div>

          {/* PREVIEW */}

          <div className="relative h-[calc(100vh-145px)] min-h-[600px] w-full bg-[#202020]">

            {previewLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#202020]">

                <div className="flex flex-col items-center gap-4 text-zinc-400">

                  <Loader2 className="h-10 w-10 animate-spin text-blue-400" />

                  <p>
                    Preparing PDF preview...
                  </p>

                </div>

              </div>
            )}

            {previewUrl && (
              <iframe
                src={previewUrl}
                title={file.name}
                className="h-full w-full border-0 bg-white"
              />
            )}

          </div>

        </div>

      </section>

    </main>
  );
}