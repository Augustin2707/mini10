const bcrypt = require('bcrypt');
bcrypt.hash('123', 10, (err, hash) => {
  if (err) console.error(err);
  console.log('Hash:', hash);
});