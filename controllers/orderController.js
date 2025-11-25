const db = require('../config/db');

exports.getOrders = (req, res) => {
  const user = req.session.user;
  if (!user || (user.role !== 'chef_principal' && user.role !== 'chef_service' && user.role !== 'admin')) {
    return res.redirect('/auth/login');
  }
  
  let query, params;
  if (user.role === 'chef_principal' || user.role === 'admin') {
    db.query(`
      SELECT o.order_id, p.name AS product_name, a.code AS account_code, o.quantity, o.motif, o.status, o.created_at as date_heure_action,
             CASE 
               WHEN o.status = 'pending' THEN o.identifiant_utilisateur 
               ELSE COALESCE(oa.auteur_login, o.identifiant_utilisateur) 
             END as identifiant_auteur,
             u.login AS user_login, o.identifiant_utilisateur
      FROM orders o 
      JOIN products p ON o.product_id = p.product_id
      JOIN accounts a ON p.account_id = a.account_id
      JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_actions oa ON o.order_id = oa.order_id AND oa.action_type IN ('validate', 'reject', 'deliver', 'receive')
      WHERE o.status IN ('pending', 'validated')
      ORDER BY o.created_at DESC
    `, (err, orders) => {
      if (err) {
        console.error('Erreur lors du chargement des commandes:', err);
        throw err;
      }
      
      const ordersFormatees = orders.map(order => ({
        ...order,
        date_heure_action: order.date_heure_action ? new Date(order.date_heure_action).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null
      }));
      
      db.query('SELECT se.entry_id, p.name, a.code AS account_code, se.quantity_added, se.proposed_by, se.proposed_date FROM stock_entries se JOIN products p ON se.product_id = p.product_id JOIN accounts a ON p.account_id = a.account_id WHERE se.status = "pending"', (err, propositions) => {
        if (err) {
          console.error('Erreur lors du chargement des propositions:', err);
          throw err;
        }
        
        const propositionsFormatees = propositions.map(prop => ({
          ...prop,
          proposed_date: prop.proposed_date ? new Date(prop.proposed_date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null
        }));
        
        // NOUVEAU : Fetch totaux agrégés via la vue
        db.query('SELECT * FROM stock_summary', (err, summary) => {
          if (err) {
            console.error('Erreur lors du chargement du résumé des stocks:', err);
            throw err;
          }
          
          res.render('orders/index', { 
            orders: ordersFormatees, 
            propositions: propositionsFormatees, 
            user,
            summary  // NOUVEAU : Pour afficher totaux dans la vue
          });
        });
      });
    });
    return;
  } else if (user.role === 'chef_service') {
    query = `
      SELECT o.order_id, p.name AS product_name, a.code AS account_code, o.quantity, o.motif, o.status, o.date_heure_reception,
             o.identifiant_utilisateur
      FROM orders o 
      JOIN products p ON o.product_id = p.product_id 
      JOIN accounts a ON p.account_id = a.account_id
      WHERE o.user_id = ? AND o.status IN ('pending', 'validated', 'in_delivery')
      ORDER BY o.created_at DESC
    `;
    params = [user.user_id];
    db.query(query, params, (err, orders) => {
      if (err) {
        console.error('Erreur lors du chargement des commandes:', err);
        throw err;
      }
      
      const ordersFormatees = orders.map(order => ({
        ...order,
        date_heure_reception: order.date_heure_reception ? new Date(order.date_heure_reception).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null
      }));
      
      // NOUVEAU : Fetch totaux agrégés via la vue
      db.query('SELECT * FROM stock_summary', (err, summary) => {
        if (err) {
          console.error('Erreur lors du chargement du résumé des stocks:', err);
          throw err;
        }
        
        res.render('orders/index', { 
          orders: ordersFormatees, 
          user,
          summary  // NOUVEAU : Pour afficher totaux dans la vue
        });
      });
    });
    return;
  } else {
    return res.redirect('/stock');
  }
};

// NOUVEAU : Pour réception commande (appelez depuis /orders/receive POST)
exports.receiveOrder = (req, res) => {
  const user = req.session.user;
  if (!user || user.role !== 'chef_service') {
    return res.redirect('/auth/login');
  }

  const { order_id } = req.body;
  const receivedBy = user.login;

  console.log(`Réception de commande: order_id=${order_id}, receivedBy=${receivedBy}`);

  db.query(
    'UPDATE orders SET status = "received", date_heure_reception = NOW(), received_by = ? WHERE order_id = ? AND status = "in_delivery"',
    [receivedBy, order_id],
    (err) => {
      if (err) {
        console.error('Erreur lors de la réception de la commande:', err);
        throw err;
      }
      console.log(`Commande ${order_id} reçue avec succès`);
      // Trigger s'active auto pour soustraire stock !
      if (req.flash) {
        req.flash('success', 'Commande reçue et stock mis à jour.');
      }
      res.redirect('/orders');
    }
  );
};

// Fonction validateOrder existante complétée avec logs
exports.validateOrder = (req, res) => {
  const { order_id } = req.body;
  const user_id = req.session.user.user_id;
  const userLogin = req.session.user.login;
  
  if (!req.session.user || (req.session.user.role !== 'chef_principal' && req.session.user.role !== 'admin')) {
    return res.redirect('/auth/login');
  }
  
  console.log(`Validation de commande: order_id=${order_id}, validatedBy=${userLogin}`);
  
  db.query('UPDATE orders SET status = "validated" WHERE order_id = ?', [order_id], (err) => {
    if (err) {
      console.error('Erreur lors de la validation de la commande:', err);
      throw err;
    }
    db.query('INSERT INTO order_actions (order_id, user_id, action_type, auteur_login) VALUES (?, ?, "validate", ?)', 
      [order_id, user_id, userLogin], (err) => {
        if (err) {
          console.error('Erreur lors de l\'enregistrement de l\'action de validation:', err);
          throw err;
        }
        console.log(`Commande ${order_id} validée avec succès`);
        res.redirect('/orders');
      });
  });
};

// Fonction rejectOrder existante avec logs
exports.rejectOrder = (req, res) => {
  const { order_id } = req.body;
  const user_id = req.session.user.user_id;
  const userLogin = req.session.user.login;
  
  if (!req.session.user || (req.session.user.role !== 'chef_principal' && req.session.user.role !== 'admin')) {
    return res.redirect('/auth/login');
  }
  
  console.log(`Rejet de commande: order_id=${order_id}, rejectedBy=${userLogin}`);
  
  db.query('UPDATE orders SET status = "rejected" WHERE order_id = ?', [order_id], (err) => {
    if (err) {
      console.error('Erreur lors du rejet de la commande:', err);
      throw err;
    }
    db.query('INSERT INTO order_actions (order_id, user_id, action_type, auteur_login) VALUES (?, ?, "reject", ?)', 
      [order_id, user_id, userLogin], (err) => {
        if (err) {
          console.error('Erreur lors de l\'enregistrement de l\'action de rejet:', err);
          throw err;
        }
        console.log(`Commande ${order_id} rejetée avec succès`);
        res.redirect('/orders');
      });
  });
};



exports.getProductsByAccount = (req, res) => {
  const { account_code } = req.params;
  console.log('Chargement produits pour compte:', account_code);
  
  db.query(`
    SELECT p.product_id, p.name, COALESCE(s.quantity, 0) as quantity 
    FROM products p 
    LEFT JOIN stock s ON p.product_id = s.product_id 
    JOIN accounts a ON p.account_id = a.account_id 
    WHERE a.code = ?
    ORDER BY p.name
  `, [account_code], (err, products) => {
    if (err) {
      console.error('Erreur lors du chargement des produits:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    console.log('Produits trouvés:', products.length);
    res.json(products);
  });
};

exports.getCreateOrder = (req, res) => {
  if (!req.session.user || req.session.user.role !== 'chef_service') {
    return res.redirect('/auth/login');
  }
  db.query('SELECT account_id, code, name FROM accounts ORDER BY code', (err, accounts) => {
    if (err) {
      console.error('Erreur lors du chargement des comptes:', err);
      throw err;
    }
    res.render('orders/create', { accounts, products: [], error: null });
  });
};

exports.createOrder = (req, res) => {
  const { product_id, quantity, motif, delivery_comment } = req.body;
  const user_id = req.session.user.user_id;
  const userLogin = req.session.user.login;
  
  if (!req.session.user || req.session.user.role !== 'chef_service') {
    return res.redirect('/auth/login');
  }
  
  console.log(`Création de commande: product_id=${product_id}, quantity=${quantity}, user=${userLogin}`);
  
  db.query('SELECT quantity FROM stock WHERE product_id = ?', [product_id], (err, stock) => {
    if (err) {
      console.error('Erreur lors de la vérification du stock:', err);
      throw err;
    }
    if (stock.length === 0 || stock[0].quantity < quantity) {
      db.query('SELECT account_id, code, name FROM accounts ORDER BY code', (err, accounts) => {
        if (err) {
          console.error('Erreur lors du chargement des comptes:', err);
          throw err;
        }
        console.log(`Stock insuffisant pour product_id=${product_id}`);
        return res.render('orders/create', { accounts, products: [], error: 'Stock insuffisant' });
      });
    } else {
      db.query(
        'INSERT INTO orders (user_id, product_id, quantity, motif, delivery_comment, status, identifiant_utilisateur) VALUES (?, ?, ?, ?, ?, "pending", ?)',
        [user_id, product_id, quantity, motif, delivery_comment, userLogin],
        (err) => {
          if (err) {
            console.error('Erreur lors de la création de la commande:', err);
            throw err;
          }
          console.log(`Commande créée avec succès pour product_id=${product_id}`);
          res.redirect('/orders');
        }
      );
    }
  });
};

exports.deliverOrder = (req, res) => {
  const { order_id } = req.body;
  const user_id = req.session.user.user_id;
  const userLogin = req.session.user.login;
  
  if (!req.session.user || req.session.user.role !== 'chef_service') {
    return res.redirect('/auth/login');
  }
  
  console.log(`Livraison de commande: order_id=${order_id}, deliveredBy=${userLogin}`);
  
  db.query('UPDATE orders SET status = "in_delivery" WHERE order_id = ? AND status = "validated"', [order_id], (err) => {
    if (err) {
      console.error('Erreur lors de la livraison de la commande:', err);
      throw err;
    }
    db.query('INSERT INTO order_actions (order_id, user_id, action_type, auteur_login) VALUES (?, ?, "deliver", ?)', 
      [order_id, user_id, userLogin], (err) => {
        if (err) {
          console.error('Erreur lors de l\'enregistrement de l\'action de livraison:', err);
          throw err;
        }
        console.log(`Commande ${order_id} marquée comme en livraison`);
        res.redirect('/orders');
      });
  });
};

exports.validateStockEntry = (req, res) => {
  const { entry_id, action } = req.body;
  const userLogin = req.session.user.login;
  
  if (!req.session.user || (req.session.user.role !== 'chef_principal' && req.session.user.role !== 'admin')) {
    return res.redirect('/orders');
  }
  
  console.log(`Validation d'entrée stock: entry_id=${entry_id}, action=${action}, validatedBy=${userLogin}`);
  
  const newStatus = action === 'validate' ? 'validated' : 'rejected';
  const motifRejet = action === 'reject' ? (req.body.motif_rejet || null) : null;
  
  db.query(
    'UPDATE stock_entries SET status = ?, validated_by = ?, validated_date = NOW(), motif_rejet = ? WHERE entry_id = ?',
    [newStatus, userLogin, motifRejet, entry_id],
    (err) => {
      if (err) {
        console.error('Erreur lors de la validation de l\'entrée stock:', err);
        throw err;
      }
      console.log(`Entrée stock ${entry_id} ${action === 'validate' ? 'validée' : 'rejetée'} avec succès`);
      res.redirect('/orders');
    }
  );
};

// NOUVELLE FONCTIONNALITÉ : Suivi Chef complet - CORRIGÉ avec comptes
exports.getSuiviChef = (req, res) => {
  if (!req.session.user || (req.session.user.role !== 'chef_principal' && req.session.user.role !== 'admin')) {
    return res.redirect('/auth/login');
  }

  // Requête unifiée CORRIGÉE avec comptes
  db.query(`
    -- Commandes validées (sorties) - utl1, utl2
    SELECT 
      oa.action_date as date_heure,
      oa.auteur_login as identifiant_auteur,
      p.name as produit,
      a.code as account_code,
      o.quantity as quantite,
      'commande validée' as type_action,
      'sortie' as statut,
      o.identifiant_utilisateur as propose_par
    FROM order_actions oa
    JOIN orders o ON oa.order_id = o.order_id
    JOIN products p ON o.product_id = p.product_id
    JOIN accounts a ON p.account_id = a.account_id
    WHERE oa.action_type = 'validate'
    
    UNION ALL
    
    -- Commandes livrées (sorties)
    SELECT 
      oa.action_date as date_heure,
      oa.auteur_login as identifiant_auteur,
      p.name as produit,
      a.code as account_code,
      o.quantity as quantite,
      'commande livrée' as type_action,
      'sortie' as statut,
      o.identifiant_utilisateur as propose_par
    FROM order_actions oa
    JOIN orders o ON oa.order_id = o.order_id
    JOIN products p ON o.product_id = p.product_id
    JOIN accounts a ON p.account_id = a.account_id
    WHERE oa.action_type = 'deliver'
    
    UNION ALL
    
    -- Commandes reçues (sorties confirmées)
    SELECT 
      oa.action_date as date_heure,
      oa.auteur_login as identifiant_auteur,
      p.name as produit,
      a.code as account_code,
      o.quantity as quantite,
      'commande reçue' as type_action,
      'sortie' as statut,
      o.identifiant_utilisateur as propose_par
    FROM order_actions oa
    JOIN orders o ON oa.order_id = o.order_id
    JOIN products p ON o.product_id = p.product_id
    JOIN accounts a ON p.account_id = a.account_id
    WHERE oa.action_type = 'receive'
    
    UNION ALL
    
    -- Commandes rejetées (annulations)
    SELECT 
      oa.action_date as date_heure,
      oa.auteur_login as identifiant_auteur,
      p.name as produit,
      a.code as account_code,
      o.quantity as quantite,
      'commande rejetée' as type_action,
      'annulation' as statut,
      o.identifiant_utilisateur as propose_par
    FROM order_actions oa
    JOIN orders o ON oa.order_id = o.order_id
    JOIN products p ON o.product_id = p.product_id
    JOIN accounts a ON p.account_id = a.account_id
    WHERE oa.action_type = 'reject'
    
    UNION ALL
    
    -- Ajouts de stock validés (entrées) - comptable1
    SELECT 
      se.validated_date as date_heure,
      se.validated_by as identifiant_auteur,
      p.name as produit,
      a.code as account_code,
      se.quantity_added as quantite,
      'ajout stock' as type_action,
      'entrée' as statut,
      se.proposed_by as propose_par
    FROM stock_entries se
    JOIN products p ON se.product_id = p.product_id
    JOIN accounts a ON p.account_id = a.account_id
    WHERE se.status = 'validated' AND se.validated_date IS NOT NULL
    
    UNION ALL
    
    -- Commandes en attente (sorties proposées)
    SELECT 
      o.created_at as date_heure,
      NULL as identifiant_auteur,
      p.name as produit,
      a.code as account_code,
      o.quantity as quantite,
      'commande en attente' as type_action,
      'sortie proposée' as statut,
      o.identifiant_utilisateur as propose_par
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
    JOIN accounts a ON p.account_id = a.account_id
    WHERE o.status = 'pending'
    
    UNION ALL
    
    -- Propositions de stock en attente (entrées proposées)
    SELECT 
      se.proposed_date as date_heure,
      NULL as identifiant_auteur,
      p.name as produit,
      a.code as account_code,
      se.quantity_added as quantite,
      'ajout stock proposé' as type_action,
      'entrée proposée' as statut,
      se.proposed_by as propose_par
    FROM stock_entries se
    JOIN products p ON se.product_id = p.product_id
    JOIN accounts a ON p.account_id = a.account_id
    WHERE se.status = 'pending'
    
    ORDER BY date_heure DESC
    LIMIT 100
  `, (err, actions) => {
    if (err) {
      console.error('Erreur lors de la récupération du suivi:', err);
      throw err;
    }
    
    // CORRECTION DES DATES ET ACTION - Format simple et efficace
    const actionsFormatees = actions.map(action => {
      let dateFormatee = null;
      if (action.date_heure) {
        // Conversion directe en format français
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
        propose_par: action.propose_par || 'N/A',
        // CORRECTION : Capitalisation pour matcher le template + logique entrée/sortie
        action: action.statut.includes('entrée') ? 'Entrée' : 'Sortie'
      };
    });
    
    console.log('Debug - Première action:', actionsFormatees[0]);
    
    res.render('orders/suivi', { 
      actions: actionsFormatees, 
      user: req.session.user 
    });
  });
};

// NOUVELLE FONCTIONNALITÉ : Suivi pour Chef de Service (utl1) - Actions de réception confirmées avec comptes
exports.getSuiviService = (req, res) => {
  if (!req.session.user || req.session.user.role !== 'chef_service') {
    return res.redirect('/auth/login');
  }

  const userId = req.session.user.user_id;

  // Requête pour les actions de réception confirmées par cet utilisateur (received) avec comptes
  db.query(`
    SELECT 
      o.order_id as id_produit,
      o.motif,
      oa.action_date as date_heure,
      oa.auteur_login as identification_auteur,
      o.status as statut,
      oa.action_type as action,
      p.name as produit,
      a.code as account_code,
      o.quantity as quantite
    FROM order_actions oa
    JOIN orders o ON oa.order_id = o.order_id
    JOIN products p ON o.product_id = p.product_id
    JOIN accounts a ON p.account_id = a.account_id
    WHERE oa.user_id = ? AND oa.action_type = 'receive'
    ORDER BY oa.action_date DESC
    LIMIT 50
  `, [userId], (err, actions) => {
    if (err) {
      console.error('Erreur lors de la récupération du suivi service:', err);
      throw err;
    }
    
    const actionsFormatees = actions.map(action => ({
      ...action,
      date_heure: action.date_heure ? new Date(action.date_heure).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Date non disponible'
    }));
    
    console.log('Debug - Première action service:', actionsFormatees[0]);
    
    res.render('orders/suivi-service', {
      actions: actionsFormatees, 
      user: req.session.user 
    });
  });
};