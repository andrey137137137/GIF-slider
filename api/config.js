const path = require('path');
// const result = require('dotenv').config();
// const result2 = require('dotenv').config({ path: '.env.development.local' });
require('dotenv').config();
require('dotenv').config({ path: '.env.development.local' });
const { IS_DEV, SERVER_PORT, CLIENT_PATH } = require('./helpers');

// console.log(result);
// console.log(result2);

const { VUE_APP_SERVER_PROTOCOL, VUE_APP_SERVER_HOST, VUE_APP_SERVER_URL } =
  process.env;
const ROOT_PATH = IS_DEV ? 'public' : CLIENT_PATH;

module.exports = {
  client: {
    NAME: 'Vue Server',
    PORT: IS_DEV ? 5000 : SERVER_PORT,
    PROD_PATH: CLIENT_PATH,
    UPLOAD_PATH: path.join(ROOT_PATH, 'upload'),
  },
  server: {
    NAME: 'API Server',
    PROTOCOL: VUE_APP_SERVER_PROTOCOL,
    HOST: VUE_APP_SERVER_HOST,
    PORT: SERVER_PORT,
    URL: VUE_APP_SERVER_URL,
  },
};
