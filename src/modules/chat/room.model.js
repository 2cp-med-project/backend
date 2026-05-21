import { Schema, model } from "mongoose";

const RoomSchema = new Schema({
  participants: [{ type: String, required: true }],
});

export const Room = model("Room", RoomSchema);
