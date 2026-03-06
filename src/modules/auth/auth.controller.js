//Handles login/signup HTTP requests

async function register(res, req) {
  console.log("Register endpoint working...");
}

async function login(res, req) {
  console.log("Login endpoint working...");
}

async function logout(res, req) {
  console.log("Logout endpoint working...");
}

async function refreshToken(res, req) {
  console.log("Refresh Token endpoint working...");
}

async function verifyOTP(res, req) {
  console.log("Verify OTP endpoint working...");
}

export default { register, login, logout, refreshToken, verifyOTP };
