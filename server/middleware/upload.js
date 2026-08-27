const multer = require("multer");

const {
  CloudinaryStorage,
} = require("multer-storage-cloudinary");

const cloudinary =
  require("../config/cloudinary");

const path = require("path");

// =====================================================
// CLOUDINARY STORAGE
// =====================================================

const storage =
  new CloudinaryStorage({
    cloudinary,

    params: async (
      req,
      file
    ) => {
      const extension =
        path.extname(
          file.originalname
        );

      const nameWithoutExtension =
        path
          .basename(
            file.originalname,
            extension
          )
          .replace(
            /[^a-zA-Z0-9-_]/g,
            "-"
          );

      const cleanPublicId =
        `${Date.now()}-${nameWithoutExtension}`;

      // =================================================
      // RESOURCE TYPE
      // =================================================

      let resourceType = "auto";

      // PDF + documents + archives
      if (
        file.mimetype ===
          "application/pdf" ||
        file.mimetype.includes(
          "word"
        ) ||
        file.mimetype.includes(
          "officedocument"
        ) ||
        file.mimetype.includes(
          "zip"
        ) ||
        file.mimetype.includes(
          "rar"
        ) ||
        file.mimetype.includes(
          "text"
        )
      ) {
        resourceType = "raw";
      }

      // Audio / video
      else if (
        file.mimetype.startsWith(
          "audio/"
        ) ||
        file.mimetype.startsWith(
          "video/"
        )
      ) {
        resourceType = "video";
      }

      // Images
      else if (
        file.mimetype.startsWith(
          "image/"
        )
      ) {
        resourceType = "image";
      }

      return {
        folder:
          "LoveDrive",

        resource_type:
          resourceType,

        public_id:
          cleanPublicId,
      };
    },
  });

// =====================================================
// MULTER
// =====================================================

const upload =
  multer({
    storage,

    limits: {
      fileSize:
        100 *
        1024 *
        1024,
    },
  });

module.exports =
  upload;