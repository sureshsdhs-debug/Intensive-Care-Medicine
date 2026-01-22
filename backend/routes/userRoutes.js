const express = require('express');
const { getUsers, addUser,loginUser,logoutUser } = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();


router.get('/all',authMiddleware, getUsers);
router.post('/add', addUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);

module.exports = router;