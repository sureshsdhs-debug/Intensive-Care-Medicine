const express = require('express');
const { addResult,allResult, deleteResult,editResult,viewResult,getThisUserResult} = require('../controllers/resultController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/add', addResult);
router.get('/get-all',allResult);
router.get('/get-thisuser-result',getThisUserResult);
router.delete('/delete/:id',deleteResult);
router.put('/edit/:id',editResult);
router.get('/view/:id',viewResult);

module.exports = router;