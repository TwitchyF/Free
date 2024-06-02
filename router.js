const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/req', async (req, res) => {
    try {
        const response = await axios.get('https://tattered-classy-comic.glitch.me/read');
        const data = response.data;
        res.render('req', { jsonData: data });
    } catch (error) {
        console.error('Error fetching JSON data:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/error', function (req, res) {
  res.status(500).render('error');
});

router.get('/googlee023af832ca272f7.html', (req, res) => {
res.render('googlee023af832ca272f7');
});

router.get('/loading', (req, res) => {
  res.render('loading');
});

router.get('/', (req, res) => {
  res.render('home');
});

router.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

router.get('/other', (req, res) => {
  res.render('other');
});

router.get('/ai', (req, res) =>{
  res.render('ai');
});

router.get('/downloader', (req, res) =>{
  res.render('download');
});

router.get('/search', (req, res) =>{
  res.render('search');
});

module.exports = router;
