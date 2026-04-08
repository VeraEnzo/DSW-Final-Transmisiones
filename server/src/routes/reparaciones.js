const router = require('express').Router();
const { create, getById, update, remove } = require('../controllers/reparacionesController');
const { addItem: addPresupuesto, updateItem: updatePresupuesto, deleteItem: deletePresupuesto, getPDF } = require('../controllers/presupuestoController');
const { addItem, updateItem, deleteItem } = require('../controllers/itemsController');
const { uploadFoto, deleteFoto } = require('../controllers/fotosController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.use(authenticate);

// Reparaciones CRUD
router.post('/', create);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', requireAdmin, remove);

// Presupuesto items
router.post('/:id/presupuesto', addPresupuesto);
router.get('/:id/presupuesto/pdf', getPDF);

// Items reparados
router.post('/:id/items', addItem);

// Fotos
router.post('/:id/fotos', uploadFoto);

module.exports = router;
