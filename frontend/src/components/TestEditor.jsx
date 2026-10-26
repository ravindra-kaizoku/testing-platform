import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, FileCode, CheckCircle2, ChevronRight, AlertCircle, Play } from 'lucide-react';

function TestEditor({ projectId, fileId, fileName, originalContent, onBack }) {
  const [testCode, setTestCode] = useState('');
  const [filePath, setFilePath] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, success, error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchExistingTest();
  }, [fileId]);

  const fetchExistingTest = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/files/${fileId}/tests`);
      if (res.status === 200) {
        const data = await res.json();
        setTestCode(data.content);
        setFilePath(data.filePath);
      } else if (res.status === 204) {
        // No test generated yet, trigger auto-generation
        generateAiTests();
      }
    } catch (err) {
      console.error("Failed to load test details", err);
      setErrorMsg("Failed to connect to the server.");
    } finally {
      setGenerating(false);
    }
  };

  const generateAiTests = async () => {
    setGenerating(true);
    setSaveStatus('idle');
    setErrorMsg('');
    try {
      const res = await fetch(`/api/projects/${projectId}/files/${fileId}/generate-tests`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setTestCode(data.content);
        setFilePath(data.filePath);
      } else {
        throw new Error("Server failed to generate test cases.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to generate tests. Check server logs.");
      setSaveStatus('error');
    } finally {
      setGenerating(false);
    }
  };

  const commitTest = async () => {
    setSaving(true);
    setSaveStatus('idle');
    setErrorMsg('');
    try {
      const res = await fetch(`/api/projects/${projectId}/files/${fileId}/save-tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: testCode })
      });
      if (res.ok) {
        const data = await res.json();
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error("Failed to commit test changes.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to save test.");
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }} className="fade-in">
      
      {/* Editor Control Header */}
      <div className="glass-panel" style={{
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'between',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>UNIT TEST EDITOR</span>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }} className="text-gradient">
            {filePath || 'Synthesizing Test Class...'}
          </h4>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {saveStatus === 'success' && (
            <span style={{ fontSize: '13px', color: '#86efac', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '8px' }}>
              <CheckCircle2 size={15} color="#22c55e" /> Saved
            </span>
          )}

          <button onClick={onBack} className="btn-secondary" disabled={generating || saving} style={{ padding: '8px 16px', fontSize: '13px' }}>
            Back to Files
          </button>
          
          <button 
            onClick={generateAiTests} 
            className="btn-secondary" 
            disabled={generating || saving}
            style={{ padding: '8px 16px', fontSize: '13px', color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.2)' }}
          >
            <RefreshCw size={14} className={generating ? "spin-animation" : ""} />
            Regenerate AI
          </button>

          <button 
            onClick={commitTest} 
            className="btn-primary" 
            disabled={generating || saving || !testCode}
            style={{ padding: '8px 20px', fontSize: '13px' }}
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save & Commit'}
          </button>
        </div>
      </div>

      {generating ? (
        <div className="glass-panel" style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          minHeight: '400px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spin-animation" style={{
              border: '3px solid rgba(255,255,255,0.05)',
              borderTop: '3px solid var(--accent-purple)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              margin: '0 auto 16px auto'
            }} />
            <span style={{ fontWeight: 500 }}>AI is parsing class structure and writing JUnit suite...</span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>Using prompt patterns for boundaries, edge, and negative cases.</p>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          flex: 1,
          minHeight: '450px',
          alignItems: 'stretch'
        }}>
          {/* Left panel - Original code view */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.4)',
              padding: '10px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <FileCode size={14} color="var(--accent-cyan)" />
              <span>Original: {fileName.split('/').pop()}</span>
            </div>
            <pre style={{
              margin: 0,
              padding: '16px',
              overflow: 'auto',
              flex: 1,
              fontFamily: 'monospace',
              fontSize: '12px',
              background: '#090d16',
              color: '#94a3b8'
            }}>{originalContent}</pre>
          </div>

          {/* Right panel - Test Editor */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.4)',
              padding: '10px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <FileCode size={14} color="var(--accent-purple)" />
              <span>Generated JUnit Test Class</span>
            </div>
            
            <textarea
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                resize: 'none',
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '12px',
                background: '#060910',
                color: '#e2e8f0',
                outline: 'none',
                lineHeight: '1.6'
              }}
              placeholder="Test code will appear here..."
              disabled={saving}
            />
          </div>
        </div>
      )}

      {saveStatus === 'error' && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'start',
          gap: '10px'
        }}>
          <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span style={{ color: '#fca5a5', fontSize: '13px' }}>{errorMsg}</span>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `}</style>

    </div>
  );
}

export default TestEditor;
