const router = require('express').Router();

const { isAuth } = require('@auth');
const image = require('@contr/image');

router.post('/avatar', isAuth, (req, res) => {
  image.upload(req, res);
});
router.post('/about', isAuth, (req, res) => {
  image.upload(req, res, 'about');
});
router.post('/works', isAuth, (req, res) => {
  image.upload(req, res, 'works');
});
router.post('/parallax/:layer', isAuth, (req, res) => {
  image.upload(req, res, 'parallax', req.params.layer);
});

module.exports = router;
