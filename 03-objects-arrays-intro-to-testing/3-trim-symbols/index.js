/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (!size) {
    return typeof size === 'undefined' ? string : '';
  }

  let arr = [...string];
  let count = 1;
  
  let res = arr.reduce((acc, currentValue) => {
    if (!size) {
      acc = ''
      return acc
    }
    if (!acc.length) {
      acc += currentValue;
      return acc;
    }

    if (acc.at(-1) === currentValue && count < size) {
      acc += currentValue;
      count++;
    }

    if (acc.at(-1) !== currentValue) {
      count = 1;
      acc += currentValue;
    }

    return acc;
  }, '');

  return res;
}
