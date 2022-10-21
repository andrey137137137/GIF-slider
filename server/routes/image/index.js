const router = require('express').Router();
const image = require('@contr/image');

router.post('/avatar', (req, res) => {
  image.upload(req, res);
});
router.post('/about', (req, res) => {
  image.upload(req, res, 'about');
});
router.post('/works', (req, res) => {
  image.upload(req, res, 'works');
});
router.post('/parallax/:layer', (req, res) => {
  image.upload(req, res, 'parallax', req.params.layer);
});

module.exports = router;
