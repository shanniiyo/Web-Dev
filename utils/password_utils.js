// Password hashing using Node's built-in crypto module (scrypt).
// Kept dependency-free on purpose (Node.js + Express + Handlebars + MongoDB only).
const crypto = require("crypto");

const KEY_LENGTH = 64;

function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(plainPassword, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString("hex")}`;
}

function verifyPassword(plainPassword, storedHash) {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, key] = storedHash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = crypto.scryptSync(plainPassword, salt, KEY_LENGTH);
  // timing-safe comparison
  return (
    keyBuffer.length === derivedKey.length &&
    crypto.timingSafeEqual(keyBuffer, derivedKey)
  );
}

module.exports = { hashPassword, verifyPassword };
