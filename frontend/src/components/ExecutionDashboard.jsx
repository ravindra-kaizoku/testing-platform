import React, { useState, useEffect } from 'react';
import TerminalLogs from './TerminalLogs';
import FailureAnalysisPanel from './FailureAnalysisPanel';
import { Play, CheckCircle, AlertTriangle, Clock, RefreshCw, ChevronLeft, Sparkles } from 'lucide-react';

function ExecutionDashboard({ projectId, fileId, originalCode, onCodeFixApplied, runData, onBack }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  if (!runData) return null;

  const isRunning = runData.status === 'RUNNING' || runData.status === 'PENDING';
  const hasFailed = runData.status === 'FAILED' || runData.status === 'TIMEOUT';
  const passedCount = runData.testsRun - runData.failures - runData.errors;

  // Fetch analysis if it was already performed previously
  useEffect(() => {
    if (hasFailed) {
      checkExistingAnalysis();
    } else {
      setAnalysisResult(null);
    }
  }, [runData.id, runData.status]);

  const checkExistingAnalysis = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/runs/${runData.id}/analysis`);
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
      } else {
        setAnalysisResult(null);
      }
    } catch (err) {
      console.error("No existing analysis found", err);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/runs/${runData.id}/analyze`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
      } else {
        throw new Error("Failed to generate AI failure analysis.");
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplyFix = async (correctedCode) => {
    const res = await fetch(`/api/projects/${projectId}/files/${fileId}/apply-fix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: correctedCode })
    });
    if (res.ok) {
      if (onCodeFixApplied) {
        onCodeFixApplied(correctedCode);
      }
    } else {
      throw new Error("API failed to apply fix.");
    }
  };

  const getStatusColor = () => {
    if (runData.status === 'COMPLETED') return '#22c55e'; // green
    if (hasFailed) return '#ef4444'; // red
    return '#c084fc'; // purple
  };

  const formatTime = (ms) => {
    if (!ms) return '0.00s';
    return (ms / 1000).toFixed(2) + 's';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, minHeight: 0 }} className="fade-in">
      
      {/* Dashboard Control Header */}
      <div className="glass-panel" style={{
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'between',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SANDBOX SUITE EXECUTION</span>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }} className="text-gradient">
            Run ID: {runData.id ? runData.id.substring(0, 8) : 'Pending...'}
          </h4>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Analyze Failure with AI Button */}
          {hasFailed && !analysisResult && !analyzing && (
            <button 
              onClick={handleAnalyze} 
              className="btn-primary" 
              style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', borderColor: 'rgba(168, 85, 247, 0.4)', padding: '8px 16px', fontSize: '13px' }}
            >
              <Sparkles size={14} /> Analyze Failure
            </button>
          )}

          {/* Status Badge */}
          <div style={{
            background: `rgba(${runData.status === 'COMPLETED' ? '34, 197, 94' : hasFailed ? '239, 68, 68' : '192, 132, 252'}, 0.08)`,
            border: `1px solid rgba(${runData.status === 'COMPLETED' ? '34, 197, 94' : hasFailed ? '239, 68, 68' : '192, 132, 252'}, 0.25)`,
            borderRadius: '20px',
            padding: '4px 14px',
            fontSize: '12px',
            fontWeight: 600,
            color: getStatusColor(),
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }} className={isRunning ? "pulse-animation" : ""}>
            {isRunning && <RefreshCw size={12} className="spin-animation" />}
            {runData.status === 'COMPLETED' && <CheckCircle size={12} />}
            {hasFailed && <AlertTriangle size={12} />}
            <span>{runData.status}</span>
          </div>

          <button onClick={onBack} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            <ChevronLeft size={14} /> Back to Files
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px',
        width: '100%'
      }}>
        {/* Metric Total */}
        <div className="glass-panel" style={{
          padding: '16px 20px',
          borderColor: isRunning ? 'rgba(192, 132, 252, 0.15)' : 'rgba(255,255,255,0.08)',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>TESTS RUN</span>
          <h2 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>
            {runData.testsRun || 0}
          </h2>
        </div>

        {/* Metric Passed */}
        <div className="glass-panel" style={{
          padding: '16px 20px',
          borderColor: runData.status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255,255,255,0.08)',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>PASSED</span>
          <h2 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 800, color: passedCount > 0 ? '#4ade80' : '#f8fafc' }}>
            {passedCount || 0}
          </h2>
        </div>

        {/* Metric Failed */}
        <div className="glass-panel" style={{
          padding: '16px 20px',
          borderColor: runData.failures > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.08)',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>FAILED</span>
          <h2 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 800, color: runData.failures > 0 ? '#f87171' : '#f8fafc' }}>
            {runData.failures || 0}
          </h2>
        </div>

        {/* Metric Errors */}
        <div className="glass-panel" style={{
          padding: '16px 20px',
          borderColor: runData.errors > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.08)',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ERRORS</span>
          <h2 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 800, color: runData.errors > 0 ? '#f87171' : '#f8fafc' }}>
            {runData.errors || 0}
          </h2>
        </div>

        {/* Metric Time */}
        <div className="glass-panel" style={{
          padding: '16px 20px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>BUILD DURATION</span>
          <h2 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 800, color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Clock size={20} color="var(--text-secondary)" />
            {formatTime(runData.executionTimeMs)}
          </h2>
        </div>
      </div>

      {/* AI Analyzing Loader */}
      {analyzing && (
        <div className="glass-panel fade-in" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', border: '1px solid rgba(192, 132, 252, 0.25)' }}>
          <Sparkles size={32} className="spin-animation" color="#c084fc" />
          <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>AI Sandbox Diagnostic Running...</h5>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Analyzing compiler stack traces and test assertion failures...</span>
        </div>
      )}

      {/* AI Failure Analysis Panel */}
      {analysisResult && !analyzing && (
        <FailureAnalysisPanel 
          analysisData={analysisResult} 
          originalCode={originalCode} 
          onApplyFix={handleApplyFix} 
        />
      )}

      {/* Terminal View Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '350px' }}>
        <TerminalLogs logs={runData.logs} />
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
        .pulse-animation {
          animation: pulse 1.8s ease-in-out infinite;
        }
      `}</style>

    </div>
  );
}

export default ExecutionDashboard;
