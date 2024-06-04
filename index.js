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
  const stringMentah = Buffer.from(re, 'base64').toString('ucs-2');
  res.status(200).json(JSON.parse(stringMentah));
} catch (error) {
  res.status(500).send(error+ "Token tidak valid pastikan anda menggunakan endpoint Yang tertera pada JSON hasil arigatou!😑");
}
});
app.get("/redirect", async (req, res) =>{
  if (!req.query.re) return res.send("Invalid token")
  try {
    const re = req.query.re;
    const linkMentah = Buffer.from(re, 'base64').toString('utf-8');
    const link = linkMentah.split("*/link/*")[1];
    if (link) {
      res.redirect(link);
    } else {
      res.send("Invalid token");
    }
  } catch (error) {
    res.send("Invalid token");
  }
});

app.get("/uptime", async (req, res) => {
  const apiUrl = 'https://tattered-classy-comic.glitch.me/';
  try {
        const response = await axios.get(apiUrl);
        if (response.status === 200) {
          res.send("Server is up and running!");
        } else {
          res.send("Server is down or unreachable.");
        }
    } catch (error) {
        res.send(error.message)
  }
})

app.listen(3000, function() {
  console.log('Server berjalan di port 3000');
});
