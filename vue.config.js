const path = require('path');
const packageJson = require('./package.json');

const apiHelpersPath = resolve(packageJson._moduleAliases['@apiHelpers']);
const { CLIENT_PATH, CLIENT_PORT } = require(apiHelpersPath);
const ASSETS_PATH = 'assets';
const DEV_PATH = 'src';

function resolve(dir) {
  return path.join(__dirname, dir);
}

function resolveSrc(dir) {
  return resolve(path.join(DEV_PATH, dir));
}

module.exports = {
  publicPath: '/',
  outputDir: CLIENT_PATH,
  devServer: {
    port: CLIENT_PORT,
  },
  css: {
    loaderOptions: {
      sass: {
        data: `@import "@/styles/variables.scss"; @import "@/styles/mixins.scss";`,
      },
    },
  },
  chainWebpack: config => {
    config.resolve.alias.set(
      '@httpSt',
      resolve(packageJson._moduleAliases['@httpSt']),
    );
    config.resolve.alias.set(
      '@apiHelpers',
      resolve(packageJson._moduleAliases['@apiHelpers']),
    );
    config.resolve.alias.set('@assets', resolveSrc(ASSETS_PATH));
    config.resolve.alias.set('@helpers', resolveSrc('helpers.js'));
    config.resolve.alias.set('@styles', resolveSrc('styles'));
    config.resolve.alias.set('@components', resolveSrc('components'));
  },
};
