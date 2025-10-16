const db = require('../config/db');

exports.getStockIndex = (req, res) => {
  if (!req.session.user || req.session.user.role !== 'comptable') {
    return res.redirect('/auth/login');
  }
  db.query('SELECT s.stock_id, p.name, s.quantity FROM stock s JOIN products p ON s.product_id = p.product_id', (err, stocks) => {
    if (err) throw err;
    db.query(`
      SELECT o.order_id, p.name AS product_name, o.quantity, o.motif, o.created_at as date_heure_commande,
             u.login as identifiant_utilisateur
      FROM orders o JOIN products p ON o.product_id = p.product_id JOIN users u ON o.user_id = u.user_id 
      WHERE o.status IN ('validated', 'in_delivery')
      ORDER BY o.created_at DESC
    `, (err, orders) => {
      if (err) throw err;
      
      // CORRECTION : Formate date_heure_commande avant render
      const ordersFormatees = orders.map(order => ({
        ...order,
        date_heure_commande: order.date_heure_commande ? new Date(order.date_heure_commande).toISOString().slice(0, 19).replace('T', ' ') : null
      }));
      
      db.query('SELECT * FROM products', (err, products) => {
        if (err) throw err;
        // Nouvelle query pour propositions stock_entries (pending pour comptable)
        db.query('SELECT se.*, p.name FROM stock_entries se JOIN products p ON se.product_id = p.product_id WHERE se.status = "pending"', (err, propositions) => {
          if (err) throw err;
          
          // FIX : Formate proposed_date avant render
          const propositionsFormatees = propositions.map(prop => ({
            ...prop,
            proposed_date: prop.proposed_date ? new Date(prop.proposed_date).toISOString().slice(0, 19).replace('T', ' ') : null
          }));
          
          // Debug optionnel : console.log(propositionsFormatees[0]); // Vérifie le format
          
          res.render('stock/index', { stocks, orders: ordersFormatees, products, propositions: propositionsFormatees, user: req.session.user });
        });
      });
    });
  });
};

// Proposition d'ajout au stock (remplace addToStock ; status pending, chef valide)
exports.proposeStockAdd = (req, res) => {
  const { product_id, quantity_added } = req.body;
  const proposedBy = req.session.user.login;
  if (!req.session.user || req.session.user.role !== 'comptable') {
    return res.status(403).send('Accès refusé');
  }
  db.query('INSERT INTO stock_entries (product_id, quantity_added, proposed_by) VALUES (?, ?, ?)', 
    [product_id, quantity_added, proposedBy], (err) => {
      if (err) throw err;
      console.log('Proposition stock ajoutée par', proposedBy); // Debug
      res.redirect('/stock');
    });
};

// NOUVEAU : Validation d'une commande par chef (UPDATE status='validated' + log action)
exports.validateOrder = (req, res) => {
  const { order_id } = req.body;
  const user_id = req.session.user.user_id;
  const userLogin = req.session.user.login;
  if (!req.session.user || req.session.user.role !== 'chef_principal') {
    return res.redirect('/auth/login'); // Réservé au chef
  }
  db.query('UPDATE orders SET status = "validated" WHERE order_id = ?', [order_id], (err) => {
    if (err) throw err;
    db.query('INSERT INTO order_actions (order_id, user_id, action_type, auteur_login) VALUES (?, ?, "validate", ?)', 
      [order_id, user_id, userLogin], (err) => {
        if (err) throw err;
        console.log('Commande validée par', userLogin, 'pour order_id:', order_id); // Debug
        res.redirect('/stock'); // Ou /orders si tu as une page dédiée
      });
  });
};

// NOUVEAU : Validation d'une entrée stock par chef (UPDATE status='validated' + validated_by/date)
exports.validateStockEntry = (req, res) => {
  const { entry_id } = req.body;
  const userLogin = req.session.user.login;
  if (!req.session.user || req.session.user.role !== 'chef_principal') {
    return res.redirect('/auth/login'); // Réservé au chef
  }
  db.query('UPDATE stock_entries SET status = "validated", validated_by = ?, validated_date = NOW() WHERE entry_id = ?', 
    [userLogin, entry_id], (err) => {
      if (err) throw err;
      console.log('Entrée stock validée par', userLogin, 'pour entry_id:', entry_id); // Debug
      // Note : Le trigger after_stock_entry_validated s'occupera d'UPDATE stock.quantity
      res.redirect('/stock');
    });
};

exports.deliverOrder = (req, res) => {
  const { order_id } = req.body;
  const user_id = req.session.user.user_id;
  const userLogin = req.session.user.login;
  if (!req.session.user || req.session.user.role !== 'comptable') {
    return res.redirect('/auth/login');
  }
  db.query('UPDATE orders SET status = "in_delivery" WHERE order_id = ?', [order_id], (err) => {
    if (err) throw err;
    db.query('INSERT INTO order_actions (order_id, user_id, action_type, auteur_login) VALUES (?, ?, "deliver", ?)', 
      [order_id, user_id, userLogin], (err) => {
        if (err) throw err;
        console.log('Livraison effectuée par', userLogin, 'pour order_id:', order_id); // Debug
        res.redirect('/stock');
      });
  });
};

// Bloqué pour comptable : Redirige vers consultation
exports.getEditStock = (req, res) => {
  const { stock_id } = req.params;
  if (req.session.user.role === 'comptable') {
    return res.redirect('/stock');  // Ne peut pas éditer
  }
  db.query('SELECT s.*, p.name FROM stock s JOIN products p ON s.product_id = p.product_id WHERE s.stock_id = ?', [stock_id], (err, stock) => {
    if (err) throw err;
    res.render('stock/edit', { stock: stock[0] });
  });
};

exports.updateStock = (req, res) => {
  if (req.session.user.role !== 'chef_principal') {  // Réservé au chef
    return res.redirect('/stock');
  }
  const { stock_id, quantity } = req.body;
  db.query('UPDATE stock SET quantity = ?, updated_at = NOW() WHERE stock_id = ?', [quantity, stock_id], (err) => {
    if (err) throw err;
    console.log('Stock mis à jour par chef pour stock_id:', stock_id, 'quantité:', quantity); // Debug
    res.redirect('/stock');
  });
};

// Version corrigée et étendue : Suivi générique pour tous rôles (chef_service=utl1, comptable, chef_principal)
exports.getSuivi = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  const role = req.session.user.role;
  const userId = req.session.user.user_id;
  const userLogin = req.session.user.login;

  // Logique conditionnelle par rôle
  let query = '';
  let params = [userId];

  if (role === 'chef_service') {  // Pour utl1 (chef_service)
    query = `
      SELECT oa.action_date as date_heure, 
             CONCAT('Livré par ', u.login) as action_display,
             p.name as produit, o.quantity as quantite, o.status,
             oa.auteur_login as auteur
      FROM order_actions oa 
      JOIN orders o ON oa.order_id = o.order_id
      JOIN products p ON o.product_id = p.product_id
      JOIN users u ON oa.user_id = u.user_id
      WHERE o.user_id = ? AND oa.action_type = 'deliver'
      ORDER BY oa.action_date DESC LIMIT 10
    `;
    params = [userId];

  } else if (role === 'comptable') {
    // Requête unifiée pour comptable : livraisons + propositions/ajouts stock - CORRIGÉE pour statuts
    query = `
      -- Livraisons (commandes validées et livrées = sorties)
      SELECT 
        oa.action_date as date_heure,
        CONCAT('Livré à ', u.login) as action_display,
        p.name as produit,
        o.quantity as quantite,
        'sortie' as statut,
        oa.auteur_login as auteur
      FROM order_actions oa
      JOIN orders o ON oa.order_id = o.order_id
      JOIN products p ON o.product_id = p.product_id
      JOIN users u ON o.user_id = u.user_id
      WHERE oa.user_id = ? AND oa.action_type = 'deliver'
      
      UNION ALL
      
      -- Propositions d'ajout stock en attente (produits en attente de validation = en attente)
      SELECT 
        se.proposed_date as date_heure,
        CONCAT('Proposition ajout stock - par ', se.proposed_by) as action_display,
        p.name as produit,
        se.quantity_added as quantite,
        'en attente' as statut,
        se.proposed_by as auteur
      FROM stock_entries se
      JOIN products p ON se.product_id = p.product_id
      WHERE se.proposed_by = ? AND se.status = 'pending'
      
      UNION ALL
      
      -- Ajouts de stock validés (produits ajoutés = entrée)
      SELECT 
        se.validated_date as date_heure,
        CONCAT('Ajout stock validé - proposé par ', se.proposed_by) as action_display,
        p.name as produit,
        se.quantity_added as quantite,
        'entrée' as statut,
        se.validated_by as auteur
      FROM stock_entries se
      JOIN products p ON se.product_id = p.product_id
      WHERE se.proposed_by = ? AND se.status = 'validated'
      
      ORDER BY date_heure DESC
      LIMIT 20
    `;
    params = [userId, userLogin, userLogin];

  } else if (role === 'chef_principal') {
    query = `
      SELECT oa.action_date as date_heure, 
             CONCAT('Validé commande - ', u.login) as action_display,
             p.name as produit, o.quantity as quantite, o.status,
             oa.auteur_login as auteur
      FROM order_actions oa 
      JOIN orders o ON oa.order_id = o.order_id
      JOIN products p ON o.product_id = p.product_id
      JOIN users u ON o.user_id = u.user_id
      WHERE oa.user_id = ? AND oa.action_type = 'validate'
      ORDER BY oa.action_date DESC LIMIT 10
    `;
    params = [userId];

  } else {
    return res.render('stock/suivi', { actions: [], user: req.session.user });
  }

  db.query(query, params, (err, actions) => {
    if (err) throw err;
    
    const actionsFormatees = actions.map(action => {
      let dateFormatee = null;
      if (action.date_heure) {
        const date = new Date(action.date_heure);
        dateFormatee = date.toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
      
      return {
        ...action,
        date_heure: dateFormatee || 'Date non disponible',
        statut: action.statut || 'N/A'  // Assure que statut est toujours défini
      };
    });
    
    console.log('Debug - Première action comptable:', actionsFormatees[0]);  // Pour vérifier statut
    
    res.render('stock/suivi', { actions: actionsFormatees, user: req.session.user });
  });
};