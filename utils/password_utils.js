// Password hashing with bcrypt
// The salt is embedded in the output hash, so no separate salt column is needed
// Output format: $2b$12$<22-char salt><31-char hash>  (60 chars total)
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 12;

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

async function verifyPassword(plainPassword, storedHash) {
  // Guard: a missing/malformed hash must return false, never throw
  if (!plainPassword || !storedHash) return false;
  return bcrypt.compare(plainPassword, storedHash);
}

module.exports = { hashPassword, verifyPassword };