"use client";

import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
} from "lucide-react";

interface Props {
  url: string;
  name: string;
}

export default function PdfDocument({
  url,
  name,
}: Props) {
  return (
    <main className="min-h-screen bg-[#080B14] text-white">

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080B14]/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">

          <div className="flex min-w-0 items-center gap-3">

            <button
              type="button"
              onClick={() =>
                window.history.back()
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 transition hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
              <FileText className="h-5 w-5 text-red-400" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate font-semibold">
                {name}
              </h1>

              <p className="text-xs text-zinc-500">
                LoveDrive PDF Viewer
              </p>
            </div>

          </div>

          <div className="flex shrink-0 gap-2">

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
            >
              <ExternalLink className="h-4 w-4" />
              Open
            </a>

            <a
              href={url}
              download={name}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              <Download className="h-4 w-4" />
              Download
            </a>

          </div>

        </div>

      </header>

      {/* PDF AREA */}

      <div className="flex min-h-[calc(100vh-73px)] justify-center bg-[#111827] p-4">

        <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">

          <iframe
            src={`${url}#toolbar=0&navpanes=0&scrollbar=1`}
            title={name}
            className="h-[calc(100vh-110px)] min-h-[700px] w-full"
          />

        </div>

      </div>

    </main>
  );
}