//protection-route middleware backed by express-session

//to check if someone is logged in
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  if (req.session) req.session.returnTo = req.originalUrl;
  return res.redirect("/login");
}

//admin or passenger
  function requireRole(...allowedRoles) {
    return function (req, res, next) {
      if (!req.session || !req.session.user) {
        if (req.session) req.session.returnTo = req.originalUrl;
        return res.redirect("/login");
      }
  
      if (!allowedRoles.includes(req.session.user.role)) {
        return res.status(403).render("accessDenied", {
          message: "You don't have permission to access that page.",
        });
      }
  
      return next();
    };
  }
  
  const requireAdmin = requireRole("admin");
  const requirePassenger = requireRole("passenger");

  //keep the logged in user off /login and /register
  function requireGuest(req, res, next) {
    if (req.session && req.session.user) {
      return res.redirect(
        req.session.user.role === "admin" ? "/admin-dashboard" : "/profile"
      );
    }
    return next();
  }

  // Makes the logged-in user (if any) available to every Handlebars view
  // as {{user}}, so navbars can show Login vs Account/Log Out.
  function attachUserToLocals(req, res, next) {
  const user = (req.session && req.session.user) || null;
  res.locals.user = user;
  res.locals.isAdmin = !!user && user.role === "admin";
  next();
}

module.exports = {
  requireAuth,
  requireRole,
  requireAdmin,
  requirePassenger,
  requireGuest,
  attachUserToLocals,
};