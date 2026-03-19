import mongoose from "mongoose";

// Initialize Mongoose conncetion
const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("✅ MongoDB Connected via Mongoose");

		return mongoose.connection.getClient();
	} catch (error) {
		console.error("❌ MongoDB Connection Error:", error);
		process.exit(1);
	}
};

export default connectDB;
