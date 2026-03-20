import mongoose, { Schema } from "mongoose";

const RoomSchema = new Schema({
	participants: [{ type: String, required: true }],
});

export const Room = mongoose.model("Room", RoomSchema);
