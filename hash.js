const bcrypt = require('bcrypt');
bcrypt.hash('Mc2707', 10, (err, hash) => {
  if (err) console.error(err);
  console.log('Hash:', hash);
});