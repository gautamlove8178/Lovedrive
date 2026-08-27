const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      default: 0,
    },

    type: {
      type: String,
      default: "",
    },

    // =====================================================
    // 📁 FOLDER
    // null = My Files / Root
    // =====================================================

    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },

    // =====================================================
    // ⭐ FAVORITE
    // =====================================================

    isFavorite: {
      type: Boolean,
      default: false,
    },

    // =====================================================
    // 🗑️ TRASH
    // =====================================================

    isTrashed: {
      type: Boolean,
      default: false,
    },

    // =====================================================
    // 👥 REGISTERED USER SHARING
    // =====================================================

    sharedWith: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        permission: {
          type: String,
          enum: ["view", "download"],
          default: "view",
        },
      },
    ],

    // =====================================================
    // 🔗 PUBLIC SHARE LINKS
    //
    // Ek file ke multiple public links ho sakte hain.
    // =====================================================

    shareLinks: [
      {
        token: {
          type: String,
          required: true,
        },

        permission: {
          type: String,
          enum: ["view", "download"],
          default: "view",
        },

        enabled: {
          type: Boolean,
          default: true,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "File",
  fileSchema
);