import { checkSchema, validationResult } from "express-validator";

function validate(schema) {
  return [
    checkSchema(schema),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: "Validation failed", errors: errors.array() });
      }
      next();
    },
  ];
}

export default validate;
