const router = require('express').Router();
const image = require('@contr/image');

router.post('/upload', (req, res) => {
  image.upload(req, res);
});
router.post('/about', (req, res) => {
  image.upload(req, res, 'about');
});
router.get('/load', (req, res) => {
  image.load(req, res);
});
router.post('/parallax/:layer', (req, res) => {
  image.upload(req, res, 'parallax', req.params.layer);
});

module.exports = router;
