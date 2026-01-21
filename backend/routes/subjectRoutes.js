const express = require('express');
const { addSubject, allSubject, deleteSubject, editSubject } = require('../controllers/subjectController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/add', authMiddleware, addSubject);
router.get('/get-all', authMiddleware, allSubject);
router.delete('/delete/:id', authMiddleware, deleteSubject);
router.put('/edit/:id', authMiddleware, editSubject);

module.exports = router;