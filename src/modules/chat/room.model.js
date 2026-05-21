import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
	participants: [{ type: String, required: true }],
});

export default mongoose.model("Room", RoomSchema);
