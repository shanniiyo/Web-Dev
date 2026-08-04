const express = require("express");
const router = express.Router();

const User = require("../models/User");
const { requireAuth } = require("../middleware/middleware_auth");
const { validateProfileUpdate } = require("../utils/validate_utils");

function toDateInputValue(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d)) return "";
  return d.toISOString().split("T")[0];
}

// Splits a Date into { day: "05", month: "05", year: "1998" } for the
// day/month/year dropdown UI used on the Personal Info and Passport sections.
function splitDate(date) {
  if (!date) return { day: "", month: "", year: "" };
  const d = new Date(date);
  if (isNaN(d)) return { day: "", month: "", year: "" };
  return {
    day: String(d.getUTCDate()).padStart(2, "0"),
    month: String(d.getUTCMonth() + 1).padStart(2, "0"),
    year: String(d.getUTCFullYear()),
  };
}

function buildDateFromParts(day, month, year) {
  if (!day || !month || !year) return undefined;
  return new Date(`${year}-${month}-${day}`);
}

// =====================
// View Profile
// =====================

router.get("/profile", requireAuth, async (req, res) => {
  const user = await User.findById(req.session.user.id).lean();
  if (!user) return res.redirect("/logout");

  const dob = splitDate(user.dateOfBirth);
  const ppExp = splitDate(user.passportExpiry);

  res.render("profile", {
    profile: {
      ...user,
      dobDay: dob.day,
      dobMonth: dob.month,
      dobYear: dob.year,
      ppExpDay: ppExp.day,
      ppExpMonth: ppExp.month,
      ppExpYear: ppExp.year,
    },
  });
});

// =====================
// Update Profile
// =====================

router.post("/profile/update", requireAuth, async (req, res) => {
  try {
    const errors = validateProfileUpdate(req.body);

    if (Object.keys(errors).length > 0) {
      const user = await User.findById(req.session.user.id).lean();
      return res.status(400).render("profile", {
        errors,
        profile: {
          ...user,
          ...req.body,
        },
      });
    }

    const email = req.body.email.trim().toLowerCase();

    // Server-side duplicate check if the person changed their email
    const duplicate = await User.findOne({
      email,
      _id: { $ne: req.session.user.id },
    });
    if (duplicate) {
      const user = await User.findById(req.session.user.id).lean();
      return res.status(400).render("profile", {
        errors: { email: "That email is already used by another account." },
        profile: { ...user, ...req.body },
      });
    }

    const update = {
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      email,
      phone: req.body.phone ? req.body.phone.trim() : "",
      countryCode: req.body.countryCode || "+63",
      nationality: req.body.nationality || "",
      gender: req.body.gender || "",
      emergencyContactName: req.body.emergencyContactName
        ? req.body.emergencyContactName.trim()
        : "",
      emergencyContactPhone: req.body.emergencyContactPhone
        ? req.body.emergencyContactPhone.trim()
        : "",
      passportNationality: req.body.passportNationality || "",
      passportNumber: req.body.passportNumber
        ? req.body.passportNumber.trim()
        : "",
      passportIssuedBy: req.body.passportIssuedBy
        ? req.body.passportIssuedBy.trim()
        : "",
    };

    const dob = buildDateFromParts(
      req.body.dobDay,
      req.body.dobMonth,
      req.body.dobYear
    );
    if (dob) update.dateOfBirth = dob;

    const ppExp = buildDateFromParts(
      req.body.ppExpDay,
      req.body.ppExpMonth,
      req.body.ppExpYear
    );
    if (ppExp) update.passportExpiry = ppExp;

    const updatedUser = await User.findByIdAndUpdate(
      req.session.user.id,
      update,
      { new: true }
    ).lean();

    // Keep session display name in sync
    req.session.user.firstName = updatedUser.firstName;
    req.session.user.lastName = updatedUser.lastName;
    req.session.user.email = updatedUser.email;

    const dobParts = splitDate(updatedUser.dateOfBirth);
    const ppExpParts = splitDate(updatedUser.passportExpiry);

    res.render("profile", {
      success: "Profile updated successfully!",
      profile: {
        ...updatedUser,
        dobDay: dobParts.day,
        dobMonth: dobParts.month,
        dobYear: dobParts.year,
        ppExpDay: ppExpParts.day,
        ppExpMonth: ppExpParts.month,
        ppExpYear: ppExpParts.year,
      },
    });
  } catch (err) {
    console.error(err);
    const user = await User.findById(req.session.user.id).lean();
    res.status(500).render("profile", {
      errors: { general: "Something went wrong. Please try again." },
      profile: user,
    });
  }
});

module.exports = router;