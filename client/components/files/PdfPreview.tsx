"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const PdfDocument = dynamic(
  () => import("./PdfDocument"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-[#080B14] text-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-400" />
          <p className="mt-3 text-sm text-zinc-400">
            Loading PDF...
          </p>
        </div>
      </div>
    ),
  }
);

interface Props {
  url: string;
  name: string;
}

export default function PdfViewer({
  url,
  name,
}: Props) {
  return (
    <PdfDocument
      url={url}
      name={name}
    />
  );
}