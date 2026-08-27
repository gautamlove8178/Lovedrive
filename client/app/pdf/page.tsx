"use client";

export default function PdfTestPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080B14] text-white">
      <div className="rounded-3xl border border-white/10 bg-[#10192E] p-10 text-center">
        <div className="text-5xl">📄</div>

        <h1 className="mt-5 text-3xl font-bold">
          LoveDrive PDF Test
        </h1>

        <p className="mt-3 text-zinc-400">
          PDF route is working!
        </p>
      </div>
    </main>
  );
}