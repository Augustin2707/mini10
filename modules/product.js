// Importation de la connexion DB
const db = require('../config/db');

// Fonction pour récupérer tous les produits
exports.getAll = async () => {
  // Requête SQL pour sélectionner tous les produits
  const [rows] = await db.query('SELECT * FROM products');
  // Retourne la liste des produits
  return rows;
};

// Fonction pour trouver un produit par ID
exports.findById = async (product_id) => {
  // Requête SQL pour sélectionner par ID
  const [rows] = await db.query('SELECT * FROM products WHERE product_id = ?', [product_id]);
  // Retourne le premier résultat ou null
  return rows[0] || null;
};