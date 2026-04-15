const router = require('express').Router();
const { list, create, getById, update, remove } = require('../controllers/clientesController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', list);
router.post('/', create);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', requireAdmin, remove);

module.exports = router;
