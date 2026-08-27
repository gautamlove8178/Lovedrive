const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const {
  uploadFile,
  getFiles,
  getSingleFile,
  serveFileContent,
  getStorage,
  getFavorites,
  getTrash,
  toggleFavorite,
  restoreFile,
  permanentDelete,
  deleteFile,

  // Registered user sharing
  shareFile,

  // Public sharing
  generateShareLink,
  getShareLinks,
  getAllShareLinks,
  getPublicSharedFile,
  servePublicSharedFile,
  disableShareLink,
  enableShareLink,

  // Registered shared files
  getSharedFiles,
  unshareFile,

  // Folder
  moveFile,
} = require("../controllers/fileController");

// =====================================================
// UPLOAD
// =====================================================

router.post(
  "/upload",
  auth,
  upload.single("file"),
  uploadFile
);

// =====================================================
// LIST
// =====================================================

router.get(
  "/list",
  auth,
  getFiles
);

// =====================================================
// STORAGE
// =====================================================

router.get(
  "/storage",
  auth,
  getStorage
);

// =====================================================
// FAVORITES
// =====================================================

router.get(
  "/favorites",
  auth,
  getFavorites
);

// =====================================================
// TRASH
// =====================================================

router.get(
  "/trash",
  auth,
  getTrash
);

// =====================================================
// REGISTERED USER SHARED FILES
// =====================================================

router.get(
  "/shared",
  auth,
  getSharedFiles
);

// =====================================================
// ALL PUBLIC SHARE LINKS
// =====================================================

router.get(
  "/share-links",
  auth,
  getAllShareLinks
);

// =====================================================
// PUBLIC SHARE
// IMPORTANT:
// Keep these BEFORE /:id
// =====================================================

// Get public file information
router.get(
  "/public/:token",
  getPublicSharedFile
);

// Serve public shared file
router.get(
  "/public/:token/content",
  servePublicSharedFile
);

// =====================================================
// GET SINGLE FILE
// IMPORTANT:
// KEEP THIS AFTER ALL FIXED GET ROUTES
// =====================================================

router.get(
  "/:id",
  auth,
  getSingleFile
);

// =====================================================
// PDF / FILE PREVIEW CONTENT
// =====================================================

router.get(
  "/:id/content",
  auth,
  serveFileContent
);

// =====================================================
// SHARE FILE WITH REGISTERED USER
// =====================================================

router.post(
  "/:id/share",
  auth,
  shareFile
);

// =====================================================
// GENERATE NEW PUBLIC SHARE LINK
// =====================================================

router.post(
  "/:id/share-link",
  auth,
  generateShareLink
);

// =====================================================
// GET ALL PUBLIC LINKS OF ONE FILE
// =====================================================

router.get(
  "/:id/share-links",
  auth,
  getShareLinks
);

// =====================================================
// DISABLE SPECIFIC PUBLIC LINK
// =====================================================

router.patch(
  "/:id/share-link/:token/disable",
  auth,
  disableShareLink
);

// =====================================================
// ENABLE SPECIFIC PUBLIC LINK
// =====================================================

router.patch(
  "/:id/share-link/:token/enable",
  auth,
  enableShareLink
);

// =====================================================
// MOVE FILE TO FOLDER
// =====================================================

router.patch(
  "/:id/move",
  auth,
  moveFile
);

// =====================================================
// FAVORITE / UNFAVORITE
// =====================================================

router.patch(
  "/:id/favorite",
  auth,
  toggleFavorite
);

// =====================================================
// RESTORE FROM TRASH
// =====================================================

router.patch(
  "/:id/restore",
  auth,
  restoreFile
);

// =====================================================
// PERMANENT DELETE
// =====================================================

router.delete(
  "/:id/permanent",
  auth,
  permanentDelete
);

// =====================================================
// UNSHARE REGISTERED USER
// =====================================================

router.delete(
  "/:id/share/:userId",
  auth,
  unshareFile
);

// =====================================================
// MOVE TO TRASH
// =====================================================

router.delete(
  "/:id",
  auth,
  deleteFile
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;