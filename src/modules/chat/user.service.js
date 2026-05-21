import Doctor from "../users/doctor.model.js";

async function connectUser(userId, socketId) {
	const existingUser = await Doctor.findById(userId);

	if (!existingUser) {
		throw new Error("User not found in the database.");
	}

	existingUser.socketId = socketId;
	return await existingUser.save();
}

async function disconnectUser(socketId) {
	const user = await Doctor.findOne({ socketId });

	if (user) {
		user.socketId = null;
		await user.save();
	}
}

export default { connectUser, disconnectUser };
