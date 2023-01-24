/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const sortArr = [...arr];

  function compareLocales(a, b, caseFirst) {
    return a.localeCompare(b, ['ru', 'en'], caseFirst);
  }

  return sortArr.sort((a, b) =>
    param === 'desc' ? compareLocales(b, a) : compareLocales(a, b, { caseFirst: 'upper' })
  );
}
