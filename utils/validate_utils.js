// Shared server-side validation helpers.
// Every field validated on the client MUST also be validated here (Milestone 2, section 8).

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmpty(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function validateRegistration(body) {
  const errors = {};
  const { firstName, lastName, email, password, confirmPassword } = body;

  if (isEmpty(firstName)) errors.firstName = "First name is required.";
  if (isEmpty(lastName)) errors.lastName = "Last name is required.";

  if (isEmpty(email)) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (isEmpty(password)) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (isEmpty(confirmPassword)) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

function validateLogin(body) {
  const errors = {};
  const { email, password } = body;

  if (isEmpty(email)) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (isEmpty(password)) errors.password = "Password is required.";

  return errors;
}

function validateProfileUpdate(body) {
  const errors = {};
  const { firstName, lastName, email, phone } = body;

  if (isEmpty(firstName)) errors.firstName = "First name is required.";
  if (isEmpty(lastName)) errors.lastName = "Last name is required.";

  if (isEmpty(email)) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (isEmpty(phone)) errors.phone = "Contact number is required.";

  return errors;
}

module.exports = {
  isEmpty,
  EMAIL_REGEX,
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
};
