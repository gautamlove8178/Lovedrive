const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  createFolder,
  getFolders,
  renameFolder,
  deleteFolder,

  // 🗑️ Trash
  getTrashFolders,
  restoreFolder,
  permanentDeleteFolder,
} = require("../controllers/folderController");

// =====================================================
// FOLDER ROUTES
// =====================================================

// =====================================================
// CREATE FOLDER
// =====================================================

router.post(
  "/",
  auth,
  createFolder
);

// =====================================================
// GET ACTIVE FOLDERS
// =====================================================

// Root folders:
// GET /api/folders
//
// Inside a folder:
// GET /api/folders?parent=FOLDER_ID

router.get(
  "/",
  auth,
  getFolders
);

// =====================================================
// 🗑️ GET TRASHED FOLDERS
// =====================================================
//
// IMPORTANT:
// This route MUST come before /:id
// so "trash" is not treated as a folder ID.
//

router.get(
  "/trash",
  auth,
  getTrashFolders
);

// =====================================================
// RESTORE FOLDER FROM TRASH
// =====================================================

router.patch(
  "/:id/restore",
  auth,
  restoreFolder
);

// =====================================================
// PERMANENTLY DELETE FOLDER
// =====================================================

router.delete(
  "/:id/permanent",
  auth,
  permanentDeleteFolder
);

// =====================================================
// RENAME FOLDER
// =====================================================

router.patch(
  "/:id",
  auth,
  renameFolder
);

// =====================================================
// MOVE FOLDER TO TRASH
// =====================================================

router.delete(
  "/:id",
  auth,
  deleteFolder
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;