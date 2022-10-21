import { IS_DEV, SERVER_PORT } from '@apiHelpers';

function getServerBaseUrl() {
  const SERVER_URL = process.env.VUE_APP_SERVER_URL;
  if (!IS_DEV) {
    return SERVER_URL;
  }
  const { VUE_APP_SERVER_PROTOCOL, VUE_APP_SERVER_HOST } = process.env;
  return `${VUE_APP_SERVER_PROTOCOL}://${VUE_APP_SERVER_HOST}:${SERVER_PORT}${SERVER_URL}`;
  // return `${VUE_APP_SERVER_PROTOCOL}://${VUE_APP_SERVER_HOST}${SERVER_URL}`;
}

export const SERVER_BASE_URL = getServerBaseUrl();

export const getImg = (img, files) => {
  const start = img.lastIndexOf('.');
  const ext = img.slice(start + 1);
  return files[ext](`./${img}`);
};
