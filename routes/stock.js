const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

router.get('/', stockController.getStockIndex);
router.post('/propose-add', stockController.proposeStockAdd);
router.post('/deliver-order', stockController.deliverOrder); 
router.get('/stocks-actuels', stockController.getStocksActuels);
router.get('/suivi', stockController.getSuivi);
router.get('/edit/:stock_id', stockController.getEditStock);
router.post('/update', stockController.updateStock);
router.post('/validate-stock-entry', stockController.validateStockEntry);
router.get('/products-by-account/:account_code', stockController.getProductsByAccount);

module.exports = router;