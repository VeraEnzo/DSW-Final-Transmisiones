const router = require('express').Router();
const { list, update, remove, cambiarPassword, solicitarReset, listarSolicitudes, resetearPassword } = require('../controllers/usuariosController');
const { register } = require('../controllers/authController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

// Público — solicitar reset de contraseña
router.post('/solicitar-reset', solicitarReset);

// Requiere auth propia (cualquier usuario)
router.put('/cambiar-password', authenticate, cambiarPassword);

// Solo admin
router.use(authenticate, requireAdmin);
router.get('/', list);
router.post('/', register);
router.put('/:id', update);
router.delete('/:id', remove);
router.get('/solicitudes-reset', listarSolicitudes);
router.post('/solicitudes-reset/:id/resetear', resetearPassword);

module.exports = router;
