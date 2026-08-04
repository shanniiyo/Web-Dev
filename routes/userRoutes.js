const express = require("express");
const router = express.Router();

const User = require("../models/User");
const { hashPassword, verifyPassword } = require("../utils/password_utils");
const { validateRegistration, validateLogin } = require("../utils/validate_utils");
const { requireGuest } = require("../middleware/middleware_auth");

// to buidl the object we keep every session
// dont store password hash here
function toSessionUser(user) {
  return{
    id: user._id.toString(),
    firstname: user.firstName,
    lastname: user.lastname,
    email: user.email,
    role: user.role,
  };
}

// REGISTRATION

router.get("/register", requireGuest, (req, res) => {
  res.render("register");
});

router.post("/register", requireGuest, async (req, res) => {
  try {
    const errors = validateRegistration(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).render("register", { errors, formData: req.body });
    }

    const email = req.body.email.trim().toLowerCase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render("register", {
        errors: { email: "An account with this email already exists." },
        formData: req.body,
      });
    }

    // bcrypt.hash is async — this await is mandatory.
    const hashed = await hashPassword(req.body.password);

    const newUser = new User({
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      email,
      password: hashed,
      role: "passenger", // hardcoded on purpose: never trust a role from the form
    });

    await newUser.save();

    req.session.regenerate((err) => {
      if (err) {
        console.error(err);
        return res.status(500).render("register", {
          errors: { general: "Something went wrong. Please try again." },
          formData: req.body,
        });
      }
      req.session.user = toSessionUser(newUser);
      return res.redirect("/profile");
    });
  } catch (err) {
    console.error(err);
    return res.status(500).render("register", {
      errors: { general: "Something went wrong. Please try again." },
      formData: req.body,
    });
  }
});



// LOGIN

router.get("/login", requireGuest, (req, res) => {
  res.render("login");
});

router.post("/login", requireGuest, async (req, res) => {
  try {
    const errors = validateLogin(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).render("login", { errors, formData: req.body });
    }

    const email = req.body.email.trim().toLowerCase();
    const user = await User.findOne({ email });

    // await here too. Without it this check passes for ANY password.
    const passwordOk = user
      ? await verifyPassword(req.body.password, user.password)
      : false;

    if (!user || !passwordOk) {
      // Same message either way so we don't leak which emails are registered.
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

    const returnTo = req.session.returnTo;

    // New session ID on privilege change — blocks session fixation.
    req.session.regenerate((err) => {
      if (err) {
        console.error(err);
        return res.status(500).render("login", {
          errors: { general: "Something went wrong. Please try again." },
          formData: req.body,
        });
      }

      req.session.user = toSessionUser(user);

      if (returnTo) return res.redirect(returnTo);
      if (user.role === "admin") return res.redirect("/admin-dashboard");
      return res.redirect("/profile");
    });
  } catch (err) {
    console.error(err);
    return res.status(500).render("login", {
      errors: { general: "Something went wrong. Please try again." },
      formData: req.body,
    });
  }
});

//LOGOUT
function doLogout(req, res) {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
}

router.post("/logout", doLogout);
router.get("/logout", doLogout);

module.exports = router;
