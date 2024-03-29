const router = require('express').Router();
const image = require('@contr/image');

router.post('/:existName', (req, res) => {
  image.upload(req, res, req.params.existName);
});
router.get('/', (req, res) => {
  image.load(req, res);
});
router.get('/:oldName/:newName', (req, res) => {
  const { oldName, newName } = req.params;
  image.rename(res, oldName, newName);
});
router.delete('/:name', (req, res) => {
  image.remove(res, req.params.name);
});

module.exports = router;
