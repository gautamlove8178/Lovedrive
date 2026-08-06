"use client";

import { useFileStore } from "@/stores/fileStore";
import {
  FileText,
  ImageIcon,
  Video,
  FileArchive,
} from "lucide-react";

export default function FileList() {
  const { files } = useFileStore();

  if (files.length === 0) return null;

  const getIcon = (type: string) => {
    if (type.startsWith("image")) return <ImageIcon className="text-green-400" />;
    if (type.startsWith("video")) return <Video className="text-purple-400" />;
    if (type.includes("zip")) return <FileArchive className="text-yellow-400" />;

    return <FileText className="text-blue-400" />;
  };

  return (
    <div className="mt-8 rounded-3xl bg-[#10192E] p-6">
      <h2 className="mb-5 text-xl font-bold text-white">
        Uploaded Files
      </h2>

      <div className="space-y-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between rounded-xl bg-[#16233f] p-4"
          >
            <div className="flex items-center gap-4">
              {getIcon(file.type)}

              <div>
                <h3 className="text-white font-semibold">
                  {file.name}
                </h3>

                <p className="text-zinc-400 text-sm">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            <span className="text-green-400 font-medium">
              Uploaded
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}