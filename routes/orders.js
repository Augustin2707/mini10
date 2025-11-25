const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getOrders);
router.get('/create', orderController.getCreateOrder);
router.post('/create', orderController.createOrder);
router.post('/validate', orderController.validateOrder);
router.post('/reject', orderController.rejectOrder);
router.post('/receive', orderController.receiveOrder);
router.post('/deliver', orderController.deliverOrder); 
router.post('/stock-validate', orderController.validateStockEntry);
router.get('/suivi', orderController.getSuiviChef);
router.get('/suivi-service', orderController.getSuiviService);
router.get('/products-by-account/:account_code', orderController.getProductsByAccount);

module.exports = router;