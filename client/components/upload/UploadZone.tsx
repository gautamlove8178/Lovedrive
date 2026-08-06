"use client";

import { UploadCloud } from "lucide-react";
import { useRef } from "react";
import { useFileStore } from "@/stores/fileStore";

export default function UploadZone() {
  const inputRef = useRef<HTMLInputElement>(null);

  const { addFile } = useFileStore();

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) return;

    Array.from(files).forEach((file) => {
      addFile({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
      });
    });
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="cursor-pointer rounded-3xl border-2 border-dashed border-blue-500/40 bg-[#10192E] p-12 text-center transition hover:border-blue-400 hover:bg-[#16233f]"
    >
      <UploadCloud
        size={60}
        className="mx-auto mb-5 text-blue-400"
      />

      <h2 className="text-2xl font-bold text-white">
        Drag & Drop Files
      </h2>

      <p className="mt-3 text-zinc-400">
        or click here to choose files
      </p>

      <input
        multiple
        ref={inputRef}
        type="file"
        hidden
        onChange={handleSelect}
      />
    </div>
  );
}