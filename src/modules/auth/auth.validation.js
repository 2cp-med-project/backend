const emailValidation = {
  in: "body",
  notEmpty: true,
  isEmail: true,
  errorMessage: "A valid email is required",
  normalizeEmail: true,
};

const phoneValidation = {
  in: "body",
  notEmpty: true,
  isMobilePhone: true,
  errorMessage: "A valid phone number is required",
};

const passwordValidation = {
  in: "body",
  notEmpty: true,
  isString: true,
  isStrongPassword: true,
  errorMessage:
    "Password is required and must be at least 8 characters long, contain uppercase and lowercase letters, numbers, and a symbols",
};

const roleValidation = {
  in: "body",
  notEmpty: true,
  isString: true,
  isIn: { options: [["doctor", "patient"]] },
  errorMessage: "Role is required and must be either doctor or patient",
};

const signUpValidation = {
  firstName: {
    in: "body",
    notEmpty: true,
    isString: true,
    isAlpha: true,
    errorMessage: "First name is required and must be a string of letters",
    toLowerCase: true,
  },
  lastName: {
    in: "body",
    notEmpty: true,
    isString: true,
    isAlpha: true,
    errorMessage: "Last name is required and must be a string of letters",
    toLowerCase: true,
  },
  email: emailValidation,
  phone: phoneValidation,
  password: passwordValidation,
  role: roleValidation,
};

const logInValidation = {
  phone: phoneValidation,
  password: passwordValidation,
  role: roleValidation,
};

const tokenValidation = {
  refreshToken: {
    in: "body",
    notEmpty: true,
    isString: true,
    errorMessage: "The token is required and must be a string",
  },
};

const requestOTPValidation = {
  phone: phoneValidation,
  role: roleValidation,
};

const verifyOTPValidation = {
  phone: phoneValidation,
  role: roleValidation,
  code: {
    in: "body",
    notEmpty: true,
    isString: true,
    isLength: { options: { min: 6, max: 6 } },
    errorMessage: "OTP is required and must be a 6-digit string",
  },
};

export default {
  signUpValidation,
  logInValidation,
  tokenValidation,
  requestOTPValidation,
  verifyOTPValidation,
};
