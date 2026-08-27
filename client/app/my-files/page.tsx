"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useEffect, useMemo, useState } from "react";

import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  FileText,
  ImageIcon,
  Video,
  FileArchive,
  ExternalLink,
  Download,
  Trash2,
  Loader2,
  FolderOpen,
  Star,
  Share2,
  X,
  Eye,
  CheckCircle2,
  FolderPlus,
  Pencil,
} from "lucide-react";

import toast from "react-hot-toast";
import api from "@/lib/axios";

type Permission = "view" | "download";

interface ShareLink {
  id: string;
  number: number;
  token: string;
  shareUrl: string;
  permission: Permission;
  enabled: boolean;
  createdAt: string;
}

interface FolderItem {
  _id: string;
  name: string;
  parent: string | null;
  isTrashed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FileItem {
  _id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  createdAt: string;
  isFavorite: boolean;
  folder?: string | null;
  shareLinks?: ShareLink[];
}

type Category =
  | "all"
  | "image"
  | "video"
  | "document"
  | "archive";

const categories = [
  {
    key: "all",
    label: "All Files",
  },
  {
    key: "image",
    label: "Images",
  },
  {
    key: "video",
    label: "Videos",
  },
  {
    key: "document",
    label: "Documents",
  },
  {
    key: "archive",
    label: "Archives",
  },
];

export default function MyFilesPage() {
  const [files, setFiles] =
    useState<FileItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState<Category>("all");

  const [sortBy, setSortBy] =
    useState("date");

  const [view, setView] =
    useState<"grid" | "list">("list");

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [favoriteId, setFavoriteId] =
    useState<string | null>(null);

  // =====================================================
  // SHARE STATES
  // =====================================================

  const [shareFile, setShareFile] =
    useState<FileItem | null>(null);

  const [sharePermission, setSharePermission] =
    useState<Permission>("view");

  const [sharing, setSharing] =
    useState(false);

  const [copyingToken, setCopyingToken] =
    useState<string | null>(null);

  const [disablingToken, setDisablingToken] =
    useState<string | null>(null);

  const [enablingToken, setEnablingToken] =
    useState<string | null>(null);

  const [shareLinks, setShareLinks] =
    useState<ShareLink[]>([]);

  // =====================================================
  // FOLDER STATES
  // =====================================================

  const [folders, setFolders] =
    useState<FolderItem[]>([]);

  // Complete folder tree used for breadcrumbs.
  const [allFolders, setAllFolders] =
    useState<FolderItem[]>([]);

  const [currentParent, setCurrentParent] =
    useState<string | null>(null);

  const [creatingFolder, setCreatingFolder] =
    useState(false);

  // =====================================================
  // MOVE FILE STATES
  // =====================================================

  const [moveFileItem, setMoveFileItem] =
    useState<FileItem | null>(null);

  const [moveFolders, setMoveFolders] =
    useState<FolderItem[]>([]);

  const [moveFolderId, setMoveFolderId] =
    useState<string | null>(null);

  const [loadingMoveFolders, setLoadingMoveFolders] =
    useState(false);

  const [movingFile, setMovingFile] =
    useState(false);

  // =====================================================
  // FETCH FILES
  // =====================================================

  const fetchFiles = async () => {
    try {
      setLoading(true);

      const res =
        await api.get("/files/list");

      if (res.data.success) {
        setFiles(res.data.files);
      }
    } catch (error) {
      console.error(
        "Failed to fetch files:",
        error
      );

      toast.error(
        "Failed to load files"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // =====================================================
  // FETCH FOLDERS
  // =====================================================

  const fetchFolders = async () => {
    try {
      const res = await api.get(
        "/folders",
        {
          params: {
            parent: currentParent,
          },
        }
      );

      if (res.data.success) {
        setFolders(
          res.data.folders || []
        );
      }
    } catch (error: any) {
      console.error(
        "Failed to fetch folders:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load folders"
      );
    }
  };

  useEffect(() => {
    fetchFolders();
  }, [currentParent]);

  // =====================================================
  // FETCH COMPLETE FOLDER TREE FOR BREADCRUMBS
  // =====================================================

  const fetchAllFolders = async () => {
    try {
      const collected: FolderItem[] = [];

      const loadChildren = async (
        parent: string | null
      ): Promise<void> => {
        const res = await api.get(
          "/folders",
          {
            params: { parent },
          }
        );

        if (!res.data.success) {
          return;
        }

        const children: FolderItem[] =
          res.data.folders || [];

        for (const folder of children) {
          collected.push(folder);
          await loadChildren(folder._id);
        }
      };

      await loadChildren(null);
      setAllFolders(collected);
    } catch (error) {
      console.error(
        "Failed to fetch folder tree:",
        error
      );
    }
  };

  useEffect(() => {
    fetchAllFolders();
  }, []);

  // =====================================================
  // BREADCRUMB PATH
  // =====================================================

  const breadcrumbFolders = useMemo(() => {
    const path: FolderItem[] = [];
    let id = currentParent;

    while (id) {
      const folder = allFolders.find(
        (item) => item._id === id
      );

      if (!folder) {
        break;
      }

      path.unshift(folder);
      id = folder.parent;
    }

    return path;
  }, [allFolders, currentParent]);

  // =====================================================
  // OPEN FOLDER
  // =====================================================

  const openFolder = (folderId: string) => {
    setSearch("");
    setCategory("all");
    setCurrentParent(folderId);
  };

  // =====================================================
  // GO TO BREADCRUMB
  // =====================================================

  const goToFolder = (
    folderId: string | null
  ) => {
    setSearch("");
    setCategory("all");
    setCurrentParent(folderId);
  };

  // =====================================================
  // CREATE FOLDER
  // =====================================================

  const handleCreateFolder = async () => {
    const name = window.prompt(
      "Enter folder name:"
    );

    if (!name?.trim()) {
      return;
    }

    try {
      setCreatingFolder(true);

      const res = await api.post(
        "/folders",
        {
          name: name.trim(),
          parent: currentParent,
        }
      );

      if (res.data.success) {
        setFolders((prev) =>
          [...prev, res.data.folder].sort(
            (a, b) =>
              a.name.localeCompare(b.name)
          )
        );

        setAllFolders((prev) =>
          prev.some(
            (item) =>
              item._id ===
              res.data.folder._id
          )
            ? prev
            : [...prev, res.data.folder]
        );

        toast.success(
          "Folder created 📁"
        );
      }
    } catch (error: any) {
      console.error(
        "CREATE FOLDER ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to create folder"
      );
    } finally {
      setCreatingFolder(false);
    }
  };

  // =====================================================
  // RENAME FOLDER
  // =====================================================

  const handleRenameFolder = async (
    folder: FolderItem
  ) => {
    const name = window.prompt(
      "Enter new folder name:",
      folder.name
    );

    if (!name?.trim()) {
      return;
    }

    try {
      const res = await api.patch(
        `/folders/${folder._id}`,
        {
          name: name.trim(),
        }
      );

      if (res.data.success) {
        setFolders((prev) =>
          prev.map((item) =>
            item._id === folder._id
              ? res.data.folder
              : item
          )
        );

        setAllFolders((prev) =>
          prev.map((item) =>
            item._id === folder._id
              ? res.data.folder
              : item
          )
        );

        toast.success(
          "Folder renamed ✏️"
        );
      }
    } catch (error: any) {
      console.error(
        "RENAME FOLDER ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to rename folder"
      );
    }
  };

  // =====================================================
  // DELETE FOLDER
  // =====================================================

  const handleDeleteFolder = async (
    folder: FolderItem
  ) => {
    const confirmed = window.confirm(
      `Move "${folder.name}" to Trash?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const res = await api.delete(
        `/folders/${folder._id}`
      );

      if (res.data.success) {
        setFolders((prev) =>
          prev.filter(
            (item) =>
              item._id !== folder._id
          )
        );

        setAllFolders((prev) =>
          prev.filter(
            (item) =>
              item._id !== folder._id
          )
        );

        toast.success(
          "Folder moved to Trash 🗑️"
        );
      }
    } catch (error: any) {
      console.error(
        "DELETE FOLDER ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete folder"
      );
    }
  };

  // =====================================================
  // LOAD ALL FOLDERS FOR MOVE DIALOG
  // =====================================================

  const loadMoveFolders = async () => {
    try {
      setLoadingMoveFolders(true);

      const collected: FolderItem[] = [];

      const loadChildren = async (
        parent: string | null
      ): Promise<void> => {
        const res = await api.get(
          "/folders",
          {
            params: {
              parent,
            },
          }
        );

        if (!res.data.success) {
          return;
        }

        const children: FolderItem[] =
          res.data.folders || [];

        for (const folder of children) {
          collected.push(folder);
          await loadChildren(folder._id);
        }
      };

      await loadChildren(null);

      setMoveFolders(collected);
    } catch (error: any) {
      console.error(
        "LOAD MOVE FOLDERS ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load folders"
      );
    } finally {
      setLoadingMoveFolders(false);
    }
  };

  // =====================================================
  // OPEN MOVE MODAL
  // =====================================================

  const openMoveModal = async (
    file: FileItem
  ) => {
    setMoveFileItem(file);
    setMoveFolderId(
      file.folder || null
    );

    await loadMoveFolders();
  };

  // =====================================================
  // CLOSE MOVE MODAL
  // =====================================================

  const closeMoveModal = () => {
    if (movingFile) {
      return;
    }

    setMoveFileItem(null);
    setMoveFolderId(null);
    setMoveFolders([]);
  };

  // =====================================================
  // MOVE FILE
  // =====================================================

  const handleMoveFile = async () => {
    if (!moveFileItem) {
      return;
    }

    try {
      setMovingFile(true);

      const res = await api.patch(
        `/files/${moveFileItem._id}/move`,
        {
          folderId: moveFolderId,
        }
      );

      if (!res.data.success) {
        throw new Error(
          res.data.message ||
            "Failed to move file"
        );
      }

      const updatedFile =
        res.data.file;

      setFiles((prev) =>
        prev.map((item) =>
          item._id === moveFileItem._id
            ? {
                ...item,
                folder:
                  updatedFile.folder ??
                  null,
              }
            : item
        )
      );

      toast.success(
        moveFolderId
          ? "File moved successfully 📁"
          : "File moved to My Files 🏠"
      );

      closeMoveModal();
    } catch (error: any) {
      console.error(
        "MOVE FILE ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to move file"
      );
    } finally {
      setMovingFile(false);
    }
  };

  // =====================================================
  // CATEGORY
  // =====================================================

  const getCategory = (
    type: string
  ): Category => {
    if (
      type?.startsWith("image/")
    ) {
      return "image";
    }

    if (
      type?.startsWith("video/")
    ) {
      return "video";
    }

    if (
      type?.includes("zip") ||
      type?.includes("rar") ||
      type?.includes("archive") ||
      type?.includes("7z")
    ) {
      return "archive";
    }

    if (
      type?.includes("pdf") ||
      type?.includes("document") ||
      type?.includes("text") ||
      type?.includes("word") ||
      type?.includes("sheet") ||
      type?.includes("presentation")
    ) {
      return "document";
    }

    return "document";
  };

  // =====================================================
  // FILTER + SEARCH + SORT
  // =====================================================

  const filteredFiles = useMemo(() => {
    let result = files.filter(
      (file) =>
        (file.folder || null) ===
        currentParent
    );

    if (search.trim()) {
      const query =
        search.toLowerCase();

      result = result.filter(
        (file) =>
          file.name
            .toLowerCase()
            .includes(query)
      );
    }

    if (category !== "all") {
      result = result.filter(
        (file) =>
          getCategory(file.type) ===
          category
      );
    }

    result.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(
          b.name
        );
      }

      if (sortBy === "size") {
        return b.size - a.size;
      }

      return (
        new Date(
          b.createdAt
        ).getTime() -
        new Date(
          a.createdAt
        ).getTime()
      );
    });

    return result;
  }, [
    files,
    search,
    category,
    sortBy,
    currentParent,
  ]);

  // =====================================================
  // FORMAT SIZE
  // =====================================================

  const formatSize = (
    size: number
  ) => {
    if (size < 1024) {
      return `${size} B`;
    }

    if (
      size <
      1024 * 1024
    ) {
      return `${(
        size / 1024
      ).toFixed(2)} KB`;
    }

    if (
      size <
      1024 *
        1024 *
        1024
    ) {
      return `${(
        size /
        1024 /
        1024
      ).toFixed(2)} MB`;
    }

    return `${(
      size /
      1024 /
      1024 /
      1024
    ).toFixed(2)} GB`;
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // FILE ICON
  // =====================================================

  const getIcon = (
    type: string
  ) => {
    if (
      type?.startsWith("image/")
    ) {
      return (
        <ImageIcon className="h-6 w-6 text-purple-400" />
      );
    }

    if (
      type?.startsWith("video/")
    ) {
      return (
        <Video className="h-6 w-6 text-pink-400" />
      );
    }

    if (
      type?.includes("zip") ||
      type?.includes("rar") ||
      type?.includes("archive")
    ) {
      return (
        <FileArchive className="h-6 w-6 text-yellow-400" />
      );
    }

    return (
      <FileText className="h-6 w-6 text-blue-400" />
    );
  };

  // =====================================================
  // DELETE FILE
  // =====================================================

  const handleDelete = async (
    file: FileItem
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${file.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(file._id);

      const res =
        await api.delete(
          `/files/${file._id}`
        );

      if (res.data.success) {
        setFiles((prev) =>
          prev.filter(
            (item) =>
              item._id !== file._id
          )
        );

        window.dispatchEvent(
          new Event(
            "files-updated"
          )
        );

        toast.success(
          "File moved to Trash 🗑️"
        );
      }
    } catch (error: any) {
      console.error(
        "Delete failed:",
        error
      );

      toast.error(
        error.response?.data
          ?.message ||
          "Failed to delete file"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // FAVORITE
  // =====================================================

  const handleFavorite =
    async (
      file: FileItem
    ) => {
      try {
        setFavoriteId(
          file._id
        );

        const res =
          await api.patch(
            `/files/${file._id}/favorite`
          );

        if (
          res.data.success
        ) {
          setFiles((prev) =>
            prev.map(
              (item) =>
                item._id ===
                file._id
                  ? {
                      ...item,
                      isFavorite:
                        res.data
                          .isFavorite,
                    }
                  : item
            )
          );

          if (
            res.data
              .isFavorite
          ) {
            toast.success(
              "Added to Favorites ⭐"
            );
          } else {
            toast.success(
              "Removed from Favorites ☆"
            );
          }

          window.dispatchEvent(
            new Event(
              "files-updated"
            )
          );
        }
      } catch (error: any) {
        console.error(
          "Favorite failed:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Failed to update favorite"
        );
      } finally {
        setFavoriteId(null);
      }
    };

  // =====================================================
  // DOWNLOAD
  // =====================================================

  const handleDownload =
    async (
      file: FileItem
    ) => {
      try {
        const response =
          await fetch(
            file.url
          );

        if (!response.ok) {
          throw new Error(
            "Download failed"
          );
        }

        const blob =
          await response.blob();

        const url =
          window.URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;
        link.download =
          file.name;

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          url
        );

        toast.success(
          "Download started ⬇️"
        );
      } catch (error) {
        console.error(
          "Download failed:",
          error
        );

        toast.error(
          "Download failed"
        );
      }
    };

  // =====================================================
  // OPEN SHARE MODAL + LOAD SAVED LINKS FROM DATABASE
  // =====================================================

  const openShareModal = async (
    file: FileItem
  ) => {
    setShareFile(file);
    setSharePermission("view");
    setShareLinks([]);

    try {
      const res = await api.get(
        `/files/${file._id}/share-links`
      );

      if (res.data.success) {
        const links: ShareLink[] =
          (res.data.links || []).map(
            (
              item: any,
              index: number
            ) => ({
              id:
                item.id ||
                item._id ||
                item.token,

              number:
                index + 1,

              token:
                item.token,

              shareUrl:
                item.shareUrl ||
                `${window.location.origin}/share/${item.token}`,

              permission:
                item.permission ===
                "download"
                  ? "download"
                  : "view",

              enabled:
                item.enabled === true,

              createdAt:
                item.createdAt ||
                new Date().toISOString(),
            })
          );

        setShareLinks(links);

        setFiles((prev) =>
          prev.map((item) =>
            item._id === file._id
              ? {
                  ...item,
                  shareLinks: links,
                }
              : item
          )
        );
      }
    } catch (error: any) {
      console.error(
        "LOAD SHARE LINKS ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load saved share links"
      );
    }
  };

  // =====================================================
  // CLOSE SHARE MODAL
  // =====================================================

  const closeShareModal = () => {
    if (
      sharing ||
      disablingToken ||
      enablingToken
    ) {
      return;
    }

    setShareFile(null);

    setSharePermission(
      "view"
    );

    setShareLinks([]);
  };

  // =====================================================
  // GENERATE PUBLIC SHARE LINK
  // =====================================================

  const handleShare = async () => {
    if (!shareFile) {
      return;
    }

    try {
      setSharing(true);

      const res = await api.post(
        `/files/${shareFile._id}/share-link`,
        {
          permission: sharePermission,
        }
      );

      if (!res.data.success) {
        throw new Error(
          res.data.message ||
            "Failed to generate share link"
        );
      }

      const serverLinks =
        res.data.shareLinks || [];

      const formattedLinks: ShareLink[] =
        serverLinks.map(
          (
            item: any,
            index: number
          ) => ({
            id:
              item._id ||
              item.id ||
              item.token,

            number:
              index + 1,

            token:
              item.token,

            shareUrl:
              item.shareUrl ||
              `${window.location.origin}/share/${item.token}`,

            permission:
              item.permission ===
              "download"
                ? "download"
                : "view",

            enabled:
              item.enabled === true,

            createdAt:
              item.createdAt ||
              new Date().toISOString(),
          })
        );

      // If backend returns the newly created link but
      // does not return the full array, keep it as fallback.
      if (
        formattedLinks.length === 0 &&
        res.data.token
      ) {
        formattedLinks.push({
          id: res.data.token,
          number: 1,
          token: res.data.token,
          shareUrl:
            res.data.shareUrl ||
            `${window.location.origin}/share/${res.data.token}`,
          permission:
            res.data.permission ===
            "download"
              ? "download"
              : "view",
          enabled: true,
          createdAt:
            new Date().toISOString(),
        });
      }

      setShareLinks(
        formattedLinks
      );

      setFiles((prev) =>
        prev.map((item) =>
          item._id ===
          shareFile._id
            ? {
                ...item,
                shareLinks:
                  formattedLinks,
              }
            : item
        )
      );

      toast.success(
        "New share link generated 🔗"
      );
    } catch (error: any) {
      console.error(
        "GENERATE SHARE LINK ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate share link"
      );
    } finally {
      setSharing(false);
    }
  };

  // =====================================================
  // COPY SHARE LINK
  // =====================================================

  const handleCopyLink =
    async (
      link: ShareLink
    ) => {
      try {
        setCopyingToken(
          link.token
        );

        await navigator.clipboard.writeText(
          link.shareUrl
        );

        toast.success(
          "Share link copied 🔗"
        );
      } catch (error) {
        console.error(
          "Copy link failed:",
          error
        );

        toast.error(
          "Failed to copy link"
        );
      } finally {
        setCopyingToken(
          null
        );
      }
    };

  // =====================================================
  // DISABLE PUBLIC SHARE LINK
  // =====================================================

  const handleDisableLink = async (
    link: ShareLink
  ) => {
    if (!shareFile) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to disable this share link?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDisablingToken(
        link.token
      );

      const res = await api.patch(
        `/files/${shareFile._id}/share-link/${link.token}/disable`
      );

      if (res.data.success) {
        setShareLinks((prev) =>
          prev.map((item) =>
            item.token === link.token
              ? {
                  ...item,
                  enabled: false,
                }
              : item
          )
        );

        setFiles((prev) =>
          prev.map((file) =>
            file._id ===
            shareFile._id
              ? {
                  ...file,
                  shareLinks:
                    file.shareLinks?.map(
                      (item) =>
                        item.token ===
                        link.token
                          ? {
                              ...item,
                              enabled:
                                false,
                            }
                          : item
                    ),
                }
              : file
          )
        );

        toast.success(
          "Share link disabled 🛑"
        );
      }
    } catch (error: any) {
      console.error(
        "DISABLE SHARE LINK ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to disable share link"
      );
    } finally {
      setDisablingToken(
        null
      );
    }
  };

  // =====================================================
  // ENABLE PUBLIC SHARE LINK
  // =====================================================

  const handleEnableLink = async (
    link: ShareLink
  ) => {
    if (!shareFile) {
      return;
    }

    try {
      setEnablingToken(
        link.token
      );

      const res = await api.patch(
        `/files/${shareFile._id}/share-link/${link.token}/enable`
      );

      if (res.data.success) {
        setShareLinks((prev) =>
          prev.map((item) =>
            item.token === link.token
              ? {
                  ...item,
                  enabled: true,
                }
              : item
          )
        );

        setFiles((prev) =>
          prev.map((file) =>
            file._id ===
            shareFile._id
              ? {
                  ...file,
                  shareLinks:
                    file.shareLinks?.map(
                      (item) =>
                        item.token ===
                        link.token
                          ? {
                              ...item,
                              enabled:
                                true,
                            }
                          : item
                    ),
                }
              : file
          )
        );

        toast.success(
          "Share link enabled 🟢"
        );
      }
    } catch (error: any) {
      console.error(
        "ENABLE SHARE LINK ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to enable share link"
      );
    } finally {
      setEnablingToken(
        null
      );
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

                <FolderOpen className="h-8 w-8 text-blue-400" />

                <h1 className="text-3xl font-bold">
                  {currentParent
                    ? breadcrumbFolders[
                        breadcrumbFolders.length - 1
                      ]?.name || "My Files"
                    : "My Files"}
                </h1>

              </div>

              <p className="mt-2 text-zinc-500">
                Manage everything stored in your LoveDrive.
              </p>
            </div>

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={handleCreateFolder}
                disabled={creatingFolder}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FolderPlus className="h-4 w-4" />

                {creatingFolder
                  ? "Creating..."
                  : "New Folder"}
              </button>

              {/* VIEW SWITCH */}

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">

              <button
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

          </div>

          {/* =====================================================
              SEARCH
          ===================================================== */}

          <div className="mt-8 flex flex-col gap-3 md:flex-row">

            <div className="relative flex-1">

              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search files..."
                className="w-full rounded-2xl border border-white/10 bg-[#10192E] py-3 pl-12 pr-4 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500/50"
              />

            </div>

            {/* SORT */}

            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#10192E] px-4">

              <SlidersHorizontal className="h-5 w-5 text-zinc-500" />

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value
                  )
                }
                className="bg-transparent py-3 text-sm text-white outline-none"
              >

                <option
                  value="date"
                  className="bg-[#10192E]"
                >
                  Newest
                </option>

                <option
                  value="name"
                  className="bg-[#10192E]"
                >
                  Name
                </option>

                <option
                  value="size"
                  className="bg-[#10192E]"
                >
                  Largest
                </option>

              </select>

            </div>

          </div>

          {/* =====================================================
              CATEGORIES
          ===================================================== */}

          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">

            {categories.map(
              (item) => (
                <button
                  key={item.key}
                  onClick={() =>
                    setCategory(
                      item.key as Category
                    )
                  }
                  className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
                    category ===
                    item.key
                      ? "bg-blue-600 text-white"
                      : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              )
            )}

          </div>

          {/* =====================================================
              FOLDERS
          ===================================================== */}

          <div className="mt-8">

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              {/* BREADCRUMBS */}

              <div className="flex min-w-0 items-center gap-1 overflow-x-auto pb-1 text-sm">

                <button
                  type="button"
                  onClick={() =>
                    goToFolder(null)
                  }
                  className={`shrink-0 rounded-lg px-2 py-1.5 font-medium transition ${
                    currentParent === null
                      ? "bg-blue-600/10 text-blue-400"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  🏠 My Files
                </button>

                {breadcrumbFolders.map(
                  (folder) => (
                    <div
                      key={folder._id}
                      className="flex shrink-0 items-center gap-1"
                    >
                      <span className="text-zinc-700">
                        /
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          goToFolder(folder._id)
                        }
                        className={`max-w-[180px] truncate rounded-lg px-2 py-1.5 font-medium transition ${
                          folder._id === currentParent
                            ? "bg-blue-600/10 text-blue-400"
                            : "text-zinc-400 hover:bg-white/5 hover:text-white"
                        }`}
                        title={folder.name}
                      >
                        📁 {folder.name}
                      </button>
                    </div>
                  )
                )}

              </div>

              <span className="shrink-0 text-xs text-zinc-600">
                {folders.length}{" "}
                {folders.length === 1
                  ? "folder"
                  : "folders"}
              </span>

            </div>

            {folders.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {folders.map((folder) => (
                  <div
                    key={folder._id}
                    className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-[#10192E] p-4 transition hover:border-blue-500/30"
                  >

                    <button
                      type="button"
                      onClick={() =>
                        openFolder(folder._id)
                      }
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                        <FolderOpen className="h-6 w-6 text-blue-400" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {folder.name}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          Open folder
                        </p>
                      </div>
                    </button>

                    <div className="flex shrink-0 items-center gap-1">

                      <button
                        type="button"
                        onClick={() =>
                          handleRenameFolder(folder)
                        }
                        className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                        title="Rename"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteFolder(folder)
                        }
                        className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                        title="Move to trash"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>

                  </div>
                ))}

              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">
                <FolderOpen className="mx-auto h-9 w-9 text-zinc-700" />
                <p className="mt-3 text-sm text-zinc-500">
                  No folders here
                </p>
              </div>
            )}

          </div>

          {/* =====================================================
              RESULTS
          ===================================================== */}

          <div className="mt-8">

            {loading ? (

              <div className="flex items-center justify-center rounded-3xl border border-white/5 bg-[#10192E] py-20 text-zinc-500">

                <Loader2 className="mr-3 h-6 w-6 animate-spin" />

                Loading your files...

              </div>

            ) : filteredFiles.length === 0 ? (

              <div className="rounded-3xl border border-white/5 bg-[#10192E] py-20 text-center">

                <FolderOpen className="mx-auto h-14 w-14 text-zinc-700" />

                <h2 className="mt-5 text-xl font-semibold">
                  No files found
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Try another search or category.
                </p>

              </div>

            ) : view === "list" ? (

              /* =================================================
                 LIST
              ================================================= */

              <div className="space-y-3">

                {filteredFiles.map(
                  (file) => (

                    <div
                      key={file._id}
                      className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-[#10192E] p-4 transition hover:border-blue-500/30 md:flex-row md:items-center md:justify-between"
                    >

                      {/* FILE INFO */}

                      <div className="flex min-w-0 items-center gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5">

                          {getIcon(
                            file.type
                          )}

                        </div>

                        <div className="min-w-0">

                          <h3 className="truncate font-semibold">
                            {file.name}
                          </h3>

                          <p className="mt-1 text-sm text-zinc-500">

                            {formatSize(
                              file.size
                            )}

                            {" • "}

                            {formatDate(
                              file.createdAt
                            )}

                            {file.shareLinks &&
                              file.shareLinks.length >
                                0 && (
                                <>
                                  {" • "}
                                  🔗{" "}
                                  {
                                    file
                                      .shareLinks
                                      .length
                                  }
                                </>
                              )}

                          </p>

                        </div>

                      </div>

                      {/* ACTIONS */}

                      <div className="flex flex-wrap items-center gap-2">

                        {/* FAVORITE */}

                        <button
                          onClick={() =>
                            handleFavorite(
                              file
                            )
                          }
                          disabled={
                            favoriteId ===
                            file._id
                          }
                          title={
                            file.isFavorite
                              ? "Remove from Favorites"
                              : "Add to Favorites"
                          }
                          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition ${
                            file.isFavorite
                              ? "bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30"
                              : "bg-white/5 text-zinc-400 hover:bg-yellow-400/10 hover:text-yellow-300"
                          }`}
                        >

                          {favoriteId ===
                          file._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Star
                              className={`h-4 w-4 ${
                                file.isFavorite
                                  ? "fill-current"
                                  : ""
                              }`}
                            />
                          )}

                          {file.isFavorite
                            ? "Favorited"
                            : "Favorite"}

                        </button>

                        {/* SHARE */}

                        <button
                          onClick={() =>
                            openShareModal(
                              file
                            )
                          }
                          className="flex items-center gap-2 rounded-xl bg-purple-500/10 px-4 py-2 text-sm text-purple-400 transition hover:bg-purple-500/20"
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </button>

                        {/* OPEN */}

                        <a
                          href={
                            file.url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/20"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open
                        </a>

                        {/* DOWNLOAD */}

                        <button
                          onClick={() =>
                            handleDownload(
                              file
                            )
                          }
                          className="flex items-center gap-2 rounded-xl bg-green-500/10 px-4 py-2 text-sm text-green-400 hover:bg-green-500/20"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>

                        {/* MOVE */}

                        <button
                          onClick={() =>
                            openMoveModal(
                              file
                            )
                          }
                          className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/20"
                          title="Move to folder"
                        >
                          <FolderOpen className="h-4 w-4" />
                          Move
                        </button>

                        {/* DELETE */}

                        <button
                          onClick={() =>
                            handleDelete(
                              file
                            )
                          }
                          disabled={
                            deletingId ===
                            file._id
                          }
                          className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                        >

                          {deletingId ===
                          file._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}

                          Delete

                        </button>

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

                {filteredFiles.map(
                  (file) => (

                    <div
                      key={file._id}
                      className="rounded-2xl border border-white/5 bg-[#10192E] p-5 transition hover:-translate-y-1 hover:border-blue-500/30"
                    >

                      {/* ICON */}

                      <div className="relative flex h-32 items-center justify-center rounded-xl bg-white/5">

                        {getIcon(
                          file.type
                        )}

                        {/* STAR */}

                        <button
                          onClick={() =>
                            handleFavorite(
                              file
                            )
                          }
                          disabled={
                            favoriteId ===
                            file._id
                          }
                          title={
                            file.isFavorite
                              ? "Remove from Favorites"
                              : "Add to Favorites"
                          }
                          className={`absolute right-3 top-3 rounded-lg p-2 transition ${
                            file.isFavorite
                              ? "bg-yellow-400/20 text-yellow-300"
                              : "bg-black/20 text-zinc-500 hover:text-yellow-300"
                          }`}
                        >

                          {favoriteId ===
                          file._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Star
                              className={`h-4 w-4 ${
                                file.isFavorite
                                  ? "fill-current"
                                  : ""
                              }`}
                            />
                          )}

                        </button>

                      </div>

                      {/* FILE NAME */}

                      <h3 className="mt-4 truncate font-semibold">
                        {file.name}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">

                        {formatSize(
                          file.size
                        )}

                        {file.shareLinks &&
                          file.shareLinks.length >
                            0 && (
                            <>
                              {" • "}
                              🔗{" "}
                              {
                                file
                                  .shareLinks
                                  .length
                              }
                            </>
                          )}

                      </p>

                      {/* GRID ACTIONS */}

                      <div className="mt-4 grid grid-cols-4 gap-2">

                        {/* SHARE */}

                        <button
                          onClick={() =>
                            openShareModal(
                              file
                            )
                          }
                          className="flex items-center justify-center rounded-xl bg-purple-500/10 py-2 text-purple-400 transition hover:bg-purple-500/20"
                          title="Share"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>

                        {/* OPEN */}

                        <a
                          href={
                            file.url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center rounded-xl bg-blue-500/10 py-2 text-blue-400 hover:bg-blue-500/20"
                          title="Open"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>

                        {/* DOWNLOAD */}

                        <button
                          onClick={() =>
                            handleDownload(
                              file
                            )
                          }
                          className="flex items-center justify-center rounded-xl bg-green-500/10 py-2 text-green-400 hover:bg-green-500/20"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>

                        {/* MOVE */}

                        <button
                          onClick={() =>
                            openMoveModal(file)
                          }
                          className="flex items-center justify-center rounded-xl bg-blue-500/10 py-2 text-blue-400 hover:bg-blue-500/20"
                          title="Move to folder"
                        >
                          <FolderOpen className="h-4 w-4" />
                        </button>

                        {/* DELETE */}

                        <button
                          onClick={() =>
                            handleDelete(
                              file
                            )
                          }
                          disabled={
                            deletingId ===
                            file._id
                          }
                          className="flex items-center justify-center rounded-xl bg-red-500/10 py-2 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                          title="Delete"
                        >

                          {deletingId ===
                          file._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}

                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>

        {/* =====================================================
            MOVE FILE MODAL
        ===================================================== */}

        {moveFileItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (
                e.target === e.currentTarget
              ) {
                closeMoveModal();
              }
            }}
          >
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#10192E] p-6 shadow-2xl">

              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Move File
                  </h2>

                  <p className="mt-1 truncate text-sm text-zinc-500">
                    {moveFileItem.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeMoveModal}
                  disabled={movingFile}
                  className="rounded-xl p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6">
                <p className="mb-3 text-sm font-medium text-zinc-300">
                  Choose destination
                </p>

                {loadingMoveFolders ? (
                  <div className="flex items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] py-12 text-sm text-zinc-500">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading folders...
                  </div>
                ) : (
                  <div className="max-h-80 space-y-2 overflow-y-auto">

                    {/* ROOT */}
                    <button
                      type="button"
                      onClick={() =>
                        setMoveFolderId(null)
                      }
                      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                        moveFolderId === null
                          ? "border-blue-500/40 bg-blue-500/10"
                          : "border-white/5 bg-white/[0.02] hover:bg-white/5"
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                        <FolderOpen className="h-5 w-5 text-blue-400" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-white">
                          My Files
                        </p>

                        <p className="text-xs text-zinc-500">
                          Root folder
                        </p>
                      </div>

                      {moveFolderId === null && (
                        <CheckCircle2 className="ml-auto h-5 w-5 text-blue-400" />
                      )}
                    </button>

                    {moveFolders.length === 0 ? (
                      <div className="py-8 text-center text-sm text-zinc-600">
                        No folders available.
                      </div>
                    ) : (
                      moveFolders.map(
                        (folder) => (
                          <button
                            key={folder._id}
                            type="button"
                            onClick={() =>
                              setMoveFolderId(
                                folder._id
                              )
                            }
                            disabled={
                              folder._id ===
                              currentParent
                            }
                            className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                              moveFolderId ===
                              folder._id
                                ? "border-blue-500/40 bg-blue-500/10"
                                : "border-white/5 bg-white/[0.02] hover:bg-white/5"
                            } ${
                              folder._id ===
                              currentParent
                                ? "cursor-not-allowed opacity-40"
                                : ""
                            }`}
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                              <FolderOpen className="h-5 w-5 text-blue-400" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white">
                                {folder.name}
                              </p>

                              <p className="text-xs text-zinc-500">
                                Folder
                              </p>
                            </div>

                            {moveFolderId ===
                              folder._id && (
                              <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-blue-400" />
                            )}
                          </button>
                        )
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closeMoveModal}
                  disabled={movingFile}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleMoveFile}
                  disabled={
                    movingFile ||
                    loadingMoveFolders ||
                    moveFolderId ===
                      (moveFileItem.folder ||
                        null)
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {movingFile ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Moving...
                    </>
                  ) : (
                    <>
                      <FolderOpen className="h-4 w-4" />
                      Move
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* =====================================================
            SHARE MODAL
        ===================================================== */}


        {shareFile && (

          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                closeShareModal();
              }
            }}
          >

            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#10192E] p-6 shadow-2xl">

              {/* MODAL HEADER */}

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10">

                    <Share2 className="h-6 w-6 text-purple-400" />

                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-white">
                      Share File
                    </h2>

                    <p className="mt-1 text-xs text-zinc-500">
                      Create and manage secure public links.
                    </p>

                  </div>

                </div>

                <button
                  onClick={
                    closeShareModal
                  }
                  disabled={
                    sharing ||
                    disablingToken !==
                      null ||
                    enablingToken !==
                      null
                  }
                  className="rounded-xl p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              {/* FILE */}

              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">

                  {getIcon(
                    shareFile.type
                  )}

                </div>

                <div className="min-w-0">

                  <p className="truncate font-medium text-white">
                    {shareFile.name}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {formatSize(
                      shareFile.size
                    )}
                  </p>

                </div>

              </div>

              {/* =================================================
                  PERMISSION
              ================================================= */}

              <div className="mt-5">

                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Permission for new link
                </label>

                <div className="grid grid-cols-2 gap-3">

                  {/* VIEW */}

                  <button
                    type="button"
                    onClick={() =>
                      setSharePermission(
                        "view"
                      )
                    }
                    disabled={
                      sharing
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      sharePermission ===
                      "view"
                        ? "border-blue-500/50 bg-blue-500/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <Eye
                        className={`h-5 w-5 ${
                          sharePermission ===
                          "view"
                            ? "text-blue-400"
                            : "text-zinc-500"
                        }`}
                      />

                      {sharePermission ===
                        "view" && (
                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                      )}

                    </div>

                    <p className="mt-3 text-sm font-medium text-white">
                      View only
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      Open the file but cannot download.
                    </p>

                  </button>

                  {/* DOWNLOAD */}

                  <button
                    type="button"
                    onClick={() =>
                      setSharePermission(
                        "download"
                      )
                    }
                    disabled={
                      sharing
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      sharePermission ===
                      "download"
                        ? "border-green-500/50 bg-green-500/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <Download
                        className={`h-5 w-5 ${
                          sharePermission ===
                          "download"
                            ? "text-green-400"
                            : "text-zinc-500"
                        }`}
                      />

                      {sharePermission ===
                        "download" && (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      )}

                    </div>

                    <p className="mt-3 text-sm font-medium text-white">
                      Download
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      Open and download the file.
                    </p>

                  </button>

                </div>

              </div>

              {/* =================================================
                  GENERATE FIRST / NEW LINK
              ================================================= */}

              <button
                type="button"
                onClick={
                  handleShare
                }
                disabled={
                  sharing
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {sharing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Generate New Link
                  </>
                )}

              </button>

              {/* =================================================
                  PUBLIC LINKS
              ================================================= */}

              <div className="mt-7">

                <div className="mb-4 flex items-center justify-between">

                  <div>

                    <p className="text-sm font-semibold text-white">
                      Public Share Links
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {shareLinks.length}{" "}
                      {shareLinks.length ===
                      1
                        ? "link"
                        : "links"}{" "}
                      created
                    </p>

                  </div>

                  <div className="rounded-xl bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-400">
                    🔗{" "}
                    {shareLinks.length}
                  </div>

                </div>

                {shareLinks.length ===
                0 ? (

                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">

                    <Share2 className="mx-auto h-8 w-8 text-zinc-600" />

                    <p className="mt-3 text-sm text-zinc-400">
                      No public links yet
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      Generate your first secure link above.
                    </p>

                  </div>

                ) : (

                  <div className="space-y-3">

                    {shareLinks.map(
                      (
                        link,
                        index
                      ) => (

                        <div
                          key={
                            link.token
                          }
                          className={`rounded-2xl border p-4 ${
                            link.enabled
                              ? "border-green-500/20 bg-green-500/5"
                              : "border-red-500/20 bg-red-500/5"
                          }`}
                        >

                          {/* LINK HEADER */}

                          <div className="flex items-center justify-between gap-3">

                            <div className="flex min-w-0 items-center gap-2">

                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-zinc-300">
                                #{index +
                                  1}
                              </span>

                              {link.permission ===
                              "download" ? (
                                <Download className="h-4 w-4 shrink-0 text-green-400" />
                              ) : (
                                <Eye className="h-4 w-4 shrink-0 text-blue-400" />
                              )}

                              <span className="text-xs font-medium text-zinc-300">
                                {link.permission ===
                                "download"
                                  ? "Download"
                                  : "View only"}
                              </span>

                            </div>

                            {/* STATUS */}

                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                link.enabled
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {link.enabled
                                ? "● Active"
                                : "● Disabled"}
                            </span>

                          </div>

                          {/* URL */}

                          <div className="mt-3 flex gap-2">

                            <input
                              readOnly
                              value={
                                link.shareUrl
                              }
                              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#080d1a] px-3 py-2 text-xs text-zinc-400 outline-none"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                handleCopyLink(
                                  link
                                )
                              }
                              disabled={
                                copyingToken ===
                                link.token
                              }
                              className="shrink-0 rounded-xl bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
                            >
                              {copyingToken ===
                              link.token
                                ? "..."
                                : "Copy"}
                            </button>

                          </div>

                          {/* ACTION */}

                          <div className="mt-3">

                            {link.enabled ? (

                              <button
                                type="button"
                                onClick={() =>
                                  handleDisableLink(
                                    link
                                  )
                                }
                                disabled={
                                  disablingToken ===
                                  link.token
                                }
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 py-2.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                              >

                                {disablingToken ===
                                link.token ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Disabling...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4" />
                                    Disable Link
                                  </>
                                )}

                              </button>

                            ) : (

                              <button
                                type="button"
                                onClick={() =>
                                  handleEnableLink(
                                    link
                                  )
                                }
                                disabled={
                                  enablingToken ===
                                  link.token
                                }
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 py-2.5 text-xs font-medium text-green-400 transition hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                              >

                                {enablingToken ===
                                link.token ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Enabling...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Enable Link
                                  </>
                                )}

                              </button>

                            )}

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

              {/* DONE */}

              <button
                type="button"
                onClick={
                  closeShareModal
                }
                disabled={
                  sharing ||
                  disablingToken !==
                    null ||
                  enablingToken !==
                    null
                }
                className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/10 disabled:opacity-50"
              >
                Done
              </button>

            </div>

          </div>

        )}

      </main>
    </MainLayout>
  );
}