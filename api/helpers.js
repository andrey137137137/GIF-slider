const IS_DEV = process.env.NODE_ENV !== 'production';
const SERVER_PORT = process.env.PORT || 3000;
const CLIENT_PORT = IS_DEV ? 5000 : SERVER_PORT;
const CLIENT_PATH = 'client';
const ID_SEPARATOR = '.';

const deviceBreakpoints = [
  { name: 'xl', value: 1800 },
  { name: 'lg', value: 1200 },
  { name: 'md', value: 768 },
  { name: 'sm', value: 0 },
];

function getBreakpointsWithExcludes(exludes = []) {
  const breakpoints = [];

  deviceBreakpoints.forEach(item => {
    const { name, value } = item;

    for (let index = 0; index < exludes.length; index++) {
      if (name == exludes[index]) {
        return;
      }
    }

    breakpoints.push({ name, value });
  });

  return breakpoints;
}

const getIdParts = str => {
  return str.split(ID_SEPARATOR);
};

const exist = (property, obj = window) => {
  // return Object.prototype.hasOwnProperty.call(obj, property);
  return typeof obj[property] !== 'undefined';
};

const getPositiveValue = value => {
  return value > 0 ? value : 0;
};

const getBreakpointNamesWithoutXL = (isFirstSmallest = true) => {
  return getBreakpointNames(['xl'], isFirstSmallest);
};

const getBreakpointNames = (exludes = [], isFirstSmallest = true) => {
  const breakpoints = getBreakpointsWithExcludes(exludes);
  const breakpointNames = breakpoints.map(item => item.name);
  return isFirstSmallest ? breakpointNames.reverse() : breakpointNames;
};

const getBreakpointsWithExt = (ext, exludes = []) => {
  const breakpoints = getBreakpointsWithExcludes(exludes);

  return breakpoints.map(item => {
    const { name, value } = item;
    return { name: `${name}.${ext}`, value };
  });
};

const getSlideImageName = (id, name) => {
  return `${id}_${name}`;
};

module.exports = {
  IS_DEV,
  SERVER_PORT,
  CLIENT_PORT,
  CLIENT_PATH,
  ID_SEPARATOR,
  deviceBreakpoints,
  getIdParts,
  exist,
  getPositiveValue,
  getBreakpointNamesWithoutXL,
  getBreakpointNames,
  getBreakpointsWithExt,
  getSlideImageName,
};
