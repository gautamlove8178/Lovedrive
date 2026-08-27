"use client";

import { useParams } from "next/navigation";

export default function PdfPage() {
  const params = useParams();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080B14] px-6 text-white">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#10192E] p-10 text-center">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-4xl">
          📄
        </div>

        <h1 className="mt-6 text-3xl font-bold">
          LoveDrive PDF Viewer
        </h1>

        <p className="mt-3 text-zinc-400">
          Dynamic PDF route is working!
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            File ID
          </p>

          <p className="mt-2 break-all font-mono text-blue-400">
            {id || "ID NOT FOUND"}
          </p>
        </div>

      </div>
    </main>
  );
}