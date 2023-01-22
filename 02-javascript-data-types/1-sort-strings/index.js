/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const sortArr = arr.map((item) => item.trim());

  if (param === 'desc') {
    sortArr.sort((a, b) => (a.trim()).localeCompare((b.trim()), ['ru', 'en']));
    return sortArr.reverse();
  }
  return sortArr.sort((a, b) => (a.trim()).localeCompare((b.trim()), ['ru', 'en'], { caseFirst: "upper" }));
}
