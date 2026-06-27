import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';

const DataTable = ({ headers, keys, data = [], actions, searchPlaceholder = "Search records..." }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

  // Search Filter
  const filteredData = data.filter(item => {
    return keys.some(key => {
      const val = item[key];
      if (!val) return false;
      return String(val).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Sort Filter
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    
    let valA = a[sortKey];
    let valB = b[sortKey];

    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = (valB || '').toLowerCase();
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination Filter
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      {/* Search and Page Size Controllers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="form-control"
          style={{ maxWidth: '320px' }}
        />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span>Show</span>
          <select 
            value={pageSize} 
            onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
            className="form-control"
            style={{ width: '80px', padding: '0.4rem 0.5rem' }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>
      </div>

      {/* Table Data Wrapper */}
      <div className="table-wrapper glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              {headers.map((header, idx) => {
                const key = keys[idx];
                const isSortable = !!key;
                return (
                  <th 
                    key={idx} 
                    onClick={() => isSortable && handleSort(key)}
                    style={{ cursor: isSortable ? 'pointer' : 'default', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {header}
                      {isSortable && <ChevronsUpDown size={14} style={{ opacity: sortKey === key ? 1 : 0.4 }} />}
                    </div>
                  </th>
                );
              })}
              {actions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={headers.length + (actions ? 1 : 0)} style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-muted)' }}>
                  No matching records found.
                </td>
              </tr>
            ) : (
              currentItems.map((item, rowIdx) => (
                <tr key={item.id || rowIdx}>
                  {keys.map((key, colIdx) => {
                    const value = item[key];
                    
                    // Format dates automatically if columns are timestamps
                    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('updated') || key.toLowerCase().includes('created')) {
                      return <td key={colIdx}>{value ? new Date(value).toLocaleDateString() + ' ' + new Date(value).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</td>;
                    }
                    
                    // Format price / cost Columns
                    if (key.toLowerCase() === 'price') {
                      return <td key={colIdx}>₹{parseFloat(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>;
                    }

                    // Format quantity status labels
                    if (key === 'status') {
                      let badgeClass = 'badge-blue';
                      if (value === 'available' || value === 'restocked' || value === 'delivered' || value === 'shipped') badgeClass = 'badge-success';
                      if (value === 'pending' || value === 'quarantined') badgeClass = 'badge-warning';
                      if (value === 'damaged' || value === 'disposed') badgeClass = 'badge-danger';
                      return (
                        <td key={colIdx}>
                          <span className={`badge ${badgeClass}`}>{value.toUpperCase()}</span>
                        </td>
                      );
                    }

                    return <td key={colIdx}>{value !== undefined && value !== null ? String(value) : 'N/A'}</td>;
                  })}
                  {actions && (
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {actions(item)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
          </span>
          
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              className="btn btn-secondary btn-small"
              style={{ padding: '6px 8px' }}
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`btn btn-small ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
                style={{ minWidth: '32px', padding: '6px' }}
              >
                {page}
              </button>
            ))}

            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="btn btn-secondary btn-small"
              style={{ padding: '6px 8px' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
