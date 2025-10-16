const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');  // ← Import sans 's'

router.get('/', orderController.getOrders);
router.get('/create', orderController.getCreateOrder);
router.post('/create', orderController.createOrder);
router.post('/validate', orderController.validateOrder);
router.post('/reject', orderController.rejectOrder);
router.post('/receive', orderController.receiveOrder);
router.post('/stock-validate', orderController.validateStockEntry);  // Nouveau pour stock_entries
router.get('/suivi', orderController.getSuiviChef);  // Nouveau
router.get('/suivi-service', orderController.getSuiviService);  // ← Corrigé : sans 's'

module.exports = router;