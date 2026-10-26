import React from 'react';

function CodeViewer({ fileName, content, loading }) {
  if (loading) {
    return (
      <div className="glass-panel" style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        minHeight: '400px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            border: '3px solid rgba(255,255,255,0.05)',
            borderTop: '3px solid var(--accent-cyan)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px auto'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <span>Loading source code...</span>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="glass-panel" style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        minHeight: '400px',
        padding: '24px'
      }}>
        Select a Java class file from the left explorer panel to load its content.
      </div>
    );
  }

  // Split lines to render line numbers
  const lines = content.split('\n');

  return (
    <div className="glass-panel" style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      {/* Code Header Tab */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.4)',
        padding: '10px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        display: 'flex',
        justifyContent: 'between',
        alignItems: 'center'
      }}>
        <span>Java Code View</span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lines.length} lines</span>
      </div>

      {/* Editor Content Box */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        background: '#090d16',
        display: 'flex',
        padding: '16px 0',
        fontFamily: 'monospace',
        fontSize: '13px',
        lineHeight: '1.6'
      }}>
        {/* Line Numbers */}
        <div style={{
          padding: '0 16px',
          textAlign: 'right',
          color: 'var(--text-muted)',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          userSelect: 'none',
          minWidth: '32px'
        }}>
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Source Lines */}
        <pre style={{
          margin: 0,
          padding: '0 20px',
          overflowX: 'auto',
          color: '#cbd5e1',
          width: '100%'
        }}>
          <code>
            {lines.map((line, i) => (
              <div key={i} style={{ minHeight: '20px' }}>{line || ' '}</div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

export default CodeViewer;
