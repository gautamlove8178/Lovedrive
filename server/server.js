require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/fileRoutes");
const folderRoutes = require("./routes/folderRoutes");

const app = express();

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "https://lovedrive.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Postman / server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(origin)
      ) {
        return callback(
          null,
          true
        );
      }

      console.log(
        "❌ CORS BLOCKED:",
        origin
      );

      return callback(
        new Error(
          "Not allowed by CORS"
        )
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// =====================================================
// BODY MIDDLEWARE
// =====================================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

app.use(cookieParser());

// =====================================================
// REQUEST LOGGER
// =====================================================

app.use(
  (req, res, next) => {
    console.log(
      `➡️ ${req.method} ${req.originalUrl}`
    );

    next();
  }
);

// =====================================================
// ROUTES
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/files",
  fileRoutes
);

app.use(
  "/api/folders",
  folderRoutes
);

// =====================================================
// TEST ROUTE
// =====================================================

app.get(
  "/",
  (req, res) => {
    return res.status(200).json({
      success: true,
      message:
        "🚀 LoveDrive Backend Running",
    });
  }
);

// =====================================================
// 404
// =====================================================

app.use(
  (req, res) => {
    console.log(
      "❌ ROUTE NOT FOUND:",
      req.method,
      req.originalUrl
    );

    return res.status(404).json({
      success: false,
      message:
        "Route not found",
    });
  }
);

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {
    console.error(
      "🔥 SERVER ERROR:",
      err
    );

    if (
      err.message ===
      "Not allowed by CORS"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "CORS origin not allowed",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "Internal server error",
    });
  }
);

// =====================================================
// DATABASE
// =====================================================

connectDB();

// =====================================================
// SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      "===================================="
    );

    console.log(
      `🚀 LoveDrive Backend`
    );

    console.log(
      `✅ Server running on port ${PORT}`
    );

    console.log(
      `🌐 http://localhost:${PORT}`
    );

    console.log(
      "===================================="
    );
  }
);