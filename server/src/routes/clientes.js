const router = require('express').Router();
const { list, create, getById, update } = require('../controllers/clientesController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', list);
router.post('/', create);
router.get('/:id', getById);
router.put('/:id', update);

module.exports = router;
