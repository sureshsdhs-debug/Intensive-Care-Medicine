const express = require("express");
const upload = require("../middlewares/upload");
const { authMiddleware } = require("../middlewares/authMiddleware");

const {
  addQuestion,
  allQuestion,
  deleteQuestion,
  editQuestion,
  viewQuestion,
} = require("../controllers/questionController");

const router = express.Router();

router.post(
  "/add",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "answeraudio", maxCount: 1 },
  ]),
  addQuestion
);

router.put(
  "/edit/:id",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "answeraudio", maxCount: 1 },
  ]),
  editQuestion
);

router.get("/get-all", authMiddleware, allQuestion);
router.get("/view/:id", viewQuestion);
router.delete("/delete/:id", authMiddleware, deleteQuestion);

module.exports = router;
