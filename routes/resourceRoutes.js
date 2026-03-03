const express = require("express");
const Resource = require("../models/Resource");
const { isAuthenticated } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", isAuthenticated, async (req, res) => {
  const subject = req.query.subject;

  let filter = {};

  if (subject) {
    filter.subject = subject;
  }

  const resources = await Resource.find(filter);

  res.render("resources", {
    resources,
    role: req.session.user.role,
  });
});

module.exports = router;
