const router = require('express').Router();
const { login, register, me } = require('../controllers/authController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.post('/login', login);
router.post('/register', authenticate, requireAdmin, register);
router.get('/me', authenticate, me);

module.exports = router;
