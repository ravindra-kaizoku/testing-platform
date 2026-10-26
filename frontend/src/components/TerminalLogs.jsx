import React, { useEffect, useRef } from 'react';

function TerminalLogs({ logs }) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    // Auto scroll to bottom when new logs arrive
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const getLineColor = (line) => {
    if (line.includes('[ERROR]') || line.includes('Compilation failure') || line.includes('[FAIL]') || line.startsWith('Tests run:') && (line.includes('Failures: ') && !line.includes('Failures: 0') || line.includes('Errors: ') && !line.includes('Errors: 0'))) {
      return '#f87171'; // red
    }
    if (line.includes('BUILD SUCCESS') || line.includes('SUCCESS') || line.startsWith('Tests run:') && line.includes('Failures: 0') && line.includes('Errors: 0')) {
      return '#4ade80'; // green
    }
    if (line.includes('[SYSTEM INFO]') || line.includes('[SYSTEM ERROR]')) {
      return '#c084fc'; // purple
    }
    if (line.includes('[INFO]')) {
      return '#38bdf8'; // cyan
    }
    return '#cbd5e1'; // light gray
  };

  const logLines = logs ? logs.split('\n') : [];

  return (
    <div style={{
      background: '#040711',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)'
    }}>
      {/* Terminal Title Header */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '10px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '11px',
        color: 'var(--text-muted)',
        fontFamily: 'monospace',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>EXECUTION LOGS (SANDBOX)</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
        </div>
      </div>

      {/* Terminal Output Area */}
      <div style={{
        padding: '16px',
        overflowY: 'auto',
        flex: 1,
        fontFamily: 'Consolas, Monaco, "Lucida Console", monospace',
        fontSize: '12px',
        lineHeight: '1.7',
        textAlign: 'left'
      }}>
        {logLines.map((line, index) => (
          <div key={index} style={{ color: getLineColor(line), minHeight: '18px', whiteSpace: 'pre-wrap' }}>
            {line}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}

export default TerminalLogs;
