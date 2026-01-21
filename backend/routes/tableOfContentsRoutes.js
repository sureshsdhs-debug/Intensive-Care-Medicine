const express = require('express');
const { addTableOfContents, allTableOfContents, deleteTableOfContents, editTableOfContents } = require('../controllers/tableOfContentsController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/add', authMiddleware, addTableOfContents);
router.get('/get-all', authMiddleware, allTableOfContents);
router.delete('/delete/:id', authMiddleware, deleteTableOfContents);
router.put('/edit/:id', authMiddleware, editTableOfContents);

module.exports = router;