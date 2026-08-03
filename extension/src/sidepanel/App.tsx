import React from 'react';

export default function App() {
  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          background: '#4F46E5',
          borderRadius: '12px',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          color: 'white',
          fontSize: '26px',
          fontWeight: 700,
          letterSpacing: '-1px',
          userSelect: 'none',
        }}
      >
        L
      </div>

      <h1
        style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#1e293b',
          margin: '0 0 6px',
        }}
      >
        LeadsBuddy.ai
      </h1>

      <p
        style={{
          fontSize: '13px',
          color: '#64748b',
          margin: '0 0 32px',
          textAlign: 'center',
        }}
      >
        Extension Setup Complete
      </p>

      <div
        style={{
          background: '#f1f5f9',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '13px',
          color: '#94a3b8',
          letterSpacing: '0.5px',
        }}
      >
        UI Coming Soon
      </div>
    </div>
  );
}
