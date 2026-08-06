// Run once with: node seed_admin.js

const mongoose = require("mongoose");
const User = require("./models/User");
const { hashPassword } = require("./utils/password_utils");

async function seed() {
  await mongoose.connect("mongodb://127.0.0.1:27017/FlyScannerDB");

  const email = "admin@flyscanners.com";
  const plainPassword = "Admin@12345";
  const existing = await User.findOne({ email });

  //hashPassword is asynch
  const hashed = await hashPassword(plainPassword);

  if (existing) {
    //re hashed to remove scrypt from before migrating to bcrypt
    existing.password = hashed;
    existing.role = "admin";
    existing.status = "Active";
    await existing.save();
    console.log("Existing admin re-hashed with bcrypt:", email);
  } else {
    await User.create({
      firstName: "FlyScanners",
      lastName: "Admin",
      email,
      password: hashed,
      role: "admin",
    });
    console.log("Admin account created:", email);
  }

  console.log("  password:", plainPassword);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
