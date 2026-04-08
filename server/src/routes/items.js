const router = require('express').Router();
const { updateItem, deleteItem } = require('../controllers/itemsController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;
