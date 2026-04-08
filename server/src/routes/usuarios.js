const router = require('express').Router();
const { list, update, remove } = require('../controllers/usuariosController');
const { register } = require('../controllers/authController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.use(authenticate, requireAdmin);
router.get('/', list);
router.post('/', register);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
