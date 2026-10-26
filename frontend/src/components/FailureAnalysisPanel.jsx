import React, { useState } from 'react';
import { Sparkles, Check, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

function FailureAnalysisPanel({ analysisData, originalCode, onApplyFix }) {
  const [applying, setApplying] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!analysisData) return null;

  const hasFix = analysisData.suggestedCode && analysisData.suggestedCode.trim() !== originalCode.trim();

  // Simple formatter to parse basic markdown titles (e.g. ### Root Cause)
  const formatAnalysisText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h5 key={idx} style={{ marginTop: '16px', marginBottom: '8px', fontSize: '13px', color: '#c084fc', textTransform: 'uppercase', fontWeight: 600 }}>{line.substring(4)}</h5>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={idx} style={{ margin: '6px 0', fontWeight: 600 }}>{line.replace(/\*\*/g, '')}</p>;
      }
      return <p key={idx} style={{ margin: '6px 0', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>{line}</p>;
    });
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await onApplyFix(analysisData.suggestedCode);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Failed to apply code fix.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="glass-panel fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(15, 23, 42, 0.45)', border: '1px solid rgba(192, 132, 252, 0.15)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
        <Sparkles size={18} color="#c084fc" className="pulse-animation" />
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }} className="text-gradient">AI Diagnosis & Code Fix</h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Left Side: Explanations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            {formatAnalysisText(analysisData.analysisText)}
          </div>

          {!hasFix && (
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.15)', borderRadius: '8px', padding: '12px', color: '#38bdf8', fontSize: '12px', alignItems: 'start' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>No direct changes suggested for the source class. The issue lies within the test assertions or compiler settings. Adjust test constraints in the Test Editor.</span>
            </div>
          )}
        </div>

        {/* Right Side: Code Diffs */}
        {hasFix && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, alignSelf: 'start' }}>SUGGESTED REFACTORING DIFF</span>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1, minHeight: '260px' }}>
              
              {/* Original Code */}
              <div style={{ display: 'flex', flexDirection: 'column', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '6px 12px', fontSize: '11px', color: '#f87171', borderBottom: '1px solid rgba(239, 68, 68, 0.15)', fontWeight: 600, textAlign: 'left' }}>
                  ORIGINAL SOURCE CODE
                </div>
                <pre style={{ margin: 0, padding: '12px', background: '#05070f', color: '#fca5a5', flex: 1, overflow: 'auto', fontSize: '11px', fontFamily: 'monospace', lineHeight: '1.6', textAlign: 'left' }}>
                  {originalCode}
                </pre>
              </div>

              {/* Corrected Code */}
              <div style={{ display: 'flex', flexDirection: 'column', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                <div style={{ background: 'rgba(34, 197, 94, 0.08)', padding: '6px 12px', fontSize: '11px', color: '#4ade80', borderBottom: '1px solid rgba(34, 197, 94, 0.15)', fontWeight: 600, textAlign: 'left' }}>
                  SUGGESTED AI CORRECTION
                </div>
                <pre style={{ margin: 0, padding: '12px', background: '#05070f', color: '#86efac', flex: 1, overflow: 'auto', fontSize: '11px', fontFamily: 'monospace', lineHeight: '1.6', textAlign: 'left' }}>
                  {analysisData.suggestedCode}
                </pre>
              </div>

            </div>

            {/* Action Row */}
            <div style={{ display: 'flex', justifyContent: 'end', marginTop: '4px' }}>
              {success ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80', fontSize: '13px', fontWeight: 600 }}>
                  <Check size={16} /> Code Fix Applied Successfully! Rerun tests to verify.
                </div>
              ) : (
                <button 
                  onClick={handleApply} 
                  className="btn-primary" 
                  style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', borderColor: 'rgba(168, 85, 247, 0.4)', padding: '8px 20px', fontSize: '13px' }}
                  disabled={applying}
                >
                  {applying ? (
                    <>
                      <RefreshCw size={14} className="spin-animation" /> Applying Refactoring...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} /> Apply AI Code Fix
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default FailureAnalysisPanel;
