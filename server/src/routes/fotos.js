const router = require('express').Router();
const { deleteFoto } = require('../controllers/fotosController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.delete('/:id', deleteFoto);

module.exports = router;
