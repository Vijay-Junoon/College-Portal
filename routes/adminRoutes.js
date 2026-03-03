const express = require("express");
const { isAuthenticated, isAdmin } = require("../middleware/authMiddleware");
const Resource = require("../models/Resource");
const Notification = require("../models/Notification");
const User = require("../models/User");

const multer = require("multer");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDFs allowed"), false);
    }
  },
});

router.get("/dashboard", isAuthenticated, isAdmin, async (req, res) => {
  const students = await User.countDocuments({ role: "student" });
  const resources = await Resource.find();
  const notifications = await Notification.find();

  res.render("adminDashboard", {
    students,
    resources,
    notifications,
  });
});

router.post(
  "/add-resource",
  isAdmin,
  upload.single("pdf"),
  async (req, res) => {
    await Resource.create({
      subject: req.body.subject,
      title: req.body.title,
      fileUrl: "/uploads/" + req.file.filename,
    });

    res.redirect("/admin/dashboard");
  },
);

router.post("/delete-resource/:id", isAdmin, async (req, res) => {
  await Resource.findByIdAndDelete(req.params.id);
  res.redirect("/admin/dashboard");
});

router.post("/add-notification", isAdmin, async (req, res) => {
  await Notification.create(req.body);
  res.redirect("/admin/dashboard");
});

router.post("/delete-notification/:id", isAdmin, async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.redirect("/admin/dashboard");
});

module.exports = router;
