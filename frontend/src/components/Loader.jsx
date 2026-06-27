import React from 'react';

const Loader = ({ fullPage }) => {
  const loaderStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: fullPage ? '100vh' : '200px',
    backgroundColor: fullPage ? 'var(--bg-primary)' : 'transparent',
    color: 'var(--text-primary)',
    flexDirection: 'column',
    gap: '1.5rem',
    zIndex: 9999
  };

  const spinnerStyle = {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255, 255, 255, 0.05)',
    borderTop: '4px solid var(--accent-blue)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  // Add the CSS animation dynamically to head if not present
  if (!document.getElementById('loader-animation-style')) {
    const style = document.createElement('style');
    style.id = 'loader-animation-style';
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  return (
    <div style={loaderStyle}>
      <div style={spinnerStyle}></div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
        LOADING WAREHOUSE LEDGERS...
      </p>
    </div>
  );
};

export default Loader;
