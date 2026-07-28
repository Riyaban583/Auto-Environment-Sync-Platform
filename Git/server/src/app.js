const express = require("express");
const cors = require("cors");
require("dotenv").config();

const gitRoutes = require("./routes/git.routes");
const githubRoutes = require("./routes/githubRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "DevSync Git Server is running",
  });
});

// Existing Git repository routes
app.use("/api/git", gitRoutes);

// GitHub OAuth routes
app.use("/api/github", githubRoutes);

// Port
const PORT = process.env.PORT || 5001;

// Start server
app.listen(PORT, () => {
  console.log(`DevSync Git Server running on port ${PORT}`);
});