const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// =========================
// MIDDLEWARE
// =========================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static folders
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// =========================
// SESSION CONFIG
// =========================
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://vijay262005_db_user:RvDV84YaShEpdiR9@college-portal.f5j1qvk.mongodb.net/collegePortal",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }),
);

// =========================
// ROUTES
// =========================
app.use("/", require("./routes/authRoutes"));
app.use("/student", require("./routes/studentRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/resources", require("./routes/resourceRoutes"));

// =========================
// ERROR HANDLER (prevents crash)
// =========================
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).send("Something went wrong!");
});

// =========================
// SERVER START
// =========================
const PORT = 3000;

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
