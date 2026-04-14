const mongoose = require('mongoose');

module.exports = async function connectDB(uri) {
  try {
    await mongoose.connect(uri, {
      ssl: true,
      tlsAllowInvalidCertificates: true // chỉ để cái này, không thêm tlsInsecure
    });

    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};
