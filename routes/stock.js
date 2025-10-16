const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

router.get('/', stockController.getStockIndex);
router.post('/propose-add', stockController.proposeStockAdd);  // Nouveau
router.post('/deliver', stockController.deliverOrder);
router.get('/suivi', stockController.getSuivi);  // Nouveau
router.get('/edit/:stock_id', stockController.getEditStock);
router.post('/update', stockController.updateStock);
router.post('/validate-order', stockController.validateOrder);  // Pour valider commande
router.post('/validate-stock-entry', stockController.validateStockEntry);  // Pour valider entrée stock
module.exports = router;