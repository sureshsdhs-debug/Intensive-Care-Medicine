const express = require('express');
const { verifyToken} = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();


router.get('/verify-token', verifyToken); 

module.exports = router;