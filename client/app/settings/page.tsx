"use client";

import {
  User,
  Mail,
  HardDrive,
  Lock,
  LogOut,
  Settings as SettingsIcon,
  ShieldCheck,
  Save,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Camera,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import MainLayout from "@/components/layout/MainLayout";
import api from "@/lib/axios";

// =====================================================
// TYPES
// =====================================================

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  storageUsed?: number;
  storageLimit?: number;
  createdAt?: string;
}

interface StorageData {
  storageUsed: number;
  storageLimit: number;
  percentage: number;
  fileCount: number;
  sharedFileCount: number;
}

// =====================================================
// PAGE
// =====================================================

export default function SettingsPage() {
  // =====================================================
  // USER
  // =====================================================

  const [user, setUser] =
    useState<UserData | null>(null);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [savingProfile, setSavingProfile] =
    useState(false);

  // =====================================================
  // AVATAR
  // =====================================================

  const [uploadingAvatar, setUploadingAvatar] =
    useState(false);

  const [removingAvatar, setRemovingAvatar] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  // =====================================================
  // STORAGE
  // =====================================================

  const [storage, setStorage] =
    useState<StorageData | null>(null);

  const [loadingStorage, setLoadingStorage] =
    useState(true);

  // =====================================================
  // PASSWORD
  // =====================================================

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // =====================================================
  // MESSAGE
  // =====================================================

  const [message, setMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  // =====================================================
  // FETCH USER
  // =====================================================

  const fetchUser = async () => {
    try {
      setLoadingUser(true);

      const res = await api.get(
        "/auth/me"
      );

      if (res.data.success) {
        const currentUser =
          res.data.user;

        setUser(currentUser);

        setName(
          currentUser.name || ""
        );

        setEmail(
          currentUser.email || ""
        );
      }
    } catch (error: any) {
      console.error(
        "FETCH USER ERROR:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to load account information"
      );
    } finally {
      setLoadingUser(false);
    }
  };

  // =====================================================
  // FETCH STORAGE
  // =====================================================

  const fetchStorage = async () => {
    try {
      setLoadingStorage(true);

      const res = await api.get(
        "/files/storage"
      );

      if (res.data.success) {
        setStorage(
          res.data.storage
        );
      }
    } catch (error: any) {
      console.error(
        "FETCH STORAGE ERROR:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to load storage information"
      );
    } finally {
      setLoadingStorage(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchUser();
    fetchStorage();

    const handleUserRefresh = () => {
      fetchUser();
    };

    const handleFilesRefresh = () => {
      fetchStorage();
    };

    window.addEventListener(
      "user-updated",
      handleUserRefresh
    );

    window.addEventListener(
      "files-updated",
      handleFilesRefresh
    );

    return () => {
      window.removeEventListener(
        "user-updated",
        handleUserRefresh
      );

      window.removeEventListener(
        "files-updated",
        handleFilesRefresh
      );
    };
  }, []);

  // =====================================================
  // FORMAT STORAGE
  // =====================================================

  const formatStorage = (
    bytes: number
  ) => {
    if (!bytes || bytes <= 0) {
      return "0 B";
    }

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

  const percentage =
    Math.min(
      storage?.percentage ?? 0,
      100
    );

  // =====================================================
  // GET INITIALS
  // =====================================================

  const getInitials = (
    value?: string
  ) => {
    if (!value?.trim()) {
      return "U";
    }

    const parts =
      value.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleUpdateProfile =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      setMessage("");
      setErrorMessage("");

      if (!name.trim()) {
        setErrorMessage(
          "Name is required"
        );
        return;
      }

      if (!email.trim()) {
        setErrorMessage(
          "Email is required"
        );
        return;
      }

      try {
        setSavingProfile(true);

        const res =
          await api.patch(
            "/auth/profile",
            {
              name:
                name.trim(),

              email:
                email
                  .trim()
                  .toLowerCase(),
            }
          );

        if (res.data.success) {
          const updatedUser =
            res.data.user;

          setUser(updatedUser);

          setName(
            updatedUser.name
          );

          setEmail(
            updatedUser.email
          );

          setMessage(
            "Profile updated successfully ✅"
          );

          window.dispatchEvent(
            new Event(
              "user-updated"
            )
          );
        }
      } catch (error: any) {
        console.error(
          "UPDATE PROFILE ERROR:",
          error
        );

        setErrorMessage(
          error.response?.data
            ?.message ||
            "Failed to update profile"
        );
      } finally {
        setSavingProfile(false);
      }
    };

  // =====================================================
  // OPEN AVATAR PICKER
  // =====================================================

  const handleChooseAvatar =
    () => {
      if (
        uploadingAvatar ||
        removingAvatar
      ) {
        return;
      }

      fileInputRef.current?.click();
    };

  // =====================================================
  // UPLOAD AVATAR
  // =====================================================

  const handleAvatarChange =
    async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        e.target.files?.[0];

      // Reset input so same file can
      // be selected again later.
      e.target.value = "";

      if (!file) {
        return;
      }

      setMessage("");
      setErrorMessage("");

      // -----------------------------------------------
      // FILE TYPE
      // -----------------------------------------------

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        setErrorMessage(
          "Please select an image file."
        );

        return;
      }

      // -----------------------------------------------
      // FILE SIZE
      // -----------------------------------------------

      const maxSize =
        5 * 1024 * 1024;

      if (file.size > maxSize) {
        setErrorMessage(
          "Profile picture must be smaller than 5 MB."
        );

        return;
      }

      try {
        setUploadingAvatar(true);

        const formData =
          new FormData();

        formData.append(
          "avatar",
          file
        );

        const res =
          await api.patch(
            "/auth/avatar",
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        if (res.data.success) {
          const updatedUser =
            res.data.user;

          setUser(updatedUser);

          setMessage(
            "Profile picture updated successfully ✅"
          );

          // Refresh Navbar + Sidebar
          window.dispatchEvent(
            new Event(
              "user-updated"
            )
          );
        }
      } catch (error: any) {
        console.error(
          "UPLOAD AVATAR ERROR:",
          error
        );

        setErrorMessage(
          error.response?.data
            ?.message ||
            "Failed to upload profile picture"
        );
      } finally {
        setUploadingAvatar(false);
      }
    };

  // =====================================================
  // REMOVE AVATAR
  // =====================================================

  const handleRemoveAvatar =
    async () => {
      if (
        !user?.avatar ||
        uploadingAvatar ||
        removingAvatar
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to remove your profile picture?"
        );

      if (!confirmed) {
        return;
      }

      setMessage("");
      setErrorMessage("");

      try {
        setRemovingAvatar(true);

        const res =
          await api.delete(
            "/auth/avatar"
          );

        if (res.data.success) {
          const updatedUser =
            res.data.user;

          setUser(updatedUser);

          setMessage(
            "Profile picture removed successfully ✅"
          );

          // Refresh Navbar + Sidebar
          window.dispatchEvent(
            new Event(
              "user-updated"
            )
          );
        }
      } catch (error: any) {
        console.error(
          "REMOVE AVATAR ERROR:",
          error
        );

        setErrorMessage(
          error.response?.data
            ?.message ||
            "Failed to remove profile picture"
        );
      } finally {
        setRemovingAvatar(false);
      }
    };

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handleChangePassword =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      setMessage("");
      setErrorMessage("");

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        setErrorMessage(
          "Please fill all password fields"
        );

        return;
      }

      if (
        newPassword.length < 6
      ) {
        setErrorMessage(
          "New password must be at least 6 characters"
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setErrorMessage(
          "New passwords do not match"
        );

        return;
      }

      if (
        currentPassword ===
        newPassword
      ) {
        setErrorMessage(
          "New password must be different from current password"
        );

        return;
      }

      try {
        setChangingPassword(
          true
        );

        const res =
          await api.patch(
            "/auth/change-password",
            {
              currentPassword,
              newPassword,
              confirmPassword,
            }
          );

        if (res.data.success) {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");

          setMessage(
            "Password changed successfully ✅"
          );
        }
      } catch (error: any) {
        console.error(
          "CHANGE PASSWORD ERROR:",
          error
        );

        setErrorMessage(
          error.response?.data
            ?.message ||
            "Failed to change password"
        );
      } finally {
        setChangingPassword(
          false
        );
      }
    };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to logout?"
      );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      "token"
    );

    window.location.href = "/";
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <MainLayout>
      <main className="min-h-screen bg-[#080d1a] px-4 py-8 text-white md:px-8">

        <div className="mx-auto max-w-5xl">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10">

              <SettingsIcon className="h-7 w-7 text-blue-400" />

            </div>

            <div>

              <h1 className="text-3xl font-bold">
                Settings
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Manage your LoveDrive account and preferences.
              </p>

            </div>

          </div>

          {/* =================================================
              MESSAGES
          ================================================= */}

          {message && (
            <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              {message}
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {errorMessage}
            </div>
          )}

          {/* =================================================
              PROFILE
          ================================================= */}

          <section className="mt-8 rounded-3xl border border-white/5 bg-[#10192E] p-6">

            <div className="flex items-center gap-3">

              <User className="h-5 w-5 text-blue-400" />

              <div>

                <h2 className="text-lg font-semibold">
                  Profile
                </h2>

                <p className="text-sm text-zinc-500">
                  Update your account information.
                </p>

              </div>

            </div>

            {loadingUser ? (

              <div className="mt-8 flex items-center justify-center py-8">

                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />

              </div>

            ) : (

              <>
                {/* =================================================
                    PROFILE PICTURE
                ================================================= */}

                <div className="mt-7 rounded-3xl border border-white/5 bg-white/[0.03] p-5">

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                    {/* AVATAR */}

                    <div className="relative shrink-0">

                      <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-blue-500/20 bg-blue-600 text-3xl font-bold text-white shadow-xl shadow-blue-900/20">

                        {user?.avatar ? (

                          <img
                            src={user.avatar}
                            alt={
                              user.name ||
                              "Profile"
                            }
                            className="h-full w-full object-cover"
                          />

                        ) : (

                          <span>
                            {getInitials(
                              user?.name
                            )}
                          </span>

                        )}

                      </div>

                      {uploadingAvatar && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/70">

                          <Loader2 className="h-7 w-7 animate-spin text-white" />

                        </div>
                      )}

                    </div>

                    {/* NAME + BUTTONS */}

                    <div className="min-w-0 flex-1">

                      <h3 className="text-lg font-semibold text-white">
                        {user?.name ||
                          "User"}
                      </h3>

                      <p className="mt-1 truncate text-sm text-zinc-500">
                        {user?.email ||
                          ""}
                      </p>

                      <p className="mt-2 text-xs text-zinc-600">
                        JPG, PNG, WEBP • Maximum 5 MB
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3">

                        <input
                          ref={
                            fileInputRef
                          }
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={
                            handleAvatarChange
                          }
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={
                            handleChooseAvatar
                          }
                          disabled={
                            uploadingAvatar ||
                            removingAvatar
                          }
                          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          {uploadingAvatar ? (

                            <Loader2 className="h-4 w-4 animate-spin" />

                          ) : (

                            <Camera className="h-4 w-4" />

                          )}

                          {uploadingAvatar
                            ? "Uploading..."
                            : user?.avatar
                            ? "Change Photo"
                            : "Upload Photo"}

                        </button>

                        {user?.avatar && (

                          <button
                            type="button"
                            onClick={
                              handleRemoveAvatar
                            }
                            disabled={
                              uploadingAvatar ||
                              removingAvatar
                            }
                            className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            {removingAvatar ? (

                              <Loader2 className="h-4 w-4 animate-spin" />

                            ) : (

                              <Trash2 className="h-4 w-4" />

                            )}

                            {removingAvatar
                              ? "Removing..."
                              : "Remove Photo"}

                          </button>

                        )}

                      </div>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    PROFILE FORM
                ================================================= */}

                <form
                  onSubmit={
                    handleUpdateProfile
                  }
                  className="mt-6"
                >

                  <div className="grid gap-5 md:grid-cols-2">

                    {/* NAME */}

                    <div>

                      <label className="mb-2 block text-sm text-zinc-400">
                        Full Name
                      </label>

                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4">

                        <User className="h-5 w-5 shrink-0 text-zinc-500" />

                        <input
                          type="text"
                          value={name}
                          onChange={(e) =>
                            setName(
                              e.target.value
                            )
                          }
                          className="w-full bg-transparent py-3 text-white outline-none placeholder:text-zinc-600"
                          placeholder="Enter your name"
                        />

                      </div>

                    </div>

                    {/* EMAIL */}

                    <div>

                      <label className="mb-2 block text-sm text-zinc-400">
                        Email Address
                      </label>

                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4">

                        <Mail className="h-5 w-5 shrink-0 text-zinc-500" />

                        <input
                          type="email"
                          value={email}
                          onChange={(e) =>
                            setEmail(
                              e.target.value
                            )
                          }
                          className="w-full bg-transparent py-3 text-white outline-none placeholder:text-zinc-600"
                          placeholder="Enter your email"
                        />

                      </div>

                    </div>

                  </div>

                  <div className="mt-5 flex justify-end">

                    <button
                      type="submit"
                      disabled={
                        savingProfile
                      }
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      {savingProfile ? (

                        <Loader2 className="h-4 w-4 animate-spin" />

                      ) : (

                        <Save className="h-4 w-4" />

                      )}

                      {savingProfile
                        ? "Saving..."
                        : "Save Changes"}

                    </button>

                  </div>

                </form>

              </>

            )}

          </section>

          {/* =================================================
              STORAGE
          ================================================= */}

          <section className="mt-6 rounded-3xl border border-white/5 bg-[#10192E] p-6">

            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-3">

                <HardDrive className="h-5 w-5 text-purple-400" />

                <div>

                  <h2 className="text-lg font-semibold">
                    Storage
                  </h2>

                  <p className="text-sm text-zinc-500">
                    Monitor your LoveDrive storage.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  fetchStorage
                }
                disabled={
                  loadingStorage
                }
                className="rounded-xl bg-white/5 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                title="Refresh storage"
              >

                <RefreshCw
                  className={`h-4 w-4 ${
                    loadingStorage
                      ? "animate-spin"
                      : ""
                  }`}
                />

              </button>

            </div>

            <div className="mt-6">

              {loadingStorage ? (

                <div className="flex items-center gap-2 py-4 text-sm text-zinc-500">

                  <Loader2 className="h-4 w-4 animate-spin" />

                  Loading storage...

                </div>

              ) : (

                <>

                  <div className="grid gap-4 sm:grid-cols-3">

                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">

                      <p className="text-xs text-zinc-500">
                        Used
                      </p>

                      <p className="mt-1 text-lg font-bold">
                        {formatStorage(
                          storage?.storageUsed ||
                            0
                        )}
                      </p>

                    </div>

                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">

                      <p className="text-xs text-zinc-500">
                        Limit
                      </p>

                      <p className="mt-1 text-lg font-bold">
                        {formatStorage(
                          storage?.storageLimit ||
                            0
                        )}
                      </p>

                    </div>

                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">

                      <p className="text-xs text-zinc-500">
                        Files
                      </p>

                      <p className="mt-1 text-lg font-bold">
                        {storage?.fileCount ||
                          0}
                      </p>

                    </div>

                  </div>

                  <div className="mt-6">

                    <div className="flex items-center justify-between">

                      <span className="text-sm text-zinc-400">
                        Storage used
                      </span>

                      <span className="text-sm font-medium text-blue-400">
                        {percentage.toFixed(
                          2
                        )}
                        %
                      </span>

                    </div>

                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/5">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                    <p className="mt-2 text-xs text-zinc-600">

                      {formatStorage(
                        storage?.storageUsed ||
                          0
                      )}{" "}
                      of{" "}
                      {formatStorage(
                        storage?.storageLimit ||
                          0
                      )}{" "}
                      used.

                    </p>

                  </div>

                </>

              )}

            </div>

          </section>

          {/* =================================================
              SECURITY
          ================================================= */}

          <section className="mt-6 rounded-3xl border border-white/5 bg-[#10192E] p-6">

            <div className="flex items-center gap-3">

              <ShieldCheck className="h-5 w-5 text-green-400" />

              <div>

                <h2 className="text-lg font-semibold">
                  Security
                </h2>

                <p className="text-sm text-zinc-500">
                  Manage your account password.
                </p>

              </div>

            </div>

            <form
              onSubmit={
                handleChangePassword
              }
              className="mt-6 space-y-5"
            >

              {/* CURRENT PASSWORD */}

              <div>

                <label className="mb-2 block text-sm text-zinc-400">
                  Current Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4">

                  <Lock className="h-5 w-5 shrink-0 text-zinc-500" />

                  <input
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      currentPassword
                    }
                    onChange={(e) =>
                      setCurrentPassword(
                        e.target.value
                      )
                    }
                    className="w-full bg-transparent py-3 text-white outline-none"
                    placeholder="Enter current password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        !showCurrentPassword
                      )
                    }
                    className="text-zinc-500 transition hover:text-white"
                  >

                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}

                  </button>

                </div>

              </div>

              {/* NEW PASSWORD */}

              <div>

                <label className="mb-2 block text-sm text-zinc-400">
                  New Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4">

                  <Lock className="h-5 w-5 shrink-0 text-zinc-500" />

                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      newPassword
                    }
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                    className="w-full bg-transparent py-3 text-white outline-none"
                    placeholder="Minimum 6 characters"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        !showNewPassword
                      )
                    }
                    className="text-zinc-500 transition hover:text-white"
                  >

                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}

                  </button>

                </div>

              </div>

              {/* CONFIRM PASSWORD */}

              <div>

                <label className="mb-2 block text-sm text-zinc-400">
                  Confirm New Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4">

                  <Lock className="h-5 w-5 shrink-0 text-zinc-500" />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      confirmPassword
                    }
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    className="w-full bg-transparent py-3 text-white outline-none"
                    placeholder="Repeat new password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="text-zinc-500 transition hover:text-white"
                  >

                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}

                  </button>

                </div>

              </div>

              <div className="flex justify-end">

                <button
                  type="submit"
                  disabled={
                    changingPassword
                  }
                  className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {changingPassword ? (

                    <Loader2 className="h-4 w-4 animate-spin" />

                  ) : (

                    <ShieldCheck className="h-4 w-4" />

                  )}

                  {changingPassword
                    ? "Changing..."
                    : "Change Password"}

                </button>

              </div>

            </form>

          </section>

          {/* =================================================
              ACCOUNT
          ================================================= */}

          <section className="mt-6 rounded-3xl border border-red-500/10 bg-[#10192E] p-6">

            <div className="flex items-center gap-3">

              <LogOut className="h-5 w-5 text-red-400" />

              <div>

                <h2 className="text-lg font-semibold">
                  Account
                </h2>

                <p className="text-sm text-zinc-500">
                  Account actions
                </p>

              </div>

            </div>

            <div className="mt-6">

              <button
                type="button"
                onClick={
                  handleLogout
                }
                className="flex w-full items-center gap-4 rounded-2xl border border-red-500/10 bg-red-500/5 p-4 text-left transition hover:bg-red-500/10"
              >

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">

                  <LogOut className="h-5 w-5 text-red-400" />

                </div>

                <div>

                  <p className="font-medium text-red-400">
                    Logout
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    Sign out of your LoveDrive account.
                  </p>

                </div>

              </button>

            </div>

          </section>

        </div>

      </main>
    </MainLayout>
  );
}