const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  updateAvatar,
  removeAvatar,
} = require("../controllers/authcontroller");

// =====================================================
// PUBLIC AUTH
// =====================================================

router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);

// =====================================================
// PROTECTED AUTH
// =====================================================

// Get current logged-in user
router.get(
  "/me",
  auth,
  getMe
);

// Update profile name/email
router.patch(
  "/profile",
  auth,
  updateProfile
);

// Change password
router.patch(
  "/change-password",
  auth,
  changePassword
);

// =====================================================
// PROFILE AVATAR
// =====================================================

// Upload / change profile picture
router.patch(
  "/avatar",
  auth,
  upload.single("avatar"),
  updateAvatar
);

// Remove profile picture
router.delete(
  "/avatar",
  auth,
  removeAvatar
);

module.exports = router;
