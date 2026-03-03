const express = require("express");
const bcrypt = require("bcrypt");
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

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Logout Error:", err);
      return res.redirect("/student/dashboard");
    }

    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

router.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/student/dashboard");
  }
  res.render("login");
});
router.get("/register", (req, res) => res.render("register"));

const upload = multer({ storage: storage });

router.post("/register", upload.single("profilePic"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultSubjects = [
      { name: "ATCD", units: [false, false, false, false, false] },
      { name: "CC", units: [false, false, false, false, false] },
      { name: "FSD", units: [false, false, false, false, false] },
      { name: "ML", units: [false, false, false, false, false] },
      { name: "DPPM", units: [false, false, false, false, false] },
    ];

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      profilePic: req.file
        ? "/uploads/" + req.file.filename
        : "/images/default.png",
      subjects: defaultSubjects,
    });

    await newUser.save();

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.send("Registration failed");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.send("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.send("Invalid password");

  req.session.regenerate((err) => {
    if (err) return res.send("Session error");

    req.session.user = user;

    if (user.role === "admin") {
      res.redirect("/admin/dashboard");
    } else {
      res.redirect("/student/dashboard");
    }
  });
});

module.exports = router;
