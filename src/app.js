import express from "express";

const PORT = process.env.PORT || 5000;
express().listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
