const patientIdvalidation = {
	in: "body",
	notEmpty: true,
	isMongoId: true,
	errorMessage: "Patient ID is required and must be a valid MongoDB ObjectId",
};

const accessIdValidation = {
	in: "params",
	notEmpty: true,
	isMongoId: true,
	errorMessage: "Access ID is required and must be a valid MongoDB ObjectId",
};

const requestAccessValidation = {
	patientId: patientIdvalidation,
};

const respondAccessValidation = {
	accepted: {
		in: "body",
		notEmpty: true,
		isBoolean: true,
		errorMessage: "Accepted must be a boolean",
		toBoolean: true,
	},
	id: accessIdValidation,
};

const removeAccessValidation = {
	id: accessIdValidation,
};

export default {
	requestAccessValidation,
	respondAccessValidation,
	removeAccessValidation,
};
