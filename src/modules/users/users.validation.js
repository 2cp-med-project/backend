const mongoIdSchema = {
  in: "params",
  notEmpty: true,
  isMongoId: true,
  errorMessage: "Must be a valid MongoDB ObjectId in the URL parameters",
};

const optionalStringSchema = {
  in: "body",
  optional: { options: { nullable: true } },
  isString: true,
};

const getPaginationSchema = (allowedSortFields) => ({
  page: {
    in: "query",
    optional: true,
    isInt: { options: { min: 0 } },
    errorMessage: "Page must be an integer greater than or equal to 0",
    toInt: true,
  },
  limit: {
    in: "query",
    optional: true,
    isInt: { options: { min: 1 } },
    errorMessage: "Limit must be an integer greater than 0",
    toInt: true,
  },
  sortBy: {
    in: "query",
    optional: true,
    isString: true,
    isIn: { options: [allowedSortFields] },
    errorMessage: `SortBy must be one of: ${allowedSortFields.join(", ")}`,
  },
  order: {
    in: "query",
    optional: true,
    isIn: { options: [["asc", "desc"]] },
    errorMessage: "Order must be either 'asc' or 'desc'",
  },
});

const getDoctorsSchema = getPaginationSchema([
  "firstName",
  "lastName",
  "email",
  "createdAt",
  "specialization",
  "licenseNumber",
]);

const getPatientsSchema = getPaginationSchema([
  "firstName",
  "lastName",
  "email",
  "createdAt",
  "dateOfBirth",
  "placeOfBirth",
]);

const getUserByIdSchema = {
  id: mongoIdSchema,
};

const updateProfileSchema = {
  firstName: {
    ...optionalStringSchema,
    isAlpha: true,
    errorMessage: "First name must be a string of letters if provided",
  },
  lastName: {
    ...optionalStringSchema,
    isAlpha: true,
    errorMessage: "Last name must be a string of letters if provided",
  },
  email: {
    in: "body",
    optional: { options: { nullable: true } },
    isEmail: true,
    errorMessage: "Must be a valid email if provided",
    normalizeEmail: true,
  },
  phone: {
    in: "body",
    optional: { options: { nullable: true } },
    isMobilePhone: true,
    errorMessage: "Must be a valid phone number if provided",
  },
  gender: {
    in: "body",
    optional: { options: { nullable: true } },
    isString: true,
    isIn: { options: [["male", "female"]] },
    errorMessage: "Gender must be either male or female if provided",
  },
  address: {
    ...optionalStringSchema,
    errorMessage: "Address must be a string if provided",
  },
  licenseNumber: {
    ...optionalStringSchema,
    errorMessage: "License number must be a string if provided",
  },
  specialization: {
    ...optionalStringSchema,
    errorMessage: "Specialization must be a string if provided",
  },
  dateOfBirth: {
    in: "body",
    optional: { options: { nullable: true } },
    isISO8601: true,
    errorMessage: "Date of birth must be a valid ISO 8601 date if provided",
  },
  placeOfBirth: {
    ...optionalStringSchema,
    errorMessage: "Place of birth must be a string if provided",
  },
  emergencyContact: {
    in: "body",
    optional: { options: { nullable: true } },
    isObject: true,
    errorMessage: "Emergency contact must be an object if provided",
  },
  "emergencyContact.name": {
    in: "body",
    optional: { options: { nullable: true } },
    isString: true,
    errorMessage: "Emergency contact name must be a string",
  },
  "emergencyContact.phone": {
    in: "body",
    optional: { options: { nullable: true } },
    isMobilePhone: true,
    errorMessage: "Emergency contact phone must be a valid phone number",
  },
};

export default {
  getDoctorsSchema,
  getPatientsSchema,
  getUserByIdSchema,
  updateProfileSchema,
};
