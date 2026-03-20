import { Doctor } from "./doctor.model.js";

export const identifyDoctor = async (req, res) => {
	try {
		const {
			firstName,
			lastName,
			userName,
			gender,
			email,
			phoneNumber,
			password,
			specialty,
			degreeId,
		} = req.body;

		let doctor = await Doctor.findOne({
			userName: userName.toLowerCase(),
		});

		if (!doctor) {
			doctor = await Doctor.create({
				firstName,
				lastName,
				userName,
				gender,
				email,
				phoneNumber,
				password,
				specialty,
				degreeId,
				socketId: null,
			});
		}

		res.status(200).json(doctor);
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({
				message: "A user with this Email or Degree ID already exists.",
			});
		}

		console.error("Error identifying doctor:", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const getAllDoctors = async (req, res) => {
	const doctors = await Doctor.find();
	res.status(200).json(doctors);
};
