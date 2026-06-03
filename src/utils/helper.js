function catchInvalidJSON(err, req, res, next) {
	if (
		err instanceof SyntaxError &&
		err.status === 400 &&
		err.body !== undefined
	) {
		return res.status(400).json({
			status: "fail",
			message: err,
		});
	}

	next();
}

export default catchInvalidJSON;
