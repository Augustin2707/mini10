const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getLogin = (req, res) => {
  res.render('auth/login', { error: null });
};

exports.postLogin = (req, res) => {
  const { login, password } = req.body;
  db.query('SELECT * FROM users WHERE login = ?', [login], (err, users) => {
    if (err) throw err;
    if (users.length === 0) {
      return res.render('auth/login', { error: 'Utilisateur non trouvé' });
    }
    const user = users[0];
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) throw err;
      if (!match) {
        return res.render('auth/login', { error: 'Mot de passe incorrect' });
      }
      req.session.user = { user_id: user.user_id, login: user.login, role: user.role };
      if (user.role === 'comptable') {
        res.redirect('/stock');
      } else if (user.role === 'chef_principal') {
        res.redirect('/orders');
      } else if (user.role === 'chef_service') {
        res.redirect('/orders');
      } else {
        req.session.destroy();
        res.redirect('/auth/login');
      }
    });
  });
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
};

exports.getRegister = (req, res) => {
  res.render('auth/register', { error: null });
};

exports.postRegister = (req, res) => {
  const { login, password, role } = req.body;
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) throw err;
    db.query('INSERT INTO users (login, password, role) VALUES (?, ?, ?)', [login, hashedPassword, role], (err) => {
      if (err) {
        return res.render('auth/register', { error: 'Erreur lors de l’inscription (login déjà utilisé ?)' });
      }
      res.redirect('/auth/login');
    });
  });
};

// CORRIGÉ : Formatage des dates dans getProfile
exports.getProfile = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  const user_id = req.session.user.user_id;
  db.query(
    'SELECT oa.*, o.product_id, o.quantity, o.status, o.identifiant_utilisateur, p.name, oa.auteur_login, oa.action_date FROM order_actions oa JOIN orders o ON oa.order_id = o.order_id JOIN products p ON o.product_id = p.product_id WHERE oa.user_id = ? ORDER BY oa.action_date DESC',
    [user_id],
    (err, actions) => {
      if (err) throw err;
      
      // CORRECTION : Formate action_date avant render
      const actionsFormatees = actions.map(action => ({
        ...action,
        action_date: action.action_date ? new Date(action.action_date).toISOString().slice(0, 19).replace('T', ' ') : null
      }));
      
      // Debug optionnel : console.log(actionsFormatees[0]);
      
      res.render('profile', { actions: actionsFormatees, user: req.session.user });
    }
  );
};