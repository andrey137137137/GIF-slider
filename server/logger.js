module.exports = app => {
  // const bunyan = require('bunyan');
  // const { NAME } = require('@config').server;

  // const log = bunyan.createLogger({
  //   name: NAME,
  //   serializers: {
  //     req: bunyan.stdSerializers.req,
  //     res: bunyan.stdSerializers.res,
  //   },
  // });

  app.use(require('errorhandler')());
};
