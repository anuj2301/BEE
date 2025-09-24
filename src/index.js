const express = require('express');
const mongoose = require('mongoose');
const validator = require('validator');
const shortid = require('shortid');
const connectDB = require('./config/db');
const Url = require('./models/url');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/shorten', async (req, res) => {
  const { originalUrl } = req.body;

  if (!validator.isURL(originalUrl)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    let url = await Url.findOne({ originalUrl });

    if (url) {
      return res.json(url);
    }

    const shortId = shortid.generate();
    const shortUrl = `http://localhost:5000/${shortId}`; // Replace with your domain

    url = new Url({
      originalUrl,
      shortId,
      shortUrl,
    });

    await url.save();

    res.json(url);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/:shortId', async (req, res) => {
  try {
    const url = await Url.findOne({ shortId: req.params.shortId });

    if (url) {
      return res.redirect(url.originalUrl);
    } else {
      return res.status(404).json('URL not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));