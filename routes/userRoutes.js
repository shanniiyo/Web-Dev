const express = require("express");
const router = express.Router();

const User = require("../models/User");
const { hashPassword, verifyPassword } = require("../utils/password_utils");
const { validateRegistration, validateLogin } = require("../utils/validate_utils");

// =====================
// Registration
// =====================

router.get("/register", (req, res) => {
  if (req.session.user) return res.redirect("/profile");
  res.render("register");
});

router.post("/register", async (req, res) => {
  try {
    const errors = validateRegistration(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).render("register", {
        errors,
        formData: req.body,
      });
    }

    const email = req.body.email.trim().toLowerCase();

    // Server-side duplicate check (client cannot verify this)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render("register", {
        errors: { email: "An account with this email already exists." },
        formData: req.body,
      });
    }

    const newUser = new User({
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      email,
      password: hashPassword(req.body.password),
      role: "passenger",
    });

    await newUser.save();

    // Auto-login after successful registration
    req.session.user = {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
    };

    return res.redirect("/profile");
  } catch (err) {
    console.error(err);
    return res.status(500).render("register", {
      errors: { general: "Something went wrong. Please try again." },
      formData: req.body,
    });
  }
});

// =====================
// Login
// =====================

router.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/profile");
  res.render("login");
});

router.post("/login", async (req, res) => {
  try {
    const errors = validateLogin(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).render("login", {
        errors,
        formData: req.body,
      });
    }

    const email = req.body.email.trim().toLowerCase();
    const user = await User.findOne({ email });

    if (!user || !verifyPassword(req.body.password, user.password)) {
      return res.status(401).render("login", {
        errors: { general: "Incorrect email or password." },
        formData: req.body,
      });
    }

    if (user.status === "Suspended") {
      return res.status(403).render("login", {
        errors: { general: "This account has been suspended." },
        formData: req.body,
      });
    }

    req.session.user = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };

    if (user.role === "admin") return res.redirect("/admin-dashboard");
    return res.redirect("/profile");
  } catch (err) {
    console.error(err);
    return res.status(500).render("login", {
      errors: { general: "Something went wrong. Please try again." },
      formData: req.body,
    });
  }
});

// =====================
// Logout
// =====================

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;