const express = require('express');
const router = require('./router.js');
const v1 = require('./fitur/api.js');
const path = require('path');
const axios = require('axios');

const app = express();
app.use('/', router);
app.use('/api', async (req, res, next) => {
  const apiUrl = 'https://tattered-classy-comic.glitch.me/count';
  try {
    await axios.get(apiUrl);
    next();
  } catch (error) {
    next(error);
  }
});
app.use('/api', v1);
app.set('views', path.join(path.dirname(__filename), 'views'));
app.set('view engine', 'ejs');
app.set('json spaces', 2);


app.get("/succes", async (req,res)=>{
  const re = req.query.re;
try {
res.status(200).json(JSON.parse(re));
} catch (error) {
  res.status(500).send(error+" tidak valid pastikan anda menggunakan endpoint Yang tertera pada JSON hasil arigatou!😑");
}
});
app.get("/redirect", async (req, res) =>{
  if (!req.query.re) return res.send("Invalid Url");
  res.redirect(req.query.re);
});
app.get("/uptime", async (req, res) => {
  const chatAi = 'https://copper-ambiguous-velvet.glitch.me/';
  const Scraper = 'https://dour-glory-nectarine.glitch.me/';
 const sideSrv = 'https://tattered-classy-comic.glitch.me/'


  try {
    const [chatRes, scrapRes, sideRes] = await Promise.all([
      axios.get(chatAi),
      axios.get(Scraper),
      axios.get(sideSrv)
    ]);

    res.send(`DB Uptime: ${chatRes.status} | Scraper Uptime: ${scrapRes.status} | Side Uptime: ${sideRes.status}`);
  } catch (error) {
    res.send("Error fetching uptime information");
  }
});

app.listen(3000, function() {
  console.log('Server berjalan di port 3000');
});
