/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  let value;
  const fields = path.split('.');

  return function getter(obj) {
    fields.forEach((field) => {

      if (!!obj[field]) {
        typeof obj[field] === 'object'
          ? getter(obj[field])
          : (value = obj[field]);
      }
    });
    return value;
  };
}
