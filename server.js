const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);
const stockRoutes = require('./routes/stock');
app.use('/stock', stockRoutes);
const orderRoutes = require('./routes/orders');
app.use('/orders', orderRoutes);
app.get('/apropos', (req, res) => {
  res.render('apropos', { title: 'À propos - StockFlow' });  // Utilise la vue existante
});

// Route pour chef éditer stock directement (ex. /stock/chef-edit/:id → mais utilise /stock/edit)
const stockController = require('./controllers/stockController');
app.get('/stock/chef-edit/:stock_id', stockController.getEditStock);
app.post('/stock/chef-update', stockController.updateStock);

const authController = require('./controllers/authController');
app.get('/profile', authController.getProfile);

app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

app.use((req, res) => {
  res.status(404).send('Page non trouvée');
});

app.listen(2707, () => {
  console.log('Serveur lancé sur http://localhost:2707');
});