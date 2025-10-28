const mongoose = require("mongoose");

const DBConnection = async () => {
  try {
    await mongoose.connect(process.env.DB_STRING);
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ Database Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = DBConnection;
