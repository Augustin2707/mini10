const bcrypt = require('bcrypt');
bcrypt.hash('utilisateur', 10, (err, hash) => {
  if (err) console.error(err);
  console.log('Hash:', hash);
});