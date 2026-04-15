const mongoose = require('mongoose');

module.exports = async function connectDB(uri) {
  try {
    await mongoose.connect(uri, {
      ssl: true,
      tlsAllowInvalidCertificates: true
    });

    console.log("MongoDB connected");
    return true;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
};
