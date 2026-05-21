import { createMessage, getMessagesByRoomId } from "./message.service.js";
import {
  addUserToRoom,
  createRoom,
  findRoomByParticipants,
} from "./room.service.js";
import { connectUser } from "./user.service.js";

export const initiateChat = async (req, res) => {
  try {
    const { currentUserId, targetUserId } = req.body;

    if (!currentUserId) {
      return res
        .status(400)
        .json({ success: false, error: "currentUserId is required" });
    }

    if (!targetUserId) {
      return res
        .status(400)
        .json({ success: false, error: "targetUserId is required" });
    }

    let room = await findRoomByParticipants(currentUserId, targetUserId);
    if (!room) {
      room = await createRoom([currentUserId, targetUserId]);
    }

    res.status(200).json({ message: "Room ready", roomId: room._id, room });
  } catch (error) {
    console.error("Error in initiateChat:", error);

    res.status(500).json({ message: "Internal server error" });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { userId, socketId, roomId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "userId is required" });
    }

    if (!socketId) {
      return res
        .status(400)
        .json({ success: false, error: "socketId is required" });
    }

    if (!roomId) {
      return res
        .status(400)
        .json({ success: false, error: "roomId is required" });
    }

    let user = await connectUser(userId, socketId);
    await addUserToRoom(roomId, userId);

    res.status(200).json({ message: "User joined room", user });
  } catch (error) {
    console.error("Error in joinRoom:", error);

    res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { senderId, roomId, doctorName, text } = req.body;

    if (!senderId || !roomId || !doctorName || !text) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let message = await createMessage(roomId, senderId, doctorName, text);
    res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    let messages = await getMessagesByRoomId(roomId);
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getRoomMessages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
