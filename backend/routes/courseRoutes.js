const express = require('express');
const { addCourse,allCourse, deleteCourse,editCourse} = require('../controllers/courseController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/add',authMiddleware,addCourse);
router.get('/get-all',allCourse);
router.delete('/delete/:id',deleteCourse);
router.put('/edit/:id',editCourse);

module.exports = router;