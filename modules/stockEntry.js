// Importation de la connexion DB
const db = require('../config/db');

// Fonction pour créer une proposition d'entrée
exports.create = async (entryData) => {
  await db.query('INSERT INTO stock_entries SET ?', entryData);
};

// Fonction pour trouver les propositions pending
exports.findPending = async () => {
  const [rows] = await db.query('SELECT se.*, p.name FROM stock_entries se JOIN products p ON se.product_id = p.product_id WHERE se.status = "pending"');
  return rows;
};

// Fonction pour updater statut
exports.updateStatus = async (entry_id, updates) => {
  await db.query('UPDATE stock_entries SET ? WHERE entry_id = ?', [updates, entry_id]);
};