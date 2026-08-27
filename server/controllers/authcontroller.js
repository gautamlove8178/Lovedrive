const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const cloudinary = require("../config/cloudinary");

// =====================================================
// REGISTER
// =====================================================

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    const exists =
      await User.findOne({
        email,
      });

    if (exists) {
      return res.status(400).json({
        success: false,
        message:
          "Email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await User.create({
        name,
        email,
        password:
          hashedPassword,
      });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      storageUsed:
        user.storageUsed,
      storageLimit:
        user.storageLimit,
      createdAt:
        user.createdAt,
    };

    return res.status(201).json({
      success: true,
      message:
        "Account created",
      user: userResponse,
    });

  } catch (err) {
    console.error(
      "REGISTER ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        err.message,
    });
  }
};

// =====================================================
// LOGIN
// =====================================================

exports.login = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const user =
      await User.findOne({
        email,
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    const match =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!match) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    const token =
      jwt.sign(
        {
          id: user._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn:
            "7d",
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Login successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        storageUsed:
          user.storageUsed,
        storageLimit:
          user.storageLimit,
      },
    });

  } catch (err) {
    console.error(
      "LOGIN ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        err.message,
    });
  }
};

// =====================================================
// GET CURRENT USER
// =====================================================

exports.getMe = async (
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

    const user =
      await User.findById(
        userId
      ).select(
        "-password"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        storageUsed:
          user.storageUsed,
        storageLimit:
          user.storageLimit,
        createdAt:
          user.createdAt,
      },
    });

  } catch (err) {
    console.error(
      "GET ME ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch user",
    });
  }
};

// =====================================================
// UPDATE PROFILE
// =====================================================

exports.updateProfile = async (
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

    const {
      name,
      email,
    } = req.body;

    if (
      !name ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name is required",
      });
    }

    if (
      !email ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email is required",
      });
    }

    const cleanName =
      name.trim();

    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    const existingUser =
      await User.findOne({
        email: cleanEmail,
        _id: {
          $ne: userId,
        },
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "This email is already in use",
      });
    }

    const user =
      await User.findById(
        userId
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    user.name =
      cleanName;

    user.email =
      cleanEmail;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        storageUsed:
          user.storageUsed,
        storageLimit:
          user.storageLimit,
        createdAt:
          user.createdAt,
      },
    });

  } catch (err) {
    console.error(
      "UPDATE PROFILE ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update profile",
    });
  }
};

// =====================================================
// CHANGE PASSWORD
// =====================================================

exports.changePassword =
  async (
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

      const {
        currentPassword,
        newPassword,
        confirmPassword,
      } = req.body;

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "All password fields are required",
        });
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "New passwords do not match",
        });
      }

      if (
        newPassword.length < 6
      ) {
        return res.status(400).json({
          success: false,
          message:
            "New password must be at least 6 characters",
        });
      }

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      const passwordMatch =
        await bcrypt.compare(
          currentPassword,
          user.password
        );

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message:
            "Current password is incorrect",
        });
      }

      user.password =
        await bcrypt.hash(
          newPassword,
          10
        );

      await user.save();

      return res.status(200).json({
        success: true,
        message:
          "Password changed successfully",
      });

    } catch (err) {
      console.error(
        "CHANGE PASSWORD ERROR:",
        err
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to change password",
      });
    }
  };

// =====================================================
// UPDATE AVATAR
// =====================================================

exports.updateAvatar = async (
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

    // -----------------------------------------------
    // CHECK FILE
    // -----------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Profile picture is required",
      });
    }

    // -----------------------------------------------
    // CHECK USER
    // -----------------------------------------------

    const user =
      await User.findById(
        userId
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    // -----------------------------------------------
    // OLD AVATAR DELETE
    // -----------------------------------------------

    if (
      user.avatarPublicId
    ) {
      try {
        await cloudinary.uploader.destroy(
          user.avatarPublicId,
          {
            resource_type:
              "image",
            invalidate: true,
          }
        );

        console.log(
          "Old avatar deleted:",
          user.avatarPublicId
        );
      } catch (deleteError) {
        console.error(
          "OLD AVATAR DELETE ERROR:",
          deleteError
        );

        // Do not stop new upload if old avatar
        // cleanup fails.
      }
    }

    // -----------------------------------------------
    // SAVE NEW AVATAR
    // -----------------------------------------------

    user.avatar =
      req.file.path ||
      req.file.secure_url ||
      "";

    // multer-storage-cloudinary normally
    // provides filename as Cloudinary public_id.
    user.avatarPublicId =
      req.file.filename ||
      "";

    await user.save();

    // -----------------------------------------------
    // RESPONSE
    // -----------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Profile picture updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        storageUsed:
          user.storageUsed,
        storageLimit:
          user.storageLimit,
        createdAt:
          user.createdAt,
      },
    });

  } catch (err) {
    console.error(
      "UPDATE AVATAR ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "Failed to update profile picture",
    });
  }
};

// =====================================================
// REMOVE AVATAR
// =====================================================

exports.removeAvatar = async (
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

    const user =
      await User.findById(
        userId
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    // -----------------------------------------------
    // DELETE CLOUDINARY AVATAR
    // -----------------------------------------------

    if (
      user.avatarPublicId
    ) {
      try {
        const result =
          await cloudinary.uploader.destroy(
            user.avatarPublicId,
            {
              resource_type:
                "image",
              invalidate: true,
            }
          );

        console.log(
          "Avatar delete result:",
          result
        );
      } catch (deleteError) {
        console.error(
          "AVATAR CLOUD DELETE ERROR:",
          deleteError
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to remove profile picture from cloud",
        });
      }
    }

    // -----------------------------------------------
    // REMOVE FROM DATABASE
    // -----------------------------------------------

    user.avatar = "";
    user.avatarPublicId = "";

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Profile picture removed successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        storageUsed:
          user.storageUsed,
        storageLimit:
          user.storageLimit,
        createdAt:
          user.createdAt,
      },
    });

  } catch (err) {
    console.error(
      "REMOVE AVATAR ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "Failed to remove profile picture",
    });
  }
};
