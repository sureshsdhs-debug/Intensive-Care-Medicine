const express = require('express'); 
const { authMiddleware } = require('../middlewares/authMiddleware');
const { getUsers, addUser, loginUser, logoutUser } = require('../controllers/userController');
const router = express.Router();


router.get('/all',authMiddleware, getUsers);
router.post('/add',authMiddleware, addUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);

module.exports = router;
