const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  subject: {
    type: String,
    enum: ["ATCD", "FSD", "CC", "ML", "DPPM"],
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  fileUrl: {
    type: String,
    required: true,
  },

  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Resource", resourceSchema);
