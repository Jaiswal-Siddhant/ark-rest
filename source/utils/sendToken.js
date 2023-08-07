// Create Token and saving in cookie
const sendToken = (auth, user, statusCode, res) => {
	const jwt = require('jsonwebtoken');
	const token = jwt.sign({ id: user._id }, auth.secret, {
		expiresIn: auth.cookieExpire || 900,
	});

	// options for cookie
	const options = {
		expires: new Date(
			Date.now() + (auth.cookieExpire || 900) * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};

	res.status(statusCode).cookie('token', token, options).json({
		success: true,
		user,
		token,
	});
};

module.exports = { sendToken };
