"use client";

import { useEffect, useState } from "react";
import {
  HardDrive,
  Upload,
  Share2,
} from "lucide-react";

import StatCard from "@/components/cards/StatCard";
import api from "@/lib/axios";

interface StorageData {
  storageUsed: number;
  storageLimit: number;
  percentage: number;
  fileCount: number;
  sharedFileCount: number;
}

export default function StorageCard() {
  const [storage, setStorage] =
    useState<StorageData | null>(null);

  const userId =
    "6a74d3deddb93b41d70d2e41";

  const fetchStorage = async () => {
    try {
      const res = await api.get(
        "/files/storage",
        {
          params: {
            userId,
          },
        }
      );

      if (res.data.success) {
        setStorage(res.data.storage);
      }
    } catch (error) {
      console.error(
        "Failed to fetch storage:",
        error
      );
    }
  };

  useEffect(() => {
    fetchStorage();

    const handleRefresh = () => {
      fetchStorage();
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

  const formatSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(2)} KB`;
    }

    if (
      bytes <
      1024 * 1024 * 1024
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

  const storageUsed = storage
    ? formatSize(storage.storageUsed)
    : "Loading...";

  const storageLimit = storage
    ? formatSize(storage.storageLimit)
    : "10 GB";

  const percentage =
    storage?.percentage ?? 0;

  const uploads =
    storage?.fileCount ?? 0;

  const sharedFiles =
    storage?.sharedFileCount ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">

      {/* STORAGE */}

      <StatCard
        title="Storage Used"
        value={`${storageUsed} / ${storageLimit}`}
        icon={HardDrive}
      />

      {/* UPLOADS */}

      <StatCard
        title="Uploads"
        value={uploads.toString()}
        icon={Upload}
      />

      {/* SHARED */}

      <StatCard
        title="Shared Files"
        value={sharedFiles.toString()}
        icon={Share2}
      />

      {/* STORAGE PROGRESS */}

      <div className="rounded-2xl border border-white/5 bg-[#10192E] p-6 md:col-span-3">

        <div className="mb-3 flex items-center justify-between">

          <div>

            <h3 className="font-semibold text-white">
              Storage
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              {storageUsed} of{" "}
              {storageLimit} used
            </p>

          </div>

          <span className="text-sm font-semibold text-blue-400">
            {percentage.toFixed(2)}%
          </span>

        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/5">

          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
            style={{
              width: `${Math.min(
                percentage,
                100
              )}%`,
            }}
          />

        </div>

      </div>

    </div>
  );
}