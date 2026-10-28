import React from 'react';
import { AlertTriangle, Play, Sparkles, HelpCircle, FileText, CheckCircle, Activity, Award } from 'lucide-react';

function OverviewTab({ projectId, files = [], runs = [], onRefresh }) {
  React.useEffect(() => {
    if (onRefresh) onRefresh();
  }, [projectId]);

  // Aggregate real stats from runs
  const completedRuns = runs.filter(r => r.status === 'COMPLETED');
  const failedRuns = runs.filter(r => r.status === 'FAILED' || r.status === 'TIMEOUT');
  
  const totalRunsCount = runs.length;
  let passedTests = 0;
  let failedTests = 0;
  
  runs.forEach(r => {
    let tRun = r.testsRun || 0;
    let fails = (r.failures || 0) + (r.errors || 0);
    if ((r.status === 'FAILED' || r.status === 'TIMEOUT') && tRun === 0 && fails === 0) {
      tRun = 1;
      fails = 1;
    }
    const passed = Math.max(0, tRun - fails);
    passedTests += passed;
    failedTests += fails;
  });

  const totalTests = passedTests + failedTests;
  const hasTelemetry = totalRunsCount > 0;

  // Donut SVG configuration
  const passedPercent = totalTests > 0 ? (passedTests / totalTests) : 0;
  const circumference = 2 * Math.PI * 45; // ~282.74
  const strokeDashoffset = circumference - (passedPercent * circumference);

  // File metrics from actual project files
  const fileCount = files.length;
  const genTestsCount = files.filter(f => f.hasGeneratedTests).length;
  const draftCount = Math.max(0, fileCount - genTestsCount);
  const flakyCount = runs.filter(r => r.status === 'TIMEOUT').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }} className="fade-in">
      
      {/* Top Section: Donut chart and Failed executions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        
        {/* Remote Test Runs Donut Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-card)' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>
              REMOTE TEST RUNS ({totalTests.toLocaleString()} TOTAL TESTS)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '20px', flex: 1 }}>
            {/* SVG Donut Chart */}
            <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="130" height="130" viewBox="0 0 100 100">
                {/* Neutral Track */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="transparent" 
                  stroke={totalTests > 0 ? 'var(--accent-pink)' : 'var(--border-light)'} 
                  strokeWidth="10" 
                />
                {/* Passed Track */}
                {totalTests > 0 && (
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="transparent" 
                    stroke="var(--accent-cyan)" 
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 50 50)"
                    strokeLinecap="round"
                  />
                )}
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', display: 'block' }}>
                  {totalTests > 0 ? `${Math.round(passedPercent * 100)}%` : '0'}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700 }}>
                  {totalTests > 0 ? 'PASS RATE' : 'RUNS'}
                </span>
              </div>
            </div>

            {/* Numeric Indicators */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ borderLeft: '4px solid var(--accent-cyan)', paddingLeft: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>{passedTests.toLocaleString()}</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>PASSED</span>
              </div>
              <div style={{ borderLeft: '4px solid var(--accent-pink)', paddingLeft: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>{failedTests.toLocaleString()}</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>FAILED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Remote Failed Executions Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-card)' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>
              REMOTE FAILED EXECUTIONS ({failedRuns.length} TOTAL)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', minHeight: '120px' }}>
            {failedRuns.length > 0 ? (
              failedRuns.slice(0, 3).map((run) => (
                <div key={run.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-pink)' }} />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Run #{run.id ? run.id.substring(0, 6) : 'N/A'}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {run.executionTimeMs ? `${(run.executionTimeMs / 1000).toFixed(2)}s` : 'Failed'}
                  </span>
                  <span style={{ marginLeft: '12px', fontSize: '12px', fontWeight: 600 }}>
                    {run.testsRun ? `${(run.testsRun - run.failures - run.errors)}/${run.testsRun}` : '0 tests'}
                  </span>
                  <span style={{ marginLeft: '12px', padding: '2px 6px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-pink)', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>F</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', border: '1px dashed var(--border-light)', borderRadius: '8px' }}>
                <CheckCircle size={24} color="#0d9488" style={{ margin: '0 auto 8px', opacity: 0.8 }} />
                <span>No failed executions recorded. All test suites passed or awaiting first execution.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Middle Section: Tests Overview Grid & Duplication Level */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px'
      }}>
        
        {/* Tests Overview metrics row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            TESTS OVERVIEW ({fileCount} JAVA SOURCE FILES)
          </span>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '12px'
          }}>
            
            {/* Metric Active (Source Files) */}
            <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-card)' }}>
              <div style={{ background: 'rgba(13, 148, 136, 0.08)', border: '1px solid rgba(13, 148, 136, 0.2)', padding: '6px', borderRadius: '8px' }}>
                <CheckCircle size={16} color="#0d9488" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>ACTIVE</span>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{fileCount}</h4>
              </div>
            </div>

            {/* Metric Quarantine (Failed Suites) */}
            <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-card)' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px', borderRadius: '8px' }}>
                <AlertTriangle size={16} color="#ef4444" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>QUARANTINE</span>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{failedRuns.length}</h4>
              </div>
            </div>

            {/* Metric Evaluating (Generated Tests) */}
            <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-card)' }}>
              <div style={{ background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.2)', padding: '6px', borderRadius: '8px' }}>
                <Sparkles size={16} color="#f97316" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>AI TESTED</span>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{genTestsCount}</h4>
              </div>
            </div>

            {/* Metric Draft (Awaiting AI Tests) */}
            <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-card)' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '6px', borderRadius: '8px' }}>
                <FileText size={16} color="#3b82f6" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>PENDING</span>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{draftCount}</h4>
              </div>
            </div>

            {/* Metric Flaky (Timeouts) */}
            <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-card)' }}>
              <div style={{ background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.2)', padding: '6px', borderRadius: '8px' }}>
                <HelpCircle size={16} color="#eab308" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>FLAKY</span>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{flakyCount}</h4>
              </div>
            </div>

          </div>
        </div>

        {/* Duplication Level Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            DUPLICATION LEVEL
          </span>

          <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, background: 'var(--bg-card)' }}>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>
              {hasTelemetry ? `${Math.min(100, Math.round((failedTests / (totalTests || 1)) * 100))}%` : '0%'}
            </h2>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-cyan)', boxShadow: '0 0 8px var(--accent-cyan)' }} />
          </div>
        </div>

      </div>

      {/* Bottom Section: Recent Activity & Executions Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        
        {/* Recent Activity card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-card)' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>
              RECENT ACTIVITY ({totalRunsCount} RUNS)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '120px' }}>
            {runs.length > 0 ? (
              runs.slice(0, 4).map((run, idx) => (
                <div key={run.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: idx < 3 ? '1px solid var(--border-light)' : 'none', paddingBottom: idx < 3 ? '12px' : 0 }}>
                  <Play size={14} color="var(--accent-purple)" />
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Suite Execution Run #{run.id ? run.id.substring(0, 6) : 'Run'}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      Status: <strong style={{ color: run.status === 'COMPLETED' ? '#0d9488' : '#ef4444' }}>{run.status}</strong> &bull; Tests: {run.testsRun || 0}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {run.executionTimeMs ? `${(run.executionTimeMs / 1000).toFixed(2)}s` : 'Active'}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', border: '1px dashed var(--border-light)', borderRadius: '8px' }}>
                <Activity size={24} color="var(--accent-purple)" style={{ margin: '0 auto 8px', opacity: 0.8 }} />
                <span>Project uploaded and ready. Switch to the Workspace tab and click "Run Suite" to trigger test runs.</span>
              </div>
            )}
          </div>
        </div>

        {/* Test executions telemetry breakdown card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-card)' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>
              TEST RUNS TELEMETRY ({totalRunsCount} EXECUTIONS)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', flex: 1 }}>
            {/* SVG Bar Chart with Real Values */}
            <div style={{ height: '100px', width: '100%', display: 'flex', alignItems: 'end', justifyContent: 'space-around', paddingBottom: '8px', borderBottom: '1px dashed var(--border-light)' }}>
              {/* Bar 1 - Completed */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '32px',
                  height: `${Math.max(8, totalRunsCount > 0 ? (completedRuns.length / totalRunsCount) * 80 : 8)}px`,
                  background: 'linear-gradient(to top, rgba(13, 148, 136, 0.2) 0%, rgba(13, 148, 136, 0.8) 100%)',
                  borderRadius: '4px'
                }} />
              </div>
              {/* Bar 2 - Failed */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '32px',
                  height: `${Math.max(8, totalRunsCount > 0 ? (failedRuns.length / totalRunsCount) * 80 : 8)}px`,
                  background: 'linear-gradient(to top, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.8) 100%)',
                  borderRadius: '4px'
                }} />
              </div>
              {/* Bar 3 - Total */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '32px',
                  height: `${Math.max(8, totalRunsCount > 0 ? 80 : 8)}px`,
                  background: 'linear-gradient(to top, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.8) 100%)',
                  borderRadius: '4px'
                }} />
              </div>
            </div>

            {/* Labels Row */}
            <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '12px', fontWeight: 700 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', color: '#0d9488' }}>{completedRuns.length}</span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>PASSED</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', color: '#ef4444' }}>{failedRuns.length}</span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>FAILED</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', color: 'var(--accent-purple)' }}>{totalRunsCount}</span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>TOTAL</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default OverviewTab;
