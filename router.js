const express = require('express');
const router = express.Router();
const axios = require('axios');


router.get('/error', function (req, res) {
  res.status(500).render('error');
});

router.get('/googlee023af832ca272f7.html', (req, res) => {
res.render('googlee023af832ca272f7');
});

router.get('/', (req, res) => {
  res.render('home');
});

router.get('/menu', (req, res) => {
  res.render('menu');
});


module.exports = router;
