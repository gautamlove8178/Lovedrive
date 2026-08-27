const File = require("../models/File");
const cloudinary = require("../config/cloudinary");
const User = require("../models/user");
const Folder = require("../models/Folder");
const crypto = require("crypto");

// ===============================
// UPLOAD FILE
// ===============================
exports.uploadFile = async (req, res) => {
  console.log("🚀 uploadFile controller reached");

  try {
    console.log("AUTH USER:", req.user);
    console.log("FILE:", req.file);

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const file = await File.create({
      owner: req.user.id,
      name: req.file.originalname,
      url: req.file.path,
      publicId: req.file.filename,
      size: req.file.size,
      type: req.file.mimetype,
    });

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      file,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// GET FILES
// ===============================
exports.getFiles = async (req, res) => {
  console.log("📂 getFiles controller reached");

  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const files = await File.find({
      owner: userId,
      isTrashed: false,
    })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    console.log("📁 Files found:", files.length);

    return res.status(200).json({
      success: true,
      files,
    });
  } catch (err) {
    console.error("GET FILES ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// GET STORAGE
// ===============================
exports.getStorage = async (req, res) => {
  console.log("📊 getStorage controller reached");

  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const files = await File.find({
      owner: userId,
      isTrashed: false,
    }).select("size");

    const storageUsed = files.reduce(
      (total, file) =>
        total + (file.size || 0),
      0
    );

    const storageLimit =
      10 * 1024 * 1024 * 1024;

    const percentage =
      (storageUsed / storageLimit) * 100;

    const sharedFileCount =
      await File.countDocuments({
        "sharedWith.user": userId,
        isTrashed: false,
      });

    return res.status(200).json({
      success: true,
      storage: {
        storageUsed,
        storageLimit,
        percentage: Number(
          percentage.toFixed(2)
        ),
        fileCount: files.length,
        sharedFileCount,
      },
    });
  } catch (err) {
    console.error(
      "GET STORAGE ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// TOGGLE FAVORITE
// ===============================
exports.toggleFavorite = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const file = await File.findOne({
      _id: id,
      owner: userId,
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    file.isFavorite =
      !file.isFavorite;

    await file.save();

    return res.status(200).json({
      success: true,
      message: file.isFavorite
        ? "File added to favorites"
        : "File removed from favorites",
      isFavorite:
        file.isFavorite,
      file,
    });
  } catch (err) {
    console.error(
      "TOGGLE FAVORITE ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// GET FAVORITES
// ===============================
exports.getFavorites = async (
  req,
  res
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const files = await File.find({
      owner: userId,
      isFavorite: true,
      isTrashed: false,
    }).sort({
      updatedAt: -1,
    });

    return res.status(200).json({
      success: true,
      files,
    });
  } catch (err) {
    console.error(
      "GET FAVORITES ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// MOVE FILE TO TRASH
// ===============================
exports.deleteFile = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const file = await File.findOne({
      _id: id,
      owner: userId,
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    file.isTrashed = true;

    await file.save();

    return res.status(200).json({
      success: true,
      message: "File moved to Trash",
      file,
    });
  } catch (err) {
    console.error(
      "MOVE TO TRASH ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// GET TRASH
// ===============================
exports.getTrash = async (
  req,
  res
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const files = await File.find({
      owner: userId,
      isTrashed: true,
    }).sort({
      updatedAt: -1,
    });

    return res.status(200).json({
      success: true,
      files,
    });
  } catch (err) {
    console.error(
      "GET TRASH ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// RESTORE FILE
// ===============================
exports.restoreFile = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const file = await File.findOne({
      _id: id,
      owner: userId,
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    file.isTrashed = false;

    await file.save();

    return res.status(200).json({
      success: true,
      message:
        "File restored successfully",
      file,
    });
  } catch (err) {
    console.error(
      "RESTORE ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// PERMANENT DELETE
// ===============================
exports.permanentDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const file = await File.findOne({
      _id: id,
      owner: userId,
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // ==========================================
    // DETERMINE CLOUDINARY RESOURCE TYPE
    // ==========================================

    let resourceType = "image";

    if (file.type?.startsWith("video/")) {
      resourceType = "video";
    } else if (
      file.type?.startsWith("audio/") ||
      file.type?.includes("pdf") ||
      file.type?.includes("zip") ||
      file.type?.includes("rar") ||
      file.type?.startsWith("application/")
    ) {
      resourceType = "raw";
    }

    console.log("🗑️ Deleting Cloudinary file:", {
      publicId: file.publicId,
      resourceType,
      name: file.name,
    });

    // ==========================================
    // DELETE FROM CLOUDINARY FIRST
    // ==========================================

    const cloudResult =
      await cloudinary.uploader.destroy(
        file.publicId,
        {
          resource_type: resourceType,
          invalidate: true,
        }
      );

    console.log(
      "☁️ Cloudinary delete result:",
      cloudResult
    );

    // ==========================================
    // CLOUDINARY FAILURE
    // ==========================================

    if (
      cloudResult.result !== "ok" &&
      cloudResult.result !== "not found"
    ) {
      return res.status(500).json({
        success: false,
        message:
          "Cloud storage deletion failed. Database record was not deleted.",
        cloudResult,
      });
    }

    // ==========================================
    // DELETE FROM MONGODB
    // ==========================================

    await File.deleteOne({
      _id: id,
      owner: userId,
    });

    return res.status(200).json({
      success: true,
      message:
        "File permanently deleted from cloud and database",
    });

  } catch (err) {
    console.error(
      "PERMANENT DELETE ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "Failed to permanently delete file",
    });
  }
};

// ===============================
// SHARE FILE WITH REGISTERED USER
// ===============================
exports.shareFile = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const {
      email,
      permission,
    } = req.body;

    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email:
        email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const file = await File.findOne({
      _id: id,
      owner: ownerId,
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message:
          "File not found or you are not the owner",
      });
    }

    if (
      file.owner.toString() ===
      user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot share a file with yourself",
      });
    }

    const existingShare =
      file.sharedWith.find(
        (item) =>
          item.user.toString() ===
          user._id.toString()
      );

    const selectedPermission =
      permission === "download"
        ? "download"
        : "view";

    if (existingShare) {
      existingShare.permission =
        selectedPermission;
    } else {
      file.sharedWith.push({
        user: user._id,
        permission:
          selectedPermission,
      });
    }

    await file.save();

    return res.status(200).json({
      success: true,
      message:
        "File shared successfully",
      file,
    });
  } catch (err) {
    console.error(
      "SHARE FILE ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================================================
// GENERATE PUBLIC SHARE LINK
// =====================================================
exports.generateShareLink = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { permission } =
      req.body;

    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const file = await File.findOne({
      _id: id,
      owner: ownerId,
      isTrashed: false,
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message:
          "File not found or you are not the owner",
      });
    }

    const selectedPermission =
      permission === "download"
        ? "download"
        : "view";

    // ==========================================
    // SECURE RANDOM TOKEN
    // ==========================================

    const token = crypto
      .randomBytes(24)
      .toString("hex");

    // ==========================================
    // CREATE NEW LINK
    // ==========================================

    file.shareLinks.push({
      token,
      permission:
        selectedPermission,
      enabled: true,
      createdAt: new Date(),
    });

    await file.save();

    const baseUrl =
      process.env.CLIENT_URL ||
      "http://localhost:3000";

    const shareUrl =
      `${baseUrl}/share/${token}`;

    const linkCount =
      file.shareLinks.length;

    console.log(
      "🔗 Public share link generated:",
      {
        file: file.name,
        permission:
          selectedPermission,
        linkCount,
        shareUrl,
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Share link generated successfully",
      shareUrl,
      token,
      permission:
        selectedPermission,
      linkCount,
      shareLinks:
        file.shareLinks,
    });
  } catch (err) {
    console.error(
      "GENERATE SHARE LINK ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================================================
// GET ALL PUBLIC SHARE LINKS
// =====================================================
exports.getShareLinks = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const ownerId =
      req.user?.id;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const file =
      await File.findOne({
        _id: id,
        owner: ownerId,
        isTrashed: false,
      }).select(
        "name shareLinks"
      );

    if (!file) {
      return res.status(404).json({
        success: false,
        message:
          "File not found",
      });
    }

    const baseUrl =
      process.env.CLIENT_URL ||
      "http://localhost:3000";

    const links =
      file.shareLinks.map(
        (link, index) => ({
          id: link._id,
          number: index + 1,
          token: link.token,
          shareUrl:
            `${baseUrl}/share/${link.token}`,
          permission:
            link.permission,
          enabled:
            link.enabled,
          createdAt:
            link.createdAt,
        })
      );

    return res.status(200).json({
      success: true,
      fileName: file.name,
      linkCount: links.length,
      links,
    });
  } catch (err) {
    console.error(
      "GET SHARE LINKS ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================================================
// GET ALL PUBLIC SHARE LINKS OF CURRENT USER
// =====================================================

exports.getAllShareLinks = async (
  req,
  res
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const files = await File.find({
      owner: userId,
      isTrashed: false,
      "shareLinks.0": {
        $exists: true,
      },
    }).select(
      "name shareLinks"
    );

    const baseUrl =
      process.env.CLIENT_URL ||
      "http://localhost:3000";

    const links = [];

    files.forEach((file) => {
      file.shareLinks.forEach((link) => {
        links.push({
          id: link._id,
          fileId: file._id,
          fileName: file.name,
          token: link.token,

          shareUrl:
            `${baseUrl}/share/${link.token}`,

          permission:
            link.permission,

          enabled:
            link.enabled,

          createdAt:
            link.createdAt,
        });
      });
    });

    // Newest links first
    links.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    const totalLinks =
      links.length;

    const activeLinks =
      links.filter(
        (link) =>
          link.enabled === true
      ).length;

    const disabledLinks =
      links.filter(
        (link) =>
          link.enabled === false
      ).length;

    return res.status(200).json({
      success: true,

      stats: {
        totalLinks,
        activeLinks,
        disabledLinks,
      },

      links,
    });
  } catch (err) {
    console.error(
      "GET ALL SHARE LINKS ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================================================
// DISABLE ONE PUBLIC SHARE LINK
// =====================================================
exports.disableShareLink = async (
  req,
  res
) => {
  try {
    const {
      id,
      token,
    } = req.params;

    const ownerId =
      req.user?.id;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const file =
      await File.findOne({
        _id: id,
        owner: ownerId,
        isTrashed: false,
      });

    if (!file) {
      return res.status(404).json({
        success: false,
        message:
          "File not found",
      });
    }

    const link =
      file.shareLinks.find(
        (item) =>
          item.token === token
      );

    if (!link) {
      return res.status(404).json({
        success: false,
        message:
          "Share link not found",
      });
    }

    link.enabled = false;

    await file.save();

    return res.status(200).json({
      success: true,
      message:
        "Public share link disabled",
      token,
    });
  } catch (err) {
    console.error(
      "DISABLE SHARE LINK ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================================================
// ENABLE ONE PUBLIC SHARE LINK
// =====================================================
exports.enableShareLink = async (
  req,
  res
) => {
  try {
    const {
      id,
      token,
    } = req.params;

    const ownerId =
      req.user?.id;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const file =
      await File.findOne({
        _id: id,
        owner: ownerId,
        isTrashed: false,
      });

    if (!file) {
      return res.status(404).json({
        success: false,
        message:
          "File not found",
      });
    }

    const link =
      file.shareLinks.find(
        (item) =>
          item.token === token
      );

    if (!link) {
      return res.status(404).json({
        success: false,
        message:
          "Share link not found",
      });
    }

    link.enabled = true;

    await file.save();

    return res.status(200).json({
      success: true,
      message:
        "Public share link enabled",
      token,
    });
  } catch (err) {
    console.error(
      "ENABLE SHARE LINK ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================================================
// GET PUBLIC SHARED FILE
// =====================================================
exports.getPublicSharedFile =
  async (req, res) => {
    try {
      const { token } =
        req.params;

      if (!token) {
        return res.status(400).json({
          success: false,
          message:
            "Share token is required",
        });
      }

      const file =
        await File.findOne({
          shareLinks: {
            $elemMatch: {
              token,
              enabled: true,
            },
          },
          isTrashed: false,
        }).select(
          "name url size type createdAt shareLinks"
        );

      if (!file) {
        return res.status(404).json({
          success: false,
          message:
            "This share link is invalid or disabled",
        });
      }

      const link =
        file.shareLinks.find(
          (item) =>
            item.token === token &&
            item.enabled === true
        );

      if (!link) {
        return res.status(404).json({
          success: false,
          message:
            "This share link is invalid or disabled",
        });
      }

      return res.status(200).json({
        success: true,
        file: {
          id: file._id,
          name: file.name,
          size: file.size,
          type: file.type,
          createdAt:
            file.createdAt,
          permission:
            link.permission,
        },
      });
    } catch (err) {
      console.error(
        "GET PUBLIC SHARED FILE ERROR:",
        err
      );

      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };

// =====================================================
// SERVE PUBLIC SHARED FILE
// =====================================================
exports.servePublicSharedFile =
  async (req, res) => {
    try {
      const { token } =
        req.params;

      const { download } =
        req.query;

      if (!token) {
        return res.status(400).json({
          success: false,
          message:
            "Share token is required",
        });
      }

      const file =
        await File.findOne({
          shareLinks: {
            $elemMatch: {
              token,
              enabled: true,
            },
          },
          isTrashed: false,
        });

      if (!file) {
        return res.status(404).json({
          success: false,
          message:
            "This share link is invalid or disabled",
        });
      }

      const link =
        file.shareLinks.find(
          (item) =>
            item.token === token &&
            item.enabled === true
        );

      if (!link) {
        return res.status(404).json({
          success: false,
          message:
            "This share link is invalid or disabled",
        });
      }

      const permission =
        link.permission;

      // ==========================================
      // VIEW-ONLY PROTECTION
      // ==========================================

      if (
        download === "1" &&
        permission !== "download"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Download is not allowed for this share link",
        });
      }

      // ==========================================
      // GET FILE FROM CLOUDINARY
      // ==========================================

      const response =
        await fetch(file.url);

      if (!response.ok) {
        console.error(
          "CLOUDINARY FETCH ERROR:",
          response.status
        );

        return res.status(502).json({
          success: false,
          message:
            "Unable to retrieve the shared file",
        });
      }

      const contentType =
        response.headers.get(
          "content-type"
        ) ||
        file.type ||
        "application/octet-stream";

      const contentLength =
        response.headers.get(
          "content-length"
        );

      // ==========================================
      // RESPONSE HEADERS
      // ==========================================

      res.setHeader(
        "Content-Type",
        contentType
      );

      if (contentLength) {
        res.setHeader(
          "Content-Length",
          contentLength
        );
      }

      if (download === "1") {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${encodeURIComponent(
            file.name
          )}"`
        );
      } else {
        res.setHeader(
          "Content-Disposition",
          `inline; filename="${encodeURIComponent(
            file.name
          )}"`
        );
      }

      res.setHeader(
        "Cache-Control",
        "private, no-store"
      );

      res.setHeader(
        "X-Content-Type-Options",
        "nosniff"
      );

      // ==========================================
      // SEND FILE
      // ==========================================

      const buffer =
        Buffer.from(
          await response.arrayBuffer()
        );

      return res.send(buffer);
    } catch (err) {
      console.error(
        "SERVE PUBLIC FILE ERROR:",
        err
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to serve shared file",
      });
    }
  };

// ===============================
// GET SHARED FILES
// ===============================
exports.getSharedFiles = async (
  req,
  res
) => {
  try {
    const userId =
      req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const files =
      await File.find({
        "sharedWith.user":
          userId,
        isTrashed: false,
      })
        .populate(
          "owner",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    const sharedFiles =
      files.map((file) => {
        const share =
          file.sharedWith.find(
            (item) =>
              item.user
                .toString() ===
              userId.toString()
          );

        return {
          ...file.toObject(),
          permission:
            share?.permission ||
            "view",
        };
      });

    return res.status(200).json({
      success: true,
      files: sharedFiles,
    });
  } catch (err) {
    console.error(
      "GET SHARED FILES ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// UNSHARE FILE
// ===============================
exports.unshareFile = async (
  req,
  res
) => {
  try {
    const {
      id,
      userId,
    } = req.params;

    const ownerId =
      req.user?.id;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const file =
      await File.findOne({
        _id: id,
        owner: ownerId,
      });

    if (!file) {
      return res.status(404).json({
        success: false,
        message:
          "File not found or you are not the owner",
      });
    }

    const originalLength =
      file.sharedWith.length;

    file.sharedWith =
      file.sharedWith.filter(
        (item) =>
          item.user.toString() !==
          userId
      );

    if (
      file.sharedWith.length ===
      originalLength
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Share not found",
      });
    }

    await file.save();

    return res.status(200).json({
      success: true,
      message:
        "File unshared successfully",
    });
  } catch (err) {
    console.error(
      "UNSHARE FILE ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================================================
// MOVE FILE TO FOLDER
// =====================================================

exports.moveFile = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { folderId = null } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find user's file
    const file = await File.findOne({
      _id: id,
      owner: userId,
      isTrashed: false,
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // ==========================================
    // MOVE BACK TO MY FILES / ROOT
    // ==========================================

    if (
      folderId === null ||
      folderId === "" ||
      folderId === undefined
    ) {
      file.folder = null;

      await file.save();

      return res.status(200).json({
        success: true,
        message: "File moved to My Files",
        file,
      });
    }

    // ==========================================
    // CHECK DESTINATION FOLDER
    // ==========================================

    const folder = await Folder.findOne({
      _id: folderId,
      owner: userId,
      isTrashed: false,
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Destination folder not found",
      });
    }

    // ==========================================
    // MOVE FILE
    // ==========================================

    file.folder = folder._id;

    await file.save();

    return res.status(200).json({
      success: true,
      message: `File moved to "${folder.name}"`,
      file,
    });
  } catch (err) {
    console.error(
      "MOVE FILE ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================================================
// GET SINGLE FILE FOR PREVIEW
// =====================================================

exports.getSingleFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const file = await File.findOne({
      _id: id,
      owner: userId,
      isTrashed: false,
    }).select(
      "name url size type createdAt"
    );

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    return res.status(200).json({
      success: true,
      file,
    });

  } catch (err) {
    console.error(
      "GET SINGLE FILE ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load file",
    });
  }
};

// =====================================================
// SERVE PRIVATE FILE FOR PREVIEW
// =====================================================

exports.serveFileContent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    console.log("📄 serveFileContent:", id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // ==========================================
    // FIND FILE
    // ==========================================

    const file = await File.findOne({
      _id: id,
      owner: userId,
      isTrashed: false,
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // ==========================================
    // ONLY PDF PREVIEW
    // ==========================================

    if (file.type !== "application/pdf") {
      return res.status(400).json({
        success: false,
        message: "Preview is available only for PDF files",
      });
    }

    if (!file.url) {
      return res.status(404).json({
        success: false,
        message: "File URL not found",
      });
    }

    console.log("☁️ Fetching PDF from Cloudinary:", file.url);

    // ==========================================
    // FETCH FROM CLOUDINARY
    // ==========================================

    const response = await fetch(file.url);

    if (!response.ok) {
      console.error(
        "❌ CLOUDINARY PDF FETCH ERROR:",
        response.status,
        response.statusText
      );

      return res.status(502).json({
        success: false,
        message: "Unable to retrieve PDF from cloud storage",
      });
    }

    // ==========================================
    // GET PDF BUFFER
    // ==========================================

    const arrayBuffer = await response.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    // ==========================================
    // SEND PDF INLINE
    // ==========================================

    res.status(200);

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Length",
      buffer.length
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(file.name)}"`
    );

    res.setHeader(
      "Cache-Control",
      "private, no-store, max-age=0"
    );

    res.setHeader(
      "X-Content-Type-Options",
      "nosniff"
    );

    return res.send(buffer);

  } catch (err) {
    console.error(
      "❌ SERVE FILE CONTENT ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "Unable to preview file",
    });
  }
};
