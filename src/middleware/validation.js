import { checkSchema, validationResult } from "express-validator";

function validate(schema) {
	return [
		checkSchema(schema),
		(req, res, next) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({
					message: "Validation failed",
					errors: errors.array(),
				});
			}
			next();
		},
	];
}

function catchInvalidJSON(err, req, res, next) {
	if (
		err instanceof SyntaxError &&
		err.status === 400 &&
		err.body !== undefined
	) {
		return res.status(400).json({
			status: "fail",
			message: err,
		});
	}

	next();
}

export { catchInvalidJSON, validate };
