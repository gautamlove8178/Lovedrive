"use client";

import {
  UploadCloud,
  File,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

import api from "@/lib/axios";
import toast from "react-hot-toast";

// =====================================================
// UPLOAD ITEM
// =====================================================

interface UploadItem {
  id: string;
  name: string;
  size: number;
  progress: number;
  status:
    | "uploading"
    | "success"
    | "error";
}

// =====================================================
// COMPONENT
// =====================================================

export default function UploadZone() {
  const inputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [uploading, setUploading] =
    useState(false);

  const [dragging, setDragging] =
    useState(false);

  const [uploads, setUploads] =
    useState<UploadItem[]>([]);

  // =====================================================
  // FORMAT FILE SIZE
  // =====================================================

  const formatSize = (
    bytes: number
  ) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (
      bytes <
      1024 * 1024
    ) {
      return `${(
        bytes / 1024
      ).toFixed(2)} KB`;
    }

    if (
      bytes <
      1024 *
        1024 *
        1024
    ) {
      return `${(
        bytes /
        1024 /
        1024
      ).toFixed(2)} MB`;
    }

    return `${(
      bytes /
      1024 /
      1024 /
      1024
    ).toFixed(2)} GB`;
  };

  // =====================================================
  // UPLOAD FILES
  // =====================================================

  const uploadFiles = async (
    selectedFiles: File[]
  ) => {
    if (
      !selectedFiles ||
      selectedFiles.length === 0
    ) {
      return;
    }

    // -----------------------------------------------
    // CHECK LOGIN TOKEN
    // -----------------------------------------------

    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {
      toast.error(
        "Please login first."
      );

      return;
    }

    setUploading(true);

    // -----------------------------------------------
    // CREATE UPLOAD ITEMS
    // -----------------------------------------------

    const newUploads: UploadItem[] =
      selectedFiles.map(
        (file) => ({
          id:
            crypto.randomUUID(),

          name:
            file.name,

          size:
            file.size,

          progress: 0,

          status:
            "uploading",
        })
      );

    setUploads(
      newUploads
    );

    let successCount = 0;
    let errorCount = 0;

    // =================================================
    // UPLOAD ONE BY ONE
    // =================================================

    for (
      let i = 0;
      i <
      selectedFiles.length;
      i++
    ) {
      const file =
        selectedFiles[i];

      const uploadItem =
        newUploads[i];

      const formData =
        new FormData();

      // IMPORTANT
      // Backend expects field name "file"

      formData.append(
        "file",
        file
      );

      try {
        // =============================================
        // UPLOAD
        // =============================================

        await api.post(
          "/files/upload",
          formData,
          {
            // DO NOT manually set
            // Content-Type.
            //
            // Browser will automatically
            // create multipart boundary.

            onUploadProgress:
              (
                progressEvent
              ) => {
                if (
                  !progressEvent.total
                ) {
                  return;
                }

                const progress =
                  Math.round(
                    (progressEvent.loaded /
                      progressEvent.total) *
                      100
                  );

                setUploads(
                  (prev) =>
                    prev.map(
                      (
                        item
                      ) =>
                        item.id ===
                        uploadItem.id
                          ? {
                              ...item,
                              progress,
                            }
                          : item
                    )
                );
              },
          }
        );

        // =============================================
        // SUCCESS
        // =============================================

        successCount++;

        setUploads(
          (prev) =>
            prev.map(
              (item) =>
                item.id ===
                uploadItem.id
                  ? {
                      ...item,

                      progress:
                        100,

                      status:
                        "success",
                    }
                  : item
            )
        );

      } catch (error: any) {
        // =============================================
        // ERROR
        // =============================================

        console.error(
          `Upload failed: ${file.name}`,
          error
        );

        errorCount++;

        const message =
          error?.response
            ?.data
            ?.message ||
          error?.message ||
          "Upload failed";

        console.error(
          "SERVER MESSAGE:",
          message
        );

        setUploads(
          (prev) =>
            prev.map(
              (item) =>
                item.id ===
                uploadItem.id
                  ? {
                      ...item,

                      status:
                        "error",
                    }
                  : item
            )
        );
      }
    }

    // =================================================
    // RESULT
    // =================================================

    if (
      successCount > 0 &&
      errorCount === 0
    ) {
      toast.success(
        `${successCount} ${
          successCount === 1
            ? "file"
            : "files"
        } uploaded successfully 🎉`
      );
    } else if (
      successCount > 0 &&
      errorCount > 0
    ) {
      toast.error(
        `${successCount} uploaded, ${errorCount} failed`
      );
    } else {
      toast.error(
        "All uploads failed ❌"
      );
    }

    // =================================================
    // REFRESH FILE LIST / STORAGE / DASHBOARD
    // =================================================

    if (
      successCount > 0
    ) {
      window.dispatchEvent(
        new Event(
          "files-updated"
        )
      );
    }

    setUploading(false);

    // Reset input

    if (
      inputRef.current
    ) {
      inputRef.current.value =
        "";
    }
  };

  // =====================================================
  // FILE SELECT
  // =====================================================

  const handleSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files =
      e.target.files;

    if (
      !files ||
      files.length === 0
    ) {
      return;
    }

    await uploadFiles(
      Array.from(files)
    );
  };

  // =====================================================
  // DRAG ENTER
  // =====================================================

  const handleDragEnter = (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!uploading) {
      setDragging(true);
    }
  };

  // =====================================================
  // DRAG LEAVE
  // =====================================================

  const handleDragLeave = (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setDragging(false);
  };

  // =====================================================
  // DRAG OVER
  // =====================================================

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!uploading) {
      e.dataTransfer.dropEffect =
        "copy";

      setDragging(true);
    }
  };

  // =====================================================
  // DROP
  // =====================================================

  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setDragging(false);

    if (uploading) {
      return;
    }

    const files =
      Array.from(
        e.dataTransfer.files
      );

    if (files.length === 0) {
      return;
    }

    await uploadFiles(files);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-5">

      {/* =================================================
          UPLOAD ZONE
      ================================================= */}

      <div
        id="upload-zone"

        onClick={() => {
          if (!uploading) {
            inputRef.current?.click();
          }
        }}

        onDragEnter={
          handleDragEnter
        }

        onDragLeave={
          handleDragLeave
        }

        onDragOver={
          handleDragOver
        }

        onDrop={
          handleDrop
        }

        className={`cursor-pointer rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
          uploading
            ? "cursor-wait border-blue-500/40 bg-[#16233f] opacity-80"
            : dragging
            ? "scale-[1.01] border-blue-400 bg-blue-500/10"
            : "border-blue-500/40 bg-[#10192E] hover:border-blue-400 hover:bg-[#16233f]"
        }`}
      >

        {/* ICON */}

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10">

          {uploading ? (
            <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
          ) : (
            <UploadCloud className="h-10 w-10 text-blue-400" />
          )}

        </div>

        {/* TITLE */}

        <h2 className="mt-6 text-2xl font-bold text-white">

          {uploading
            ? "Uploading Files..."
            : dragging
            ? "Drop Files Here"
            : "Drag & Drop Files"}

        </h2>

        {/* DESCRIPTION */}

        <p className="mt-3 text-zinc-400">

          {uploading
            ? "Please wait while your files are being uploaded."
            : "or click here to choose files"}

        </p>

        {!uploading && (
          <p className="mt-2 text-xs text-zinc-600">
            You can select multiple files
          </p>
        )}

        {/* FILE INPUT */}

        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={
            handleSelect
          }
          disabled={
            uploading
          }
        />

      </div>

      {/* =================================================
          UPLOAD PROGRESS
      ================================================= */}

      {uploads.length > 0 && (
        <div className="rounded-3xl border border-white/5 bg-[#10192E] p-5">

          {/* HEADER */}

          <div className="mb-4 flex items-center justify-between">

            <div>

              <h3 className="font-semibold text-white">
                Uploads
              </h3>

              <p className="mt-1 text-xs text-zinc-500">
                {uploads.length}{" "}
                {uploads.length ===
                1
                  ? "file"
                  : "files"}
              </p>

            </div>

            {!uploading && (
              <button
                type="button"
                onClick={() =>
                  setUploads([])
                }
                className="text-xs text-zinc-500 transition hover:text-white"
              >
                Clear
              </button>
            )}

          </div>

          {/* FILES */}

          <div className="space-y-3">

            {uploads.map(
              (file) => (
                <div
                  key={
                    file.id
                  }
                  className="rounded-2xl border border-white/5 bg-white/[0.03] p-4"
                >

                  <div className="flex items-center gap-3">

                    {/* ICON */}

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">

                      {file.status ===
                      "success" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      ) : file.status ===
                        "error" ? (
                        <XCircle className="h-5 w-5 text-red-400" />
                      ) : (
                        <File className="h-5 w-5 text-blue-400" />
                      )}

                    </div>

                    {/* FILE INFO */}

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center justify-between gap-3">

                        <p className="truncate text-sm font-medium text-white">
                          {file.name}
                        </p>

                        <span className="shrink-0 text-xs text-zinc-500">
                          {formatSize(
                            file.size
                          )}
                        </span>

                      </div>

                      {/* PROGRESS */}

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">

                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            file.status ===
                            "success"
                              ? "bg-green-500"
                              : file.status ===
                                "error"
                              ? "bg-red-500"
                              : "bg-gradient-to-r from-blue-500 to-cyan-400"
                          }`}
                          style={{
                            width: `${file.progress}%`,
                          }}
                        />

                      </div>

                      {/* STATUS */}

                      <div className="mt-1 flex justify-between">

                        <span
                          className={`text-xs ${
                            file.status ===
                            "success"
                              ? "text-green-400"
                              : file.status ===
                                "error"
                              ? "text-red-400"
                              : "text-zinc-500"
                          }`}
                        >
                          {file.status ===
                          "success"
                            ? "Uploaded successfully"
                            : file.status ===
                              "error"
                            ? "Upload failed"
                            : "Uploading..."}
                        </span>

                        <span className="text-xs text-zinc-600">
                          {file.progress}%
                        </span>

                      </div>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}