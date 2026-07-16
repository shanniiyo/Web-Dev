// Run once with: node seed-admin.js
// Creates a default administrator account so admin-only pages (Flight
// Management, Reservation List) can be reached and tested.

const mongoose = require("mongoose");
const User = require("./models/User");
const { hashPassword } = require("./utils/password");

async function seed() {
  await mongoose.connect("mongodb://127.0.0.1:27017/LoginDB");

  const email = "admin@flyscanners.com";
  const existing = await User.findOne({ email });

  if (existing) {
    console.log("Admin account already exists:", email);
  } else {
    await User.create({
      firstName: "FlyScanners",
      lastName: "Admin",
      email,
      password: hashPassword("Admin@12345"),
      role: "admin",
    });
    console.log("Admin account created:");
    console.log("  email:", email);
    console.log("  password: Admin@12345");
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
