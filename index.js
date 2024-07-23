const express = require('express');
const router = require('./router.js');
const v1 = require('./fitur/api.js');
const path = require('path');
const axios = require('axios');
const ytdl = require('@distube/ytdl-core');

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

app.get('/yt', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Get video info
    const info = await ytdl.getInfo(url);

    // Find audio and video formats
    const audioAndVideoFormat = ytdl.filterFormats(info.formats, 'audioandvideo')[0];
    const audioOnlyFormat = ytdl.filterFormats(info.formats, 'audioonly')[0];

    if (!audioAndVideoFormat || !audioOnlyFormat) {
      return res.status(404).json({ error: 'No suitable formats found' });
    }

    res.json({
      audio: audioOnlyFormat.url,
      video: audioAndVideoFormat.url
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch video info', details: error.message });
  }
});

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
  const sideSrvr = 'https://tattered-classy-comic.glitch.me/';
  let sideRes = null;
  let chatRes = null;
  try {
        sideRes = await axios.get(sideSrvr);
        chatRes = await axios.get(chatAi);
          res.send("Server Uptime: " + sideRes.status + " | ChatAI Uptime: " + chatRes.status)
    } catch (error) {
        res.send("Server Uptime: " + sideRes.status + " | ChatAI Uptime: " + chatRes.status)
  }
})

app.listen(3000, function() {
  console.log('Server berjalan di port 3000');
});
