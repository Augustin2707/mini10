const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mini151'
});

connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion MySQL:', err);
    return;
  }
  console.log('Connecté à MySQL');
  // Fix timezone pour Madagascar (UTC+3)
  connection.query("SET time_zone = '+03:00';", (err) => {
    if (err) console.error('Erreur timezone:', err);
  });
});

module.exports = connection;