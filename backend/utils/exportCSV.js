/**
 * Utility to convert raw object array data to clean CSV string.
 * @param {string[]} headers Array of column titles
 * @param {Object[]} data Raw rows data array
 * @param {string[]} keyMap Array of keys mapping to the columns in order
 * @returns {string} CSV formatted text
 */
const exportCSV = (headers, data, keyMap) => {
  const headerRow = headers.join(',');
  const dataRows = data.map(row => {
    return keyMap.map(key => {
      let val = row[key];
      if (val === undefined || val === null) {
        val = '';
      }
      val = String(val).replace(/"/g, '""'); // escape quotes
      if (val.includes(',') || val.includes('\n') || val.includes('"')) {
        val = `"${val}"`;
      }
      return val;
    }).join(',');
  });
  return [headerRow, ...dataRows].join('\n');
};

module.exports = exportCSV;
