const express = require('express');
const {
  createShortUrl,
  redirectToOriginalUrl,
  getAllUrls,
  deleteUrl,
  getAnalytics
} = require('../controllers/urlController');

const router = express.Router();

router.post('/api/shorten', createShortUrl);
router.get('/api/urls', getAllUrls);
router.delete('/api/url/:id', deleteUrl);
router.get('/api/analytics', getAnalytics);
router.get('/:shortCode', redirectToOriginalUrl);

module.exports = router;
