const express = require('express');
const router = require('./router.js');
const v1 = require('./fitur/api.js');
const path = require('path');

const app = express();
app.use('/', router);
app.use('/api', v1);
app.set('views', path.join(path.dirname(__filename), 'views'));
app.set('view engine', 'ejs');
app.set('json spaces', 2);

app.listen(3000, function() {
  console.log('Server berjalan di port 3000');
});
