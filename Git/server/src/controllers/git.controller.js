const { cloneRepository } = require("../services/git.service");

// Connect and clone GitHub repository
async function connectRepository(req, res) {
  try {
    // Get repository URL from frontend
    const { repoUrl } = req.body;

    // Check URL is provided
    if (!repoUrl) {
      return res.status(400).json({
        success: false,
        message: "Repository URL is required",
      });
    }

    // Clone repository using Git service
    const repository = await cloneRepository(repoUrl);

    // Send successful response
    return res.status(200).json({
      success: true,
      message: "Repository connected successfully",
      repository: repository,
    });

  } catch (error) {
    console.error("Repository connection error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to connect repository",
    });
  }
}

module.exports = {
  connectRepository,
};