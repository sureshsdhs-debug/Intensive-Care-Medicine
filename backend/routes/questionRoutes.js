// routes/questionRoutes.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const {
  addQuestion,
  allQuestion,
  deleteQuestion,
  editQuestion,
  viewQuestion
} = require('../controllers/questionController');

const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// ----------------------
// 1️⃣ Ensure uploads folder exists
// ----------------------
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ----------------------
// 2️⃣ Multer Storage Setup
// ----------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${unique}${ext}`);
  }
});

// fileFilter: allow image for 'image' field and audio for 'answeraudio' field
const fileFilter = (req, file, cb) => {
  const field = file.fieldname;
  const mimetype = file.mimetype.toLowerCase();
  if (field === 'image') {
    // image allowed types
    if (mimetype.startsWith('image/')) return cb(null, true);
    return cb(new Error('Only image files allowed for image field'), false);
  } else if (field === 'answeraudio') {
    // audio allowed
    if (mimetype.startsWith('audio/')) return cb(null, true);
    return cb(new Error('Only audio files allowed for answeraudio field'), false);
  } else {
    return cb(new Error('Unexpected field'), false);
  }
};

// limits - can set fileSize and number of files per field later via upload.fields
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // global max 10MB, per-field checks below optionally
});

// ----------------------
// 3️⃣ Routes
// ----------------------

// add: accepts optional image and optional answeraudio
router.post('/add',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'answeraudio', maxCount: 1 }
  ]),
  addQuestion
);

// edit: accepts optional image and optional answeraudio
router.put('/edit/:id',authMiddleware,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'answeraudio', maxCount: 1 }
  ]), 
  editQuestion
);

router.get('/get-all',authMiddleware, allQuestion);

// change view to GET (recommended). If you prefer PUT keep your current signature but GET is semantically correct.
router.get('/view/:id', viewQuestion);

router.delete('/delete/:id', deleteQuestion);

module.exports = router;
