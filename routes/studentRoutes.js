const express = require("express");
const { isAuthenticated, isStudent } = require("../middleware/authMiddleware");
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

const upload = multer({ storage });

router.get("/dashboard", isAuthenticated, isStudent, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);

    if (!user) return res.redirect("/login");

    let totalUnits = 0;
    let completedUnits = 0;

    user.subjects.forEach((subject) => {
      totalUnits += subject.units.length;
      completedUnits += subject.units.filter((u) => u).length;
    });

    const overallProgress =
      totalUnits === 0 ? 0 : Math.round((completedUnits / totalUnits) * 100);

    const notifications = await Notification.find().sort({ createdAt: -1 });

    res.render("studentDashboard", {
      user,
      overallProgress,
      notifications,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.get("/profile", isAuthenticated, isStudent, async (req, res) => {
  const user = await User.findById(req.session.user._id);
  res.render("profile", { user });
});

router.post(
  "/profile/update",
  isAuthenticated,
  isStudent,
  upload.single("profilePic"),
  async (req, res) => {
    const { name } = req.body;

    const updateData = { name };

    if (req.file) {
      updateData.profilePic = "/uploads/" + req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.session.user._id,
      updateData,
      { new: true },
    );

    req.session.user = updatedUser;

    res.redirect("/student/dashboard");
  },
);

router.post("/unit/update", isAuthenticated, isStudent, async (req, res) => {
  try {
    const subjectIndex = parseInt(req.body.subjectIndex);
    const unitIndex = parseInt(req.body.unitIndex);

    const user = await User.findById(req.session.user._id);

    if (!user) {
      return res.redirect("/login");
    }

    if (
      !user.subjects ||
      !user.subjects[subjectIndex] ||
      !Array.isArray(user.subjects[subjectIndex].units)
    ) {
      return res.redirect("/student/dashboard");
    }

    if (user.subjects[subjectIndex].units.length < 5) {
      user.subjects[subjectIndex].units = [false, false, false, false, false];
    }

    user.subjects[subjectIndex].units[unitIndex] =
      !user.subjects[subjectIndex].units[unitIndex];

    await user.save();

    res.redirect("/student/dashboard");
  } catch (error) {
    console.error("Unit Update Error:", error);
    res.redirect("/student/dashboard");
  }
});

module.exports = router;
