const db = require('../config/db');

exports.getStockIndex = (req, res) => {
  const user = req.session.user;
  if (!user || (user.role !== 'comptable' && user.role !== 'admin')) {
    return res.redirect('/auth/login');
  }

  // Fetch produits pour formulaire
  db.query('SELECT * FROM products', (err, products) => {
    if (err) throw err;

    // Fetch stocks actuels (tous rôles)
    db.query(`
      SELECT s.stock_id, s.quantity, p.name 
      FROM stock s 
      JOIN products p ON s.product_id = p.product_id
    `, (err, stocks) => {
      if (err) throw err;

      // CORRECTION : Fetch séparé pour commandes à livrer ('validated') ET en livraison ('in_delivery')
      // Seulement pour comptable ou admin
      let ordersToDeliverQuery = '';
      let ordersInDeliveryQuery = '';
      let params = [];
      if (user.role === 'comptable' || user.role === 'admin') {
        // À livrer : validated
        ordersToDeliverQuery = `
          SELECT o.order_id, p.name AS product_name, o.quantity, o.motif, o.identifiant_utilisateur,
                 o.created_at AS date_heure_commande
          FROM orders o 
          JOIN products p ON o.product_id = p.product_id 
          WHERE o.status = 'validated' 
          ORDER BY o.created_at DESC
        `;
        // En livraison : in_delivery
        ordersInDeliveryQuery = `
          SELECT o.order_id, p.name AS product_name, o.quantity, o.motif, o.identifiant_utilisateur,
                 o.date_heure_livraison AS date_heure_commande
          FROM orders o 
          JOIN products p ON o.product_id = p.product_id 
          WHERE o.status = 'in_delivery' 
          ORDER BY o.created_at DESC
        `;
      }

      // Exécute queries si applicable
      const handleOrders = (errToDeliver, ordersToDeliver, errInDelivery, ordersInDelivery) => {
        if (errToDeliver) throw errToDeliver;
        if (errInDelivery) throw errInDelivery;

        // Fetch propositions en attente (pour comptable/admin voir ses props)
        db.query('SELECT se.*, p.name FROM stock_entries se JOIN products p ON se.product_id = p.product_id WHERE se.status = "pending"', (err, propositions) => {
          if (err) throw err;

          const propositionsFormatees = propositions.map(prop => ({
            ...prop,
            proposed_date: prop.proposed_date ? new Date(prop.proposed_date).toISOString().slice(0, 19).replace('T', ' ') : null
          }));

          // Formate dates pour orders
          const ordersToDeliverFormatees = ordersToDeliver ? ordersToDeliver.map(order => ({
            ...order,
            date_heure_commande: order.date_heure_commande ? new Date(order.date_heure_commande).toISOString().slice(0, 19).replace('T', ' ') : null
          })) : [];
          const ordersInDeliveryFormatees = ordersInDelivery ? ordersInDelivery.map(order => ({
            ...order,
            date_heure_commande: order.date_heure_commande ? new Date(order.date_heure_commande).toISOString().slice(0, 19).replace('T', ' ') : null
          })) : [];

          res.render('stock/index', { 
            products, 
            stocks, 
            orders: ordersToDeliverFormatees,  // À livrer
            ordersInDelivery: ordersInDeliveryFormatees,  // En livraison
            propositions: propositionsFormatees, 
            user 
          });
        });
      };

      if (ordersToDeliverQuery) {
        db.query(ordersToDeliverQuery, (errToDeliver, ordersToDeliver) => {
          db.query(ordersInDeliveryQuery, (errInDelivery, ordersInDelivery) => {
            handleOrders(errToDeliver, ordersToDeliver, errInDelivery, ordersInDelivery);
          });
        });
      } else {
        handleOrders(null, [], null, []);
      }
    });
  });
};

exports.proposeStockAdd = (req, res) => {
  const user = req.session.user;
  if (!user || (user.role !== 'comptable' && user.role !== 'admin')) {
    return res.redirect('/stock');
  }
  const { product_id, quantity_added } = req.body;
  const proposedBy = req.session.user.login;
  db.query(
    'INSERT INTO stock_entries (product_id, quantity_added, proposed_by, proposed_date, status) VALUES (?, ?, ?, NOW(), "pending")',
    [product_id, quantity_added, proposedBy],
    (err) => {
      if (err) throw err;
      console.log('Proposition ajout stock par', proposedBy, 'pour product_id:', product_id); // Debug
      res.redirect('/stock');
    }
  );
};

// CORRECTION : Fonction deliverOrder bien exportée et robuste
exports.deliverOrder = (req, res) => {
  const user = req.session.user;
  if (!user || (user.role !== 'comptable' && user.role !== 'admin')) {
    return res.redirect('/auth/login');
  }
  
  const { order_id } = req.body;
  const user_id = req.session.user.user_id;
  const userLogin = req.session.user.login;
  
  // Vérifie d'abord si validated
  db.query('SELECT status FROM orders WHERE order_id = ?', [order_id], (err, result) => {
    if (err) {
      console.error('Erreur check status:', err);
      return res.redirect('/stock');
    }
    if (result.length === 0 || result[0].status !== 'validated') {
      console.log('Cannot deliver: order', order_id, 'not validated');
      return res.redirect('/stock');  // Pas d'erreur user, juste skip
    }
    // Update
    db.query(
      'UPDATE orders SET status = "in_delivery", date_heure_livraison = NOW() WHERE order_id = ?',
      [order_id],
      (err) => {
        if (err) {
          console.error('Erreur update livraison:', err);
          throw err;
        }
        // Log action
        db.query(
          'INSERT INTO order_actions (order_id, user_id, action_type, auteur_login, action_date) VALUES (?, ?, "deliver", ?, NOW())',
          [order_id, user_id, userLogin],
          (err) => {
            if (err) {
              console.error('Erreur log action:', err);
              throw err;
            }
            console.log('Livraison effectuée par', userLogin, 'pour order_id:', order_id); // Debug
            res.redirect('/stock');
          }
        );
      }
    );
  });
};

// Bloqué pour comptable : Redirige vers consultation
exports.getEditStock = (req, res) => {
  const user = req.session.user;
  if (!user || (user.role !== 'comptable' && user.role !== 'admin')) {
    return res.redirect('/stock');  // Ne peut pas éditer
  }
  
  const { stock_id } = req.params;
  db.query('SELECT s.*, p.name FROM stock s JOIN products p ON s.product_id = p.product_id WHERE s.stock_id = ?', [stock_id], (err, stock) => {
    if (err) throw err;
    res.render('stock/edit', { stock: stock[0] });
  });
};

exports.updateStock = (req, res) => {
  const user = req.session.user;
  if (!user || user.role !== 'chef_principal') {  // Réservé au chef seulement
    return res.redirect('/stock');
  }
  
  const { stock_id, quantity } = req.body;
  db.query('UPDATE stock SET quantity = ?, updated_at = NOW() WHERE stock_id = ?', [quantity, stock_id], (err) => {
    if (err) throw err;
    console.log('Stock mis à jour par chef pour stock_id:', stock_id, 'quantité:', quantity); // Debug
    res.redirect('/stock');
  });
};

// Version corrigée et étendue : Suivi générique pour tous rôles (chef_service=utl1, comptable, chef_principal, admin)
exports.getSuivi = (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.redirect('/auth/login');
  }
  
  const role = user.role;
  const userId = user.user_id;
  const userLogin = user.login;

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

  } else if (role === 'comptable' || role === 'admin') {
    // Requête unifiée pour comptable/admin : livraisons + propositions/ajouts stock - CORRIGÉE pour statuts
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

// Autres fonctions (si tu en as d'autres, ajoute-les ici – ex. validateOrder si besoin)
exports.validateOrder = (req, res) => {
  const user = req.session.user;
  if (!user || (user.role !== 'comptable' && user.role !== 'admin')) {
    return res.redirect('/auth/login');
  }
  // Si cette fonction existe ailleurs, copie-la ici ou supprime la route si inutilisée
  res.redirect('/stock');  // Placeholder – adapte si besoin
};

exports.validateStockEntry = (req, res) => {
  const user = req.session.user;
  if (!user || (user.role !== 'comptable' && user.role !== 'admin')) {
    return res.redirect('/auth/login');
  }
  // Si cette fonction existe dans orderController, déplace-la ou adapte
  res.redirect('/stock');  // Placeholder – adapte si besoin
};