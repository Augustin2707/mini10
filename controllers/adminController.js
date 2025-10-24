const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getAdminDashboard = (req, res) => {
  // Récupérer tous les users
  db.query('SELECT * FROM users ORDER BY user_id DESC', (err, users) => {
    if (err) throw err;
    res.render('admin/dashboard', { users, user: req.session.user });
  });
};

exports.createUser = (req, res) => {
  const { login, password, role } = req.body;
  if (!['comptable', 'chef_principal', 'chef_service'].includes(role)) {
    return res.render('admin/dashboard', { 
      users: [], 
      error: 'Rôle invalide ! Seuls comptable, chef_principal ou chef_service sont autorisés.',
      user: req.session.user 
    });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) throw err;
    db.query('INSERT INTO users (login, password, role) VALUES (?, ?, ?)', [login, hashedPassword, role], (err) => {
      if (err) {
        return res.render('admin/dashboard', { 
          users: [], 
          error: 'Erreur : Login déjà utilisé ?',
          user: req.session.user 
        });
      }
      // Rediriger avec succès
      res.redirect('/admin');
    });
  });
};

exports.getAllUsers = (req, res) => {
  db.query('SELECT * FROM users ORDER BY user_id DESC', (err, users) => {
    if (err) throw err;
    res.render('admin/users', { users, user: req.session.user });
  });
};