const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ❌ No Authorization header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token missing",
    });
  }

  // ✅ Extract real token
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔐 Admin role check (role = 1)
    if (!decoded.userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied!",
      });
    }

    // const student = await Student.findById(decoded.userId);


    // const validSession = student.activeSessions.find(
    //   (s) => s.token === token
    // );

    // if (!validSession) {
    //   return res.status(401).json({
    //     message: "Logged out due to login from another device",
    //   });
    // }
 
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
