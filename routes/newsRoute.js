const express = require('express');
const router = express.Router();
const axios = require('axios');
const News = require('../models/New');

const NEWS_API = 'https://newsapi.org/v2/top-headlines?country=in';

router.get('/fetch', async (req, res) => {
  try {
    const response = await axios.get(NEWS_API, {
      headers: {
        'Authorization': `Bearer ${process.env.NEWS_API_KEY}`
      }
    });

    const articles = response.data.articles;

    const saved = await News.insertMany(articles, { ordered: false });
    res.json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  const news = await News.find().sort({ publishedAt: -1 });
  res.json(news);
});

module.exports = router;
