const mongoIdValidation = {
  notEmpty: true,
  isMongoId: true,
};

const optionalStringValidation = {
  optional: { options: { nullable: true } },
  isString: true,
};

const dateValidation = {
  notEmpty: true,
  isISO8601: true,
  errorMessage: "Must be a valid ISO 8601 date string",
  toDate: true,
};

const optionalDateValidation = {
  optional: { options: { nullable: true } },
  isISO8601: true,
  toDate: true,
};

const createConsultationValidation = {
  doctorId: {
    in: "body",
    ...mongoIdValidation,
    errorMessage: "Doctor ID is required and must be a valid ObjectId",
  },
  patientId: {
    in: "body",
    ...mongoIdValidation,
    errorMessage: "Patient ID is required and must be a valid ObjectId",
  },
  date: {
    in: "body",
    ...dateValidation,
  },
  status: {
    in: "body",
    optional: { options: { nullable: true } },
    isString: true,
    isIn: {
      options: [["scheduled", "completed", "cancelled", "in-progress"]],
    },
    errorMessage:
      "Status must be one of: scheduled, completed, cancelled, in-progress",
  },
  severity: {
    in: "body",
    optional: { options: { nullable: true } },
    isString: true,
    isIn: {
      options: [["light", "mild", "moderate", "severe"]],
    },
    errorMessage: "Severity must be one of: light, mild, moderate, severe",
  },
  typeofvisit: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Type of visit must be a string if provided",
  },
  motive: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Motive must be a string if provided",
  },
  symptoms: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Symptoms must be a string if provided",
  },
  followUpDate: {
    in: "body",
    ...optionalDateValidation,
    errorMessage:
      "Follow-up date must be a valid ISO 8601 date string if provided",
  },
  diagnosis: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Diagnosis must be a string if provided",
  },
  treatmentPlan: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Treatment plan must be a string if provided",
  },
  notes: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Notes must be a string if provided",
  },
  bloodPressure: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Blood pressure must be a string if provided",
  },
  heartRate: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Heart rate must be a string if provided",
  },
  respiratoryRate: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Respiratory rate must be a string if provided",
  },
  temperature: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Temperature must be a string if provided",
  },
  weight: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Weight must be a string if provided",
  },
  systemReview: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "System review must be a string if provided",
  },
  additionalTests: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Additional tests must be a string if provided",
  },
};

const updateConsultationValidation = {
  consultationId: {
    in: "params",
    ...mongoIdValidation,
    errorMessage: "A valid Consultation ID is required in the URL parameters",
  },
  date: {
    in: "body",
    ...optionalDateValidation,
    errorMessage: "Date must be a valid ISO 8601 date string if provided",
  },
  status: {
    in: "body",
    optional: { options: { nullable: true } },
    isString: true,
    isIn: {
      options: [["scheduled", "completed", "cancelled", "in-progress"]],
    },
    errorMessage:
      "Status must be one of: scheduled, completed, cancelled, in-progress",
  },
  severity: {
    in: "body",
    optional: { options: { nullable: true } },
    isString: true,
    isIn: {
      options: [["light", "mild", "moderate", "severe"]],
    },
    errorMessage: "Severity must be one of: light, mild, moderate, severe",
  },
  typeofvisit: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Type of visit must be a string if provided",
  },
  motive: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Motive must be a string if provided",
  },
  symptoms: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Symptoms must be a string if provided",
  },
  followUpDate: {
    in: "body",
    ...optionalDateValidation,
    errorMessage:
      "Follow-up date must be a valid ISO 8601 date string if provided",
  },
  diagnosis: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Diagnosis must be a string if provided",
  },
  treatmentPlan: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Treatment plan must be a string if provided",
  },
  notes: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Notes must be a string if provided",
  },
  bloodPressure: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Blood pressure must be a string if provided",
  },
  heartRate: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Heart rate must be a string if provided",
  },
  respiratoryRate: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Respiratory rate must be a string if provided",
  },
  temperature: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Temperature must be a string if provided",
  },
  weight: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Weight must be a string if provided",
  },
  systemReview: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "System review must be a string if provided",
  },
  additionalTests: {
    in: "body",
    ...optionalStringValidation,
    errorMessage: "Additional tests must be a string if provided",
  },
};

const getConsultationByIdValidation = {
  consultationId: {
    in: "params",
    ...mongoIdValidation,
    errorMessage: "A valid Consultation ID is required in the URL parameters",
  },
};

const getConsultationsValidation = {
  patientId: {
    in: "params",
    ...mongoIdValidation,
    errorMessage: "A valid Patient ID is required in the URL parameters",
  },
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
    errorMessage: "SortBy must be a string",
  },
  order: {
    in: "query",
    optional: true,
    isIn: {
      options: [["asc", "desc"]],
    },
    errorMessage: "Order must be either 'asc' or 'desc'",
  },
};

const deleteConsultationValidation = {
  consultationId: {
    in: "params",
    ...mongoIdValidation,
    errorMessage: "A valid Consultation ID is required in the URL parameters",
  },
};

export default {
  createConsultationValidation,
  updateConsultationValidation,
  getConsultationByIdValidation,
  getConsultationsValidation,
  deleteConsultationValidation,
};
