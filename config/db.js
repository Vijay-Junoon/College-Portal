const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://vijay262005_db_user:RvDV84YaShEpdiR9@college-portal.f5j1qvk.mongodb.net/?appName=college-portal",
    );
    console.log("MongoDB Connected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
