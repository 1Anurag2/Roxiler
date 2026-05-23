const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());

// Routes

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");
const ownerRoutes = require("./routes/owner");

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/owner", ownerRoutes);

// Health Route
app.get("/", (req, res) => {
  res.send("API Running");
});

// Error Handler

app.use((err, req, res, next) => {
  console.log(err);

  res.status(500).json({
    error: "Internal server error",
  });
});


// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

module.exports = app;
