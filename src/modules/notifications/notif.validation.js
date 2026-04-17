const fmcTemplateValidation = {
  in: ["body"],
  notEmpty: true,
  isString: true,
  errorMessage: "FCM token is required and must be a string",
};

export default {
  fmcTemplateValidation,
};
