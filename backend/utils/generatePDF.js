/**
 * Generates a beautiful HTML report template suitable for browser printing to PDF.
 * @param {string} title Report Title
 * @param {string[]} headers Table columns
 * @param {Object[]} data Records list
 * @param {string[]} keyMap Attribute mapping keys
 * @returns {string} Styled HTML document string
 */
const generatePDF = (title, headers, data, keyMap) => {
  const dateStr = new Date().toLocaleString();
  
  const tableHeaders = headers.map(h => `<th>${h}</th>`).join('');
  const tableRows = data.map((row, idx) => {
    const cells = keyMap.map(key => {
      let val = row[key];
      if (val === undefined || val === null) val = '';
      if (typeof val === 'number' && key.toLowerCase().includes('price')) {
        return `<td>$${val.toFixed(2)}</td>`;
      }
      return `<td>${val}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 40px;
          color: #333;
          background-color: #fff;
        }
        header {
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 20px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        h1 {
          margin: 0;
          color: #1e3a8a;
          font-size: 24px;
        }
        .meta {
          font-size: 12px;
          color: #666;
          text-align: right;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
          font-size: 13px;
        }
        th {
          background-color: #f3f4f6;
          color: #111827;
          font-weight: 600;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 11px;
          color: #999;
          border-top: 1px solid #eee;
          padding-top: 10px;
        }
        @media print {
          body { margin: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="padding: 8px 16px; background-color: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
          Print Report / Save as PDF
        </button>
      </div>
      <header>
        <div>
          <h1>Goods Distribution Warehouse Register</h1>
          <h2 style="margin: 5px 0 0 0; font-size: 16px; font-weight: 500; color: #4b5563;">${title}</h2>
        </div>
        <div class="meta">
          <div>Generated on: ${dateStr}</div>
          <div>Status: Official Log</div>
        </div>
      </header>
      <table>
        <thead>
          <tr>${tableHeaders}</tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <div class="footer">
        © ${new Date().getFullYear()} Goods Distribution Warehouse Stock Register. Confidential Internal Log.
      </div>
    </body>
    </html>
  `;
};

module.exports = generatePDF;
