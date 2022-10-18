module.exports = (app) => {
  // const cookieParser = require('cookie-parser');
  const bodyParser = require('body-parser');

  // const cookieExpirationDate = new Date();
  // const cookieExpirationDays = 365;

  // cookieExpirationDate.setDate(
  //   cookieExpirationDate.getDate() + cookieExpirationDays
  // );

  // app.use(require('cookie-parser')());

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
};
