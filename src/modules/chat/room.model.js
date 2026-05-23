import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
	participants: [{ type: String, required: true }],
});

export default mongoose.model("Room", roomSchema);
