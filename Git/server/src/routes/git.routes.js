const express = require("express");

const {
  connectRepository,
} = require("../controllers/git.controller");

const router = express.Router();

// POST /api/git/connect
router.post("/connect", connectRepository);

module.exports = router;