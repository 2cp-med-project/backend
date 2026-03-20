import { Doctor } from "../users/doctor.model.js";

export const connectUser = async (userId, socketId) => {
	const existingUser = await Doctor.findById(userId);

	if (!existingUser) {
		throw new Error("User not found in the database.");
	}

	existingUser.socketId = socketId;
	return await existingUser.save();
};

export const disconnectUser = async (socketId) => {
	const user = await Doctor.findOne({ socketId });

	if (user) {
		user.socketId = null;
		await user.save();
	}
};
