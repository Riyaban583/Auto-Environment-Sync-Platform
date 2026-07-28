const express = require("express");

const router = express.Router();

// STEP 1: Send user to GitHub
router.get("/login", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return res.status(500).json({
      message: "GitHub Client ID is not configured",
    });
  }

  const githubAuthUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${clientId}` +
    `&scope=repo%20read:user`;

  res.redirect(githubAuthUrl);
});

// STEP 2: GitHub sends user back here
router.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: "GitHub authorization code not found",
    });
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return res.status(400).json({
        success: false,
        message: "Failed to get GitHub access token",
      });
    }

    const accessToken = tokenData.access_token;

    // Get logged-in GitHub user
    const userResponse = await fetch(
      "https://api.github.com/user",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const user = await userResponse.json();

   const userData = {
  id: user.id,
  username: user.login,
  name: user.name,
  avatar: user.avatar_url,
};

const encodedUser = encodeURIComponent(
  JSON.stringify(userData)
);

return res.redirect(
  `http://localhost:5173/?githubConnected=true&user=${encodedUser}`
);
  } catch (error) {
    console.error("GitHub OAuth Error:", error);

    return res.status(500).json({
      success: false,
      message: "GitHub authentication failed",
    });
  }
});

module.exports = router;