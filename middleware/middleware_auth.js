//protection-route middleware backed by express-session

function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
      return next();
    }
    return res.redirect("/login");
  }
  
  function requireAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === "admin") {
      return next();
    }
    return res.status(403).render("login", {
      error: "You must be an administrator to view that page.",
    });
  }
  
  // Makes the logged-in user (if any) available to every Handlebars view
  // as {{user}}, so navbars can show Login vs Account/Log Out.
  function attachUserToLocals(req, res, next) {
    res.locals.user = (req.session && req.session.user) || null;
    next();
  }
  
  module.exports = { requireAuth, requireAdmin, attachUserToLocals };
