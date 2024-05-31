const express = require('express');
const ytdl = require('ytdl-core');
const path = require('path');
const fs = require('fs');
const scrap = require('@bochilteam/scraper');
const axios = require('axios');
const app = express();
const failed = "https://nue-api.vercel.app/error"
const succes = "https://nue-api.vercel.app/succes?re=";
const base = "https://nue-api.vercel.app";

app.use((req, res, next) => {
  const publicDir = path.join(__dirname, 'public');
  fs.readdir(publicDir, (err, files) => {
    if (err) {
      console.error('Error reading public directory:', err);
      return;
    }
    files.forEach(file => {
      const filePath = path.join(publicDir, file);
      const fileStats = fs.statSync(filePath);
      const currentTime = Date.now();
      const fileTime = parseInt(file.split('_')[1]);
      if (currentTime - fileTime > 3600000) {
        fs.unlink(filePath, err => {
          if (err) {
            console.error('Error deleting file:', err);
            return;
          }
          console.log('File deleted:', file);
        });
      }
    });
  });
  next();
});

app.get('/stablediff', async (req, res) => {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(400).send('Prompt query parameter is required');
  }

  const alternativeAPIs = [
    'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
    'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5'
  ];

  const apiKeys = [
    "Bearer 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",
    "Bearer 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",
    "Bearer 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"
  ];
  const randomApiKey = Math.floor(Math.random() * apiKeys.length);
  const apiKey = apiKeys[randomApiKey];

  try {
    const data = { "inputs": prompt };
    const primaryUrl = 'https://api-inference.huggingface.co/models/sd-community/sdxl-flash';
    const response = await axios.post(primaryUrl, data, { headers: { Authorization: apiKey }, responseType: 'arraybuffer' });

    const fileName = `image_${Date.now()}.jpeg`;
    const filePath = path.join(__dirname, 'public', fileName);
    fs.writeFileSync(filePath, response.data);

    res.set('Content-Type', 'image/jpeg');
    res.sendFile(filePath, { root: __dirname });
  } catch (error) {
    for (const apiUrl of alternativeAPIs) {
      try {
        const data = { "inputs": prompt };
        const response = await axios.post(apiUrl, data, { headers: { Authorization: apiKey }, responseType: 'arraybuffer' });

        const fileName = `image_${Date.now()}.jpeg`;
        const filePath = path.join(__dirname, 'public', fileName);
        fs.writeFileSync(filePath, response.data);

        res.set('Content-Type', 'image/jpeg');
        res.sendFile(filePath, { root: __dirname });
        return;
      } catch (alternativeError) {
        console.error('Alternative API failed:', alternativeError.message);
      }
    }
    res.status(500).send('All API requests failed');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'));
});

app.get('/snapsave', async (req, res) => {
  try {
    if (!req.query.url) {
      return res.status(400).json({
        status: 400,
        message: "Masukkan parameter url"
      });
    }

    const hasil = await scrap.snapsave(req.query.url);
    const response = await axios.head(hasil[0].url);
    let type = 'video';
    if (response.headers['content-type'].includes('image')) {
      type = 'image';
    } else if (response.headers['content-type'].includes('video')) {
      type = 'video';
    }
    const json = {endpoint: base+'/api/igdl?url=URL_INPUT',status: 200,type, result: hasil};
    res.redirect(succes + Buffer.from(JSON.stringify(json)).toString('base64')); 
  } catch (error) {
    res.redirect(failed);
  }
});

app.get('/yt-mp3', async (req, res) => {
    let url = req.query.url;
    if (!ytdl.validateURL(url)) {
        return res.status(400).send('URL tidak valid');
    }
    let info = await ytdl.getInfo(url);
    res.header('Content-Disposition', `attachment; filename="NueApi ${Date.now()}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');
    ytdl(url, { filter : 'audioonly' }).pipe(res);
});

app.get('/yt-mp4', async (req, res) => {
    let url = req.query.url;
    if (!ytdl.validateURL(url)) {
        return res.status(400).send('URL tidak valid');
    }
    let info = await ytdl.getInfo(url);
    res.header('Content-Disposition', `attachment; filename="NueApi ${Date.now()}.mp4"`);
    res.setHeader('Content-Type', 'video/mp4');
    ytdl(url, { filter: 'videoandaudio' }).pipe(res);
});

app.listen(3000, () => {
    console.log('Server berjalan di port 3000');
});
