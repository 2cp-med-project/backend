import Doctor from "./doctor.model.js";
import Patient from "./patient.model.js";

async function getPatients(req, res) {
	// #swagger.tags = ['Users']
	// #swagger.summary = 'Get a paginated list of patients'
	// #swagger.security = [{ BearerAuth: [] }]
	// #swagger.description = 'Roles: doctor, patient'
	// #swagger.parameters['page'] = { description: 'Page number (starting from 0)', type: 'integer', default: 0 }
	// #swagger.parameters['limit'] = { description: 'Number of items per page', type: 'integer', default: 10 }
	// #swagger.parameters['order'] = { description: 'Sort order (asc or desc)', type: 'string', default: 'asc' }
	// #swagger.parameters['sortBy'] = { description: 'Field to sort by', type: 'string', default: 'firstName' }

	const {
		page = "0",
		limit = "10",
		order = "asc",
		sortBy = "firstName",
	} = req.query || {};

	const allowedSortFields = [
		"firstName",
		"lastName",
		"email",
		"createdAt",
		"dateOfBirth",
		"placeOfBirth",
	];

	const returnedFields = {
		firstName: 1,
		lastName: 1,
		email: 1,
		phone: 1,
		dateOfBirth: 1,
		placeOfBirth: 1,
		gender: 1,
	};

	try {
		if (!allowedSortFields.includes(sortBy)) {
			return res.status(400).json({ message: "Invalid sortBy field" });
		}

		if (!["asc", "desc"].includes(order)) {
			return res.status(400).json({ message: "Invalid order value" });
		}

		const p = parseInt(page);
		const l = parseInt(limit);
		const o = order === "asc" ? 1 : -1;

		if (isNaN(p) || isNaN(l) || p < 0 || l <= 0) {
			return res
				.status(400)
				.json({ message: "Invalid page or limit value" });
		}

		const patients = await Patient.find({}, returnedFields)
			.sort({ [sortBy]: o })
			.skip(p * l)
			.limit(l);

		res.status(200).json(patients);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

async function getDoctors(req, res) {
	// #swagger.tags = ['Users']
	// #swagger.summary = 'Get a paginated list of doctors'
	// #swagger.security = [{ BearerAuth: [] }]
	// #swagger.description = 'Roles: any'
	// #swagger.parameters['page'] = { description: 'Page number (starting from 0)', type: 'integer', default: 0 }
	// #swagger.parameters['limit'] = { description: 'Number of items per page', type: 'integer', default: 10 }
	// #swagger.parameters['order'] = { description: 'Sort order (asc or desc)', type: 'string', default: 'asc' }
	// #swagger.parameters['sortBy'] = { description: 'Field to sort by', type: 'string', default: 'firstName' }

	const {
		page = "0",
		limit = "10",
		order = "asc",
		sortBy = "firstName",
	} = req.query || {};

	const allowedSortFields = [
		"firstName",
		"lastName",
		"email",
		"createdAt",
		"specialization",
		"licenseNumber",
	];

	const returnedFields = {
		firstName: 1,
		lastName: 1,
		email: 1,
		phone: 1,
		specialization: 1,
		createdAt: 1,
	};

	try {
		if (!allowedSortFields.includes(sortBy)) {
			return res.status(400).json({ message: "Invalid sortBy field" });
		}

		if (!["asc", "desc"].includes(order)) {
			return res.status(400).json({ message: "Invalid order value" });
		}

		const p = parseInt(page);
		const l = parseInt(limit);
		const o = order === "asc" ? 1 : -1;

		if (isNaN(p) || isNaN(l) || p < 0 || l <= 0) {
			return res
				.status(400)
				.json({ message: "Invalid page or limit value" });
		}

		const doctors = await Doctor.find({}, returnedFields)
			.sort({ [sortBy]: o })
			.skip(p * l)
			.limit(l);

		res.status(200).json(doctors);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

async function getPatientById(req, res) {
	// #swagger.tags = ['Users']
	// #swagger.summary = 'Get patient details by ID'
	// #swagger.security = [{ BearerAuth: [] }]
	// #swagger.description = 'Roles: doctor'

	const { id } = req.params || {};
	const patients = req.user.patients || [];
	const returnedFields = {
		firstName: 1,
		lastName: 1,
		email: 1,
		phone: 1,
		dateOfBirth: 1,
		placeOfBirth: 1,
		gender: 1,
	};

	try {
		if (!id) {
			return res.status(400).json({ message: "Patient ID is required" });
		}

		if (!patients.includes(id)) {
			return res.status(403).json({ message: "Access denied" });
		}

		const patient = await Patient.findById(id, returnedFields);

		if (!patient) {
			return res.status(404).json({ message: "Patient not found" });
		}

		res.status(200).json(patient);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

async function getDoctorById(req, res) {
	// #swagger.tags = ['Users']
	// #swagger.summary = 'Get doctor details by ID'
	// #swagger.security = [{ BearerAuth: [] }]
	// #swagger.description = 'Roles: any'

	const { id } = req.params || {};
	const returnedFields = {
		firstName: 1,
		lastName: 1,
		email: 1,
		phone: 1,
		specialization: 1,
		address: 1,
		createdAt: 1,
	};

	try {
		if (!id) {
			return res.status(400).json({ message: "Doctor ID is required" });
		}

		const doctor = await Doctor.findById(id, returnedFields);

		if (!doctor) {
			return res.status(404).json({ message: "Doctor not found" });
		}

		res.status(200).json(doctor);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

async function getProfile(req, res) {
	// #swagger.tags = ['Users']
	// #swagger.summary = 'Get the current logged-in user details'
	// #swagger.security = [{ BearerAuth: [] }]
	// #swagger.description = 'Roles: doctor, patient'

	const { id, role } = req.user || {};
	try {
		const returnedFields =
			role === "doctor"
				? {
						firstName: 1,
						lastName: 1,
						licenseNumber: 1,
						specialization: 1,
						email: 1,
						phone: 1,
						address: 1,
						patients: 1,
						createdAt: 1,
					}
				: {
						firstName: 1,
						lastName: 1,
						email: 1,
						phone: 1,
						dateOfBirth: 1,
						placeOfBirth: 1,
						gender: 1,
						address: 1,
						emergencyContacts: 1,
						medicalResume: 1,
						doctorsAccess: 1,
						createdAt: 1,
					};

		const user =
			role === "doctor"
				? await Doctor.findById(id, returnedFields)
				: await Patient.findById(id, returnedFields);
		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}
		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

async function updateProfile(req, res) {
	// #swagger.tags = ['Users']
	// #swagger.summary = 'Update the current logged-in user details'
	// #swagger.security = [{ BearerAuth: [] }]
	// #swagger.description = 'Roles: doctor, patient'

	const { id, role } = req.user || {};
	const newData = req.body || {};

	const allowFields =
		role === "doctor"
			? [
					"firstName",
					"lastName",
					"email",
					"phone",
					"address",
					"specialization",
				]
			: [
					"firstName",
					"lastName",
					"phone",
					"email",
					"address",
					"gender",
					"dateOfBirth",
					"placeOfBirth",
					"emergencyContacts",
					"medicalResume",
				];
	try {
		if (!id || !role || !["doctor", "patient"].includes(role)) {
			res.status(400).json({ message: "Invalid user data" });
			return;
		}

		const update = {};
		for (const field in newData) {
			if (allowFields.includes(field) && newData[field] !== undefined) {
				update[field] = newData[field];
			}
		}

		if (Object.keys(update).length === 0) {
			res.status(400).json({ message: "No valid fields to update" });
			return;
		}

		const opts = { new: true, runValidators: true };

		const updatedUser =
			role === "doctor"
				? await Doctor.findByIdAndUpdate(id, update, opts).select(
						allowFields,
					)
				: await Patient.findByIdAndUpdate(id, update, opts).select(
						allowFields,
					);

		if (!updatedUser) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		res.status(200).json(updatedUser);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

export default {
	getPatients,
	getDoctors,
	getPatientById,
	getDoctorById,
	getProfile,
	updateProfile,
};
