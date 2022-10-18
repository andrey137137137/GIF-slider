module.exports = app => {
  const { PROTOCOL, HOST } = require('@config').server;
  const { PORT } = require('@config').client;
  const { SUCCESS } = require('@httpSt');

  app.use(
    require('cors')({
      origin: `${PROTOCOL}://${HOST}:${PORT}`,
      optionsSuccessStatus: SUCCESS,
      credentials: true,
    }),
  );
};
