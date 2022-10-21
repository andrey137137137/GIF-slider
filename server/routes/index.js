const router = require('express').Router();
const { NOT_FOUND } = require('@httpSt');

router.use('/image', require('./image'));

router.get('*', (req, res) => {
  res.status(NOT_FOUND).json({ msg: 'Not found', err: NOT_FOUND });
});

module.exports = router;
