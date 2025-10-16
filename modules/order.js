// Importation de la connexion DB
const db = require('../config/db');

// Fonction pour créer une commande
exports.create = async (orderData) => {
  // Insertion de la commande avec les données fournies
  await db.query('INSERT INTO orders SET ?', orderData);
};

// Fonction pour mettre à jour une commande
exports.update = async (order_id, updates) => {
  // Mise à jour avec les champs fournis
  await db.query('UPDATE orders SET ? WHERE order_id = ?', [updates, order_id]);
};

// Fonction pour trouver les commandes par utilisateur
exports.findByUserId = async (user_id) => {
  // Requête pour sélectionner les commandes de l'utilisateur
  const [rows] = await db.query('SELECT * FROM orders WHERE user_id = ?', [user_id]);
  // Retourne la liste
  return rows;
};