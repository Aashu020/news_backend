const express = require('express');
// import { FindOneAndDeleteOperation } from './../node_modules/mongodb/src/operations/find_and_modify';
const router = express.Router();
const axios = require('axios');
const News = require('../models/New');
const Headline  = require('../models/Headline')

// Fetch and store articles using everything
router.get('/fetch', async (req, res) => {
  try {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const from = yesterday.toISOString().split("T")[0];
    const to = today.toISOString().split("T")[0];
    
    const url = `https://newsapi.org/v2/everything?q=Apple&from=${from}&to=${to}&language=en&sortBy=popularity&apiKey=${process.env.NEWS_API_KEY}`;;
    console.log("Requesting:", url);

    const response = await axios.get(url);
    const articles = response.data.articles;
    console.log(`Articles fetched: ${articles.length}`);

    if (!articles || articles.length === 0) {
      return res.status(404).json({ message: "No articles found." });
    }

    const formattedArticles = articles.map(article => ({
      ...article,
      publishedAt: new Date(article.publishedAt),
    }));

    const saved = await News.insertMany(formattedArticles, { ordered: false });
    res.json({ message: "News saved", count: saved.length });

  } catch (err) {
    console.error("Error fetching news:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Fetch top headlines
router.get('/fetch-top-headlines', async (req, res) => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - 1); // 👈 Get yesterday's date
    const formatted = date.toISOString().split("T")[0];

    const url = `https://newsapi.org/v2/everything?q=Apple&from=${formatted}&sortBy=popularity&apiKey=${process.env.NEWS_API_KEY}`;
    console.log("Requesting:", url);

    const response = await axios.get(url);
    const articles = response.data.articles;
    console.log(`Top headlines fetched: ${articles.length}`);

    if (!articles || articles.length === 0) {
      return res.status(404).json({ message: "No articles found." });
    }

    const formattedArticles = articles.map(article => ({
      ...article,
      publishedAt: new Date(article.publishedAt),
    }));

    const saved = await News.insertMany(formattedArticles, { ordered: false });
    res.json({ message: "Top headlines saved", count: saved.length });

  } catch (err) {
    console.error("Error fetching top headlines:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Route 3: Get all news from MongoDB with filters
router.get('/', async (req, res) => {
  try {
    const { title, description, from, to } = req.query;

    let filter = {};

    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }

    if (description) {
      filter.description = { $regex: description, $options: 'i' };
    }

    if (from || to) {
      filter.publishedAt = {};
      if (from) filter.publishedAt.$gte = new Date(from);
      if (to) filter.publishedAt.$lte = new Date(to);
    }

    const news = await News.find(filter).sort({ publishedAt: -1 });
    res.json(news);

  } catch (err) {
    console.error("Error loading news from DB:", err.message);
    res.status(500).json({ error: err.message });
  }
});


router.get('/:id', async (req, res) => {
    try {
      const article = await News.findById(req.params.id);
      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }
      res.json(article);
    } catch (err) {
      console.error('Error fetching article by ID:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  router.delete("/del/:id", async(req,res)=>{
    try {
        const del = await News.findByIdAndDelete(req.params.id);
        if(!del){
            return res.status(404).json({message:"Cannot delete"});
        }
        return res.status(200).json({message:"Successfully Deleted"})
    }catch(err){
        res.status(500).json({message:"Internal Error"})
    }
  });

// router.get('/top-headlines', async (req, res) => {
//     try {
//       const headlines = await Headline.find().sort({ publishedAt: -1 }).limit(8); // only top 8
//       res.json(headlines);
//     } catch (err) {
//       console.error("Error loading top headlines:", err.message);
//       res.status(500).json({ error: err.message });
//     }
//   });

module.exports = router;
