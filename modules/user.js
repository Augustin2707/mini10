// Importation de la connexion DB
const db = require('../config/db');

// Fonction pour trouver un utilisateur par ID
exports.findById = async (user_id) => {
  // Requête SQL pour sélectionner l'utilisateur
  const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [user_id]);
  // Retourne le premier résultat ou null
  return rows[0] || null;
};

// Fonction pour trouver un utilisateur par login
exports.findByLogin = async (login) => {
  // Requête SQL pour sélectionner par login
  const [rows] = await db.query('SELECT * FROM users WHERE login = ?', [login]);
  // Retourne le premier résultat ou null
  return rows[0] || null;
};