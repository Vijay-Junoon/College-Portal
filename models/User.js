const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["student", "admin"] },
  profilePic: {
    type: String,
    default: "/images/default.png",
  },
  subjects: {
    type: [
      {
        name: String,
        units: {
          type: [Boolean],
          default: [false, false, false, false, false], // 5 units
        },
      },
    ],
    default: [
      { name: "ATCD" },
      { name: "CC" },
      { name: "FSD" },
      { name: "ML" },
      { name: "DPPM" },
    ],
  },
});

module.exports = mongoose.model("User", userSchema);
