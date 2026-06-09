const Url = require('../models/Url');
const { nanoid } = require('nanoid');

const createShortUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    
    if (!originalUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const shortCode = nanoid(6);
    
    const url = new Url({
      originalUrl,
      shortCode
    });

    await url.save();
    
    res.status(201).json({
      originalUrl: url.originalUrl,
      shortUrl: `${req.protocol}://${req.get('host')}/${url.shortCode}`,
      shortCode: url.shortCode,
      clickCount: url.clickCount,
      createdAt: url.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const redirectToOriginalUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    const url = await Url.findOne({ shortCode });
    
    if (!url) {
      return res.status(404).sendFile('expired.html', { root: './public' });
    }
    
    url.clickCount += 1;
    await url.save();
    
    res.redirect(url.originalUrl);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllUrls = async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    res.json(urls);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteUrl = async (req, res) => {
  try {
    const { id } = req.params;
    
    await Url.findByIdAndDelete(id);
    
    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const urls = await Url.find();
    const totalUrls = urls.length;
    const totalClicks = urls.reduce((sum, url) => sum + url.clickCount, 0);
    
    res.json({
      totalUrls,
      totalClicks,
      activeLinks: totalUrls
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createShortUrl,
  redirectToOriginalUrl,
  getAllUrls,
  deleteUrl,
  getAnalytics
};
