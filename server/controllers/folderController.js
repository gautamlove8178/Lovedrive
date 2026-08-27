const Folder = require("../models/Folder");

// =====================================================
// CREATE FOLDER
// =====================================================

exports.createFolder = async (
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

    const {
      name,
      parent = null,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Folder name is required",
      });
    }

    const folderName = name.trim();

    const existingFolder =
      await Folder.findOne({
        owner: userId,
        name: folderName,
        parent: parent || null,
        isTrashed: false,
      });

    if (existingFolder) {
      return res.status(409).json({
        success: false,
        message:
          "A folder with this name already exists",
      });
    }

    const folder =
      await Folder.create({
        owner: userId,
        name: folderName,
        parent: parent || null,
        isTrashed: false,
      });

    return res.status(201).json({
      success: true,
      message: "Folder created successfully",
      folder,
    });
  } catch (error) {
    console.error(
      "CREATE FOLDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create folder",
    });
  }
};

// =====================================================
// GET FOLDERS
// =====================================================

exports.getFolders = async (
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

    const parent =
      req.query.parent || null;

    const folders =
      await Folder.find({
        owner: userId,
        parent,
        isTrashed: false,
      }).sort({
        name: 1,
      });

    return res.status(200).json({
      success: true,
      folders,
    });
  } catch (error) {
    console.error(
      "GET FOLDERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch folders",
    });
  }
};

// =====================================================
// RENAME FOLDER
// =====================================================

exports.renameFolder = async (
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

    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Folder name is required",
      });
    }

    const folder =
      await Folder.findOne({
        _id: id,
        owner: userId,
        isTrashed: false,
      });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found",
      });
    }

    const folderName = name.trim();

    const duplicate =
      await Folder.findOne({
        _id: {
          $ne: id,
        },
        owner: userId,
        name: folderName,
        parent: folder.parent || null,
        isTrashed: false,
      });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "A folder with this name already exists",
      });
    }

    folder.name = folderName;

    await folder.save();

    return res.status(200).json({
      success: true,
      message: "Folder renamed successfully",
      folder,
    });
  } catch (error) {
    console.error(
      "RENAME FOLDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to rename folder",
    });
  }
};

// =====================================================
// MOVE FOLDER TO TRASH
// =====================================================

exports.deleteFolder = async (
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

    const { id } = req.params;

    const folder =
      await Folder.findOne({
        _id: id,
        owner: userId,
        isTrashed: false,
      });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found",
      });
    }

    folder.isTrashed = true;

    await folder.save();

    return res.status(200).json({
      success: true,
      message: "Folder moved to trash",
      folder,
    });
  } catch (error) {
    console.error(
      "DELETE FOLDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete folder",
    });
  }
};

// =====================================================
// GET TRASHED FOLDERS
// =====================================================

exports.getTrashFolders = async (
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

    const folders =
      await Folder.find({
        owner: userId,
        isTrashed: true,
      }).sort({
        updatedAt: -1,
      });

    return res.status(200).json({
      success: true,
      folders,
    });
  } catch (error) {
    console.error(
      "GET TRASH FOLDERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch trashed folders",
    });
  }
};

// =====================================================
// RESTORE FOLDER
// =====================================================

exports.restoreFolder = async (
  req,
  res
) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const folder =
      await Folder.findOne({
        _id: id,
        owner: userId,
        isTrashed: true,
      });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message:
          "Trashed folder not found",
      });
    }

    // Check whether parent folder still exists.
    let restoreParent =
      folder.parent || null;

    if (restoreParent) {
      const parentFolder =
        await Folder.findOne({
          _id: restoreParent,
          owner: userId,
          isTrashed: false,
        });

      // If parent is gone/trash,
      // restore folder to root.
      if (!parentFolder) {
        restoreParent = null;
      }
    }

    // Prevent duplicate folder names.
    const duplicate =
      await Folder.findOne({
        _id: {
          $ne: folder._id,
        },
        owner: userId,
        name: folder.name,
        parent: restoreParent,
        isTrashed: false,
      });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "A folder with this name already exists at the restore location",
      });
    }

    folder.parent = restoreParent;
    folder.isTrashed = false;

    await folder.save();

    return res.status(200).json({
      success: true,
      message: "Folder restored successfully",
      folder,
    });
  } catch (error) {
    console.error(
      "RESTORE FOLDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to restore folder",
    });
  }
};

// =====================================================
// PERMANENT DELETE FOLDER
// =====================================================

exports.permanentDeleteFolder = async (
  req,
  res
) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const folder =
      await Folder.findOne({
        _id: id,
        owner: userId,
        isTrashed: true,
      });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message:
          "Trashed folder not found",
      });
    }

    await Folder.deleteOne({
      _id: folder._id,
      owner: userId,
      isTrashed: true,
    });

    return res.status(200).json({
      success: true,
      message:
        "Folder permanently deleted",
    });
  } catch (error) {
    console.error(
      "PERMANENT DELETE FOLDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to permanently delete folder",
    });
  }
};