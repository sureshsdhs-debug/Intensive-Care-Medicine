const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

exports.generateTokenAndSetCookie = (userId, role, res) => {
  const token = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: "15d" }
  );

  res.cookie("jwt", token, {
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 Days time
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",   // 🔥 important
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return token;
};

exports.getIdFromToken = (req, res) => {
//   const token = req.cookies.jwt;

//   if (!token) return null;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];  

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // { userId, role }
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return null;
  }
};
