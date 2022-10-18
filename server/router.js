module.exports = app => {
  const { IS_DEV } = require('@apiHelpers');
  const { URL } = require('@config').server;
  const PUBLIC_PATTERN = '/*';

  app.use(URL, require('@routes/index'));

  if (IS_DEV) {
    // catch 404 and forward to error handler
    const { NOT_FOUND } = require('@httpSt');

    app.get(PUBLIC_PATTERN, (req, res) => {
      res.status(NOT_FOUND).json({ message: 'Not Found', error: NOT_FOUND });
    });
  } else {
    const path = require('path');
    const BUILT_CLIENT = 'client';

    app.use(require('express').static(BUILT_CLIENT));

    app.get('/admin' + PUBLIC_PATTERN, (req, res) => {
      res.sendFile(path.resolve(BUILT_CLIENT, 'admin.html'));
    });
    app.get(PUBLIC_PATTERN, (req, res) => {
      res.sendFile(path.resolve(BUILT_CLIENT, 'index.html'));
    });
  }
};
