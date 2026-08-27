"use client";

import {
  Search,
  Grid3X3,
  List,
  Link2,
  ExternalLink,
  Download,
  Loader2,
  ShieldCheck,
  Copy,
  Check,
  Power,
  PowerOff,
  Eye,
  RefreshCw,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import MainLayout from "@/components/layout/MainLayout";

interface PublicShareLink {
  id: string;
  fileId: string;
  fileName: string;
  token: string;
  shareUrl: string;
  permission: "view" | "download";
  enabled: boolean;
  createdAt: string;
}

interface ShareStats {
  totalLinks: number;
  activeLinks: number;
  disabledLinks: number;
}

export default function SharedPage() {
  const [links, setLinks] = useState<PublicShareLink[]>([]);
  const [stats, setStats] = useState<ShareStats>({
    totalLinks: 0,
    activeLinks: 0,
    disabledLinks: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");

  const [actionToken, setActionToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // =====================================================
  // FETCH ALL PUBLIC SHARE LINKS
  // =====================================================

  const fetchShareLinks = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        "/files/share-links"
      );

      if (res.data.success) {
        setLinks(res.data.links || []);

        setStats(
          res.data.stats || {
            totalLinks: 0,
            activeLinks: 0,
            disabledLinks: 0,
          }
        );
      }
    } catch (error: any) {
      console.error(
        "Failed to fetch share links:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load shared links"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShareLinks();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredLinks = useMemo(() => {
    if (!search.trim()) {
      return links;
    }

    const query = search.toLowerCase();

    return links.filter((link) => {
      const status = link.enabled
        ? "active"
        : "disabled";

      const permission =
        link.permission === "download"
          ? "download"
          : "view";

      return (
        link.fileName
          .toLowerCase()
          .includes(query) ||
        status.includes(query) ||
        permission.includes(query)
      );
    });
  }, [links, search]);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // COPY LINK
  // =====================================================

  const handleCopy = async (
    link: PublicShareLink
  ) => {
    try {
      await navigator.clipboard.writeText(
        link.shareUrl
      );

      setCopiedToken(link.token);

      toast.success(
        "Share link copied 📋"
      );

      setTimeout(() => {
        setCopiedToken(null);
      }, 2000);
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );

      toast.error(
        "Failed to copy link"
      );
    }
  };

  // =====================================================
  // OPEN LINK
  // =====================================================

  const handleOpen = (
    link: PublicShareLink
  ) => {
    if (!link.enabled) {
      toast.error(
        "This share link is disabled"
      );
      return;
    }

    window.open(
      link.shareUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================================
  // DISABLE LINK
  // =====================================================

  const handleDisable = async (
    link: PublicShareLink
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to disable this share link?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionToken(link.token);

      const res = await api.patch(
        `/files/${link.fileId}/share-link/${link.token}/disable`
      );

      if (!res.data.success) {
        throw new Error(
          res.data.message ||
            "Failed to disable link"
        );
      }

      setLinks((prev) =>
        prev.map((item) =>
          item.token === link.token
            ? {
                ...item,
                enabled: false,
              }
            : item
        )
      );

      setStats((prev) => ({
        ...prev,
        activeLinks: Math.max(
          0,
          prev.activeLinks - 1
        ),
        disabledLinks:
          prev.disabledLinks + 1,
      }));

      toast.success(
        "Share link disabled 🛑"
      );
    } catch (error: any) {
      console.error(
        "Disable share link failed:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to disable share link"
      );
    } finally {
      setActionToken(null);
    }
  };

  // =====================================================
  // ENABLE LINK
  // =====================================================

  const handleEnable = async (
    link: PublicShareLink
  ) => {
    try {
      setActionToken(link.token);

      const res = await api.patch(
        `/files/${link.fileId}/share-link/${link.token}/enable`
      );

      if (!res.data.success) {
        throw new Error(
          res.data.message ||
            "Failed to enable link"
        );
      }

      setLinks((prev) =>
        prev.map((item) =>
          item.token === link.token
            ? {
                ...item,
                enabled: true,
              }
            : item
        )
      );

      setStats((prev) => ({
        ...prev,
        activeLinks:
          prev.activeLinks + 1,
        disabledLinks: Math.max(
          0,
          prev.disabledLinks - 1
        ),
      }));

      toast.success(
        "Share link enabled 🟢"
      );
    } catch (error: any) {
      console.error(
        "Enable share link failed:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to enable share link"
      );
    } finally {
      setActionToken(null);
    }
  };

  return (
    <MainLayout>
      <main className="min-h-screen bg-[#080d1a] px-4 py-8 text-white md:px-8">
        <div className="mx-auto max-w-7xl">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10">
                  <Link2 className="h-7 w-7 text-blue-400" />
                </div>

                <div>
                  <h1 className="text-3xl font-bold">
                    Shared Links
                  </h1>

                  <p className="mt-1 text-sm text-zinc-500">
                    Manage all your public file sharing links.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchShareLinks}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>

          {/* =====================================================
              STATS
          ===================================================== */}

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-white/5 bg-[#10192E] p-5">
              <p className="text-sm text-zinc-500">
                Total Links
              </p>

              <p className="mt-2 text-3xl font-bold">
                {stats.totalLinks}
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#10192E] p-5">
              <p className="text-sm text-zinc-500">
                Active Links
              </p>

              <p className="mt-2 text-3xl font-bold text-green-400">
                {stats.activeLinks}
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#10192E] p-5">
              <p className="text-sm text-zinc-500">
                Disabled Links
              </p>

              <p className="mt-2 text-3xl font-bold text-red-400">
                {stats.disabledLinks}
              </p>
            </div>

          </div>

          {/* =====================================================
              SEARCH + VIEW
          ===================================================== */}

          <div className="mt-8 flex flex-col gap-3 md:flex-row">

            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search shared links..."
                className="w-full rounded-2xl border border-white/10 bg-[#10192E] py-3 pl-12 pr-4 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500/50"
              />
            </div>

            <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">

              <button
                type="button"
                onClick={() =>
                  setView("list")
                }
                className={`rounded-lg p-2 ${
                  view === "list"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-500 hover:text-white"
                }`}
                title="List view"
              >
                <List className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setView("grid")
                }
                className={`rounded-lg p-2 ${
                  view === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-500 hover:text-white"
                }`}
                title="Grid view"
              >
                <Grid3X3 className="h-5 w-5" />
              </button>

            </div>
          </div>

          {!loading && (
            <p className="mt-5 text-sm text-zinc-500">
              {filteredLinks.length}{" "}
              {filteredLinks.length === 1
                ? "link"
                : "links"}
            </p>
          )}

          {/* =====================================================
              CONTENT
          ===================================================== */}

          <div className="mt-6">

            {loading ? (

              <div className="flex items-center justify-center rounded-3xl border border-white/5 bg-[#10192E] py-20 text-zinc-500">
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                Loading shared links...
              </div>

            ) : filteredLinks.length === 0 ? (

              <div className="rounded-3xl border border-white/5 bg-[#10192E] py-20 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
                  <Link2 className="h-8 w-8 text-blue-400" />
                </div>

                <h2 className="mt-5 text-xl font-semibold">
                  No shared links
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                  Public links that you generate for your files will appear here.
                </p>

              </div>

            ) : view === "list" ? (

              <div className="space-y-3">

                {filteredLinks.map(
                  (link) => (
                    <div
                      key={link.id}
                      className="rounded-2xl border border-white/5 bg-[#10192E] p-4 transition hover:border-blue-500/30"
                    >

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        {/* FILE INFO */}

                        <div className="flex min-w-0 items-center gap-4">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                            <Link2 className="h-6 w-6 text-blue-400" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-semibold">
                              {link.fileName}
                            </h3>

                            <p className="mt-1 text-xs text-zinc-500">
                              Created{" "}
                              {formatDate(
                                link.createdAt
                              )}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-2">

                              <span
                                className={`rounded-lg px-2.5 py-1 text-xs ${
                                  link.enabled
                                    ? "bg-green-500/10 text-green-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                              >
                                {link.enabled
                                  ? "Active"
                                  : "Disabled"}
                              </span>

                              <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-zinc-400">
                                {link.permission ===
                                "download"
                                  ? "Download"
                                  : "View only"}
                              </span>

                            </div>
                          </div>
                        </div>

                        {/* LINK */}

                        <div className="min-w-0 flex-1 lg:max-w-xl">
                          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-black/20 px-3 py-2">
                            <Link2 className="h-4 w-4 shrink-0 text-zinc-600" />

                            <span className="min-w-0 flex-1 truncate text-xs text-zinc-500">
                              {link.shareUrl}
                            </span>
                          </div>
                        </div>

                        {/* ACTIONS */}

                        <div className="flex flex-wrap items-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(link)
                            }
                            className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
                          >
                            {copiedToken ===
                            link.token ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}

                            {copiedToken ===
                            link.token
                              ? "Copied"
                              : "Copy"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleOpen(link)
                            }
                            disabled={!link.enabled}
                            className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-3 py-2 text-sm text-blue-400 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open
                          </button>

                          {link.enabled ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleDisable(
                                  link
                                )
                              }
                              disabled={
                                actionToken ===
                                link.token
                              }
                              className="flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/20 disabled:opacity-40"
                            >
                              {actionToken ===
                              link.token ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <PowerOff className="h-4 w-4" />
                              )}

                              Disable
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleEnable(
                                  link
                                )
                              }
                              disabled={
                                actionToken ===
                                link.token
                              }
                              className="flex items-center gap-2 rounded-xl bg-green-500/10 px-3 py-2 text-sm text-green-400 transition hover:bg-green-500/20 disabled:opacity-40"
                            >
                              {actionToken ===
                              link.token ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}

                              Enable
                            </button>
                          )}

                        </div>

                      </div>
                    </div>
                  )
                )}

              </div>

            ) : (

              /* =================================================
                 GRID
              ================================================= */

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {filteredLinks.map(
                  (link) => (
                    <div
                      key={link.id}
                      className="rounded-2xl border border-white/5 bg-[#10192E] p-5 transition hover:-translate-y-1 hover:border-blue-500/30"
                    >

                      <div className="flex h-28 items-center justify-center rounded-xl bg-blue-500/5">
                        <Link2 className="h-10 w-10 text-blue-400" />
                      </div>

                      <h3 className="mt-4 truncate font-semibold">
                        {link.fileName}
                      </h3>

                      <p className="mt-1 text-xs text-zinc-600">
                        Created{" "}
                        {formatDate(
                          link.createdAt
                        )}
                      </p>

                      <div className="mt-3 flex items-center gap-2">

                        <span
                          className={`rounded-lg px-2.5 py-1 text-xs ${
                            link.enabled
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {link.enabled
                            ? "Active"
                            : "Disabled"}
                        </span>

                        <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-zinc-400">
                          {link.permission ===
                          "download"
                            ? "Download"
                            : "View"}
                        </span>

                      </div>

                      <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-zinc-400">

                        {link.permission ===
                        "download" ? (
                          <Download className="h-4 w-4 text-green-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-blue-400" />
                        )}

                        {link.permission ===
                        "download"
                          ? "Download allowed"
                          : "View only"}

                      </div>

                      <div className="mt-3 rounded-xl bg-black/20 px-3 py-2">
                        <p className="truncate text-xs text-zinc-600">
                          {link.shareUrl}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(link)
                          }
                          className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-2 text-zinc-300 transition hover:bg-white/10"
                        >
                          {copiedToken ===
                          link.token ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}

                          Copy
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleOpen(link)
                          }
                          disabled={!link.enabled}
                          className="flex items-center justify-center gap-2 rounded-xl bg-blue-500/10 py-2 text-blue-400 transition hover:bg-blue-500/20 disabled:opacity-40"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open
                        </button>

                        {link.enabled ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleDisable(
                                link
                              )
                            }
                            disabled={
                              actionToken ===
                              link.token
                            }
                            className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2 text-red-400 transition hover:bg-red-500/20 disabled:opacity-40"
                          >
                            {actionToken ===
                            link.token ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <PowerOff className="h-4 w-4" />
                            )}

                            Disable Link
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleEnable(
                                link
                              )
                            }
                            disabled={
                              actionToken ===
                              link.token
                            }
                            className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-green-500/10 py-2 text-green-400 transition hover:bg-green-500/20 disabled:opacity-40"
                          >
                            {actionToken ===
                            link.token ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}

                            Enable Link
                          </button>
                        )}

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>
        </div>
      </main>
    </MainLayout>
  );
}