const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema(
  {
    // 👤 Folder owner
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 📁 Folder name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // 📂 Parent folder
    // null = My Files / root
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },

    // 🗑️ Trash
    isTrashed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Folder",
  folderSchema
);