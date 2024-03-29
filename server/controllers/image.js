const { IncomingForm } = require('formidable');
const path = require('path');
const fs = require('fs');
const { waterfall, each, eachSeries } = require('async');
const { UPLOAD_PATH } = require('@config').client;
const { SUCCESS, ERROR } = require('@httpSt');
const { getIdParts, exist } = require('@apiHelpers');
const { sendError, sendResult } = require('@contr/crud');

let uploadPath;

const sendMessage = (res, err, messages, info = false) => {
  if (err) {
    return res.status(ERROR).json({ message: messages.error });
  }

  const data = { message: messages.success };

  if (info) {
    data.info = info;
  }

  res.send(data);
};

const makeDir = dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

const setUploadPath = (dir, layer = -1) => {
  makeDir(UPLOAD_PATH);

  uploadPath = dir ? path.join(UPLOAD_PATH, dir) : UPLOAD_PATH;

  if (layer >= 0) {
    uploadPath = path.join(uploadPath, 'layer_' + layer);
  }

  makeDir(uploadPath);
};

const getUploadPath = () => {
  return uploadPath;
};

const getTempPath = (dir, layer = -1) => {
  setUploadPath(dir, layer);
  return path.join(process.cwd(), uploadPath);
};

const upload = (req, res, existName = '', dir = '', layer = -1) => {
  const TEMP_PATH = getTempPath(dir, layer);
  console.log(TEMP_PATH);

  fs.access(path.join(TEMP_PATH, existName), fs.constants.F_OK, err => {
    if (!err) {
      console.log(err);
      return res.status(ERROR).json({
        message: 'Файл ' + existName + ' уже существует',
      });
    }

    console.error('file does not exists');

    const form = new IncomingForm();

    form.uploadDir = TEMP_PATH;
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(ERROR).json({
          message: 'Не удалось загрузить изображение',
        });
      }

      const filePath = files.image.path;
      const fileName = files.image.name;

      fs.rename(filePath, path.join(uploadPath, fileName), err => {
        sendMessage(res, err, {
          success: 'Изображение успешно добавлено',
          error: 'Не удалось переместить изображение',
        });
      });
    });
  });
};

function getFiles(dirPath, cb) {
  if (!fs.existsSync(dirPath)) {
    return cb(null, []);
  }

  fs.readdir(dirPath, (err, files) => {
    if (err) {
      return cb(err);
    }

    let filePaths = [];

    eachSeries(
      files,
      (fileName, eachCB) => {
        var filePath = path.join(dirPath, fileName);

        fs.stat(filePath, (err, stat) => {
          if (err) {
            return eachCB(err);
          }

          if (stat.isDirectory()) {
            getFiles(filePath, (err, subDirFiles) => {
              if (err) {
                return eachCB(err);
              }

              filePaths = filePaths.concat(subDirFiles);
              eachCB(null);
            });
          } else {
            // if (stat.isFile() && /\.js$/.test(filePath)) {
            // filePaths.push(filePath);
            const { name, ext } = path.parse(filePath);
            filePaths.push({ name, ext });
            // filePaths.push(name);
            // }

            eachCB(null);
          }
        });
      },
      err => {
        cb(err, filePaths);
      },
    );
  });
}

const load = (req, res, startIndex = 0, count = 0) => {
  getFiles(UPLOAD_PATH, (err, files) => {
    if (err) {
      res.status(ERROR).json({
        message: `При чтении каталога произошла ошибка: ${err}`,
      });
      return;
    }
    // const collator = new Intl.Collator('en');
    const sorted = files.sort((a, b) => {
      const aKeys = getIdParts(a.name);
      const bKeys = getIdParts(b.name);
      let i = 0;
      let result = 0;

      while (exist(i, aKeys) && exist(i, bKeys)) {
        result = parseInt(aKeys[i]) - parseInt(bKeys[i]);

        if (result != 0) {
          return result;
        }

        i++;
      }

      // console.log('A = ' + A + ' and B = ' + B);
      // return parseInt(a.name) - parseInt(b.name);
      return bKeys.length - aKeys.length;
    });

    const FINAL_INDEX = !count ? sorted.length : startIndex + count;
    const sliced = sorted.slice(startIndex, FINAL_INDEX);

    // console.log(sliced);

    res.status(SUCCESS).json({ count: sliced.length, items: sliced });
  });
};

const rename = (res, oldName, newName, dir = '', layer = -1) => {
  setUploadPath(dir, layer);
  const NEW_PATH = path.join(uploadPath, newName);

  fs.access(NEW_PATH, fs.constants.F_OK, err => {
    if (!err) {
      console.log(err);
      return res.status(ERROR).json({
        message: 'Файл ' + newName + ' уже существует',
      });
    }

    const OLD_PATH = path.join(uploadPath, oldName);

    fs.rename(OLD_PATH, NEW_PATH, err => {
      sendMessage(res, err, {
        success: 'Изображение успешно переименовано',
        error: 'Не удалось переименовать изображение',
      });
    });
  });
};

const remove = (res, imageName, dir = '', layer = -1, cb = false) => {
  setUploadPath(dir, layer);
  const IMAGE_PATH = path.join(uploadPath, imageName);

  if (cb !== false) {
    return fs.unlink(IMAGE_PATH, cb);
  }

  fs.unlink(IMAGE_PATH, err => {
    sendMessage(res, err, {
      success: 'Изображение успешно удалено',
      error: 'Не удалось удалить изображение',
    });
  });
};

const isAnyBreakpointImage = (dir, breakpoints, layer = -1) => {
  setUploadPath(dir, layer);

  for (let index = 0; index < breakpoints.length; index++) {
    const checkingPath = path.join(getUploadPath(), breakpoints[index]);
    console.log(checkingPath);

    if (fs.existsSync(checkingPath)) {
      return true;
    }
  }

  return false;
};

const deleteBreakpointImages = (dir, data, breakpoints, highCB, layer = -1) => {
  setUploadPath(dir, layer);
  each(
    breakpoints,
    (breakpoint, cb) => {
      const deleteUploadPath = path.join(getUploadPath(), breakpoint);

      if (fs.existsSync(deleteUploadPath)) {
        fs.unlink(deleteUploadPath, cb);
      } else {
        cb(null, data);
      }
    },
    (err, info) => {
      console.log(err);
      return highCB(err, info);
    },
  );
};

const waterfallCB = (err, result, res, mode) => {
  if (err) {
    return sendError(err, res, mode);
  }
  return sendResult(result, res, mode);
};

const startWaterfall = (res, mode, cbArray, images = []) => {
  waterfall(cbArray, (err, result) => {
    // return fs.unlink(image.path, (err, result) => {
    //   return waterfallCB(err, result, { res, mode, image });
    // });

    each(
      images.filter(item => !!item),
      (image, cb) => {
        fs.unlink(image.path, cb);
      },
      err => {
        return waterfallCB(err, result, res, mode);
      },
    );
  });
};

module.exports = {
  sendMessage,
  makeDir,
  setUploadPath,
  getUploadPath,
  getTempPath,
  upload,
  load,
  rename,
  remove,
  isAnyBreakpointImage,
  deleteBreakpointImages,
  startWaterfall,
  waterfallCB,
};
