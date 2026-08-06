require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// MongoDB Connect
connectDB();

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 LoveDrive Backend Running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});