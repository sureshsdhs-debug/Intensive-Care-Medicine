const express = require("express");
const {
  addStudent,
  getAll,
  loginStudent,
  logoutStudent,
  editStudent,
  deleteStudent,
  profile,
} = require("../controllers/studentController");

const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// 🔓 Public routes
router.post("/login", loginStudent);
router.get("/logout", logoutStudent);

// 🔐 Admin protected routes
router.post("/add", addStudent);
router.get("/get-all", authMiddleware, getAll);
router.put("/edit/:id", authMiddleware, editStudent);
router.delete("/delete/:id", authMiddleware, deleteStudent);

// 🔐 Authenticated user route (admin OR student)
router.get("/profile", authMiddleware, profile);

module.exports = router;
