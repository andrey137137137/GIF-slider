const router = require('express').Router();
const image = require('@contr/image');

router.post('/', (req, res) => {
  image.upload(req, res);
});
router.get('/', (req, res) => {
  image.load(req, res);
});
router.delete('/:name', (req, res) => {
  image.remove(res, req.params.name);
});

module.exports = router;
