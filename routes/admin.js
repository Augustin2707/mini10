const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Middleware pour vérifier si admin
const isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/auth/login');
  }
  next();
};

router.get('/', isAdmin, adminController.getAdminDashboard);
router.post('/create-user', isAdmin, adminController.createUser);
router.get('/users', isAdmin, adminController.getAllUsers); // Pour lister tous les users

module.exports = router;