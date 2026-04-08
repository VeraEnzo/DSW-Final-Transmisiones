const router = require('express').Router();
const { list, create, getById, getBySerie, update } = require('../controllers/cajasController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', list);
router.post('/', create);
router.get('/serie/:numero_serie', getBySerie);
router.get('/:id', getById);
router.put('/:id', update);

module.exports = router;
