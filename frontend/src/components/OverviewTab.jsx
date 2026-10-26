import React from 'react';
import { Shield, AlertTriangle, Play, Sparkles, HelpCircle, FileText, CheckCircle } from 'lucide-react';

function OverviewTab({ projectId, files, runs }) {
  // Aggregate stats from runs
  const completedRuns = runs.filter(r => r.status === 'COMPLETED');
  const failedRuns = runs.filter(r => r.status === 'FAILED' || r.status === 'TIMEOUT');
  
  // Real stats calculation
  const totalRunsCount = runs.length;
  let passedTests = 0;
  let failedTests = 0;
  
  runs.forEach(r => {
    passedTests += (r.testsRun - r.failures - r.errors);
    failedTests += (r.failures + r.errors);
  });

  // Default values matching user image if no telemetry exists yet
  const displayTotalRuns = totalRunsCount > 0 ? totalRunsCount : 20000;
  const displayPassed = totalRunsCount > 0 ? passedTests : 17200;
  const displayFailed = totalRunsCount > 0 ? failedTests : 2800;

  // Donut SVG configuration
  const totalTests = displayPassed + displayFailed;
  const passedPercent = totalTests > 0 ? (displayPassed / totalTests) : 0.86;
  const circumference = 2 * Math.PI * 45; // ~282.74
  const strokeDashoffset = circumference - (passedPercent * circumference);

  // Duplication & Flaky Mock metrics
  const fileCount = files.length > 0 ? files.length : 15;
  const genTestsCount = files.filter(f => f.hasGeneratedTests).length;
  const draftCount = files.filter(f => !f.hasGeneratedTests).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }} className="fade-in">
      
      {/* Top Section: Donut chart and Failed executions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        
        {/* Remote Test Runs Donut Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>
              REMOTE TEST RUNS ({displayTotalRuns.toLocaleString()} TOTAL)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '20px', flex: 1 }}>
            {/* SVG Donut Chart */}
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <svg width="130" height="130" viewBox="0 0 100 100">
                {/* Red Track (Failures base) */}
                <circle cx="50" cy="50" r="45" fill="transparent" stroke="var(--accent-pink)" strokeWidth="10" />
                {/* Teal Track (Passed overlays) */}
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
              </svg>
            </div>

            {/* Numeric Indicators */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ borderLeft: '4px solid var(--accent-cyan)', paddingLeft: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>{displayPassed.toLocaleString()}</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>PASSED</span>
              </div>
              <div style={{ borderLeft: '4px solid var(--accent-pink)', paddingLeft: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>{displayFailed.toLocaleString()}</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>FAILED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Remote Failed Executions Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>
              REMOTE FAILED EXECUTIONS ({failedRuns.length > 0 ? failedRuns.length : 10000} TOTAL)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
            {/* If there are real runs, display them. Otherwise show screenshot mocks */}
            {failedRuns.length > 0 ? (
              failedRuns.slice(0, 3).map((run, idx) => (
                <div key={run.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-pink)' }} />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Run #{run.id.substring(0, 5)}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Just now</span>
                  <span style={{ marginLeft: '12px', fontSize: '12px', fontWeight: 600 }}>{run.testsRun - run.failures - run.errors}/{run.testsRun}</span>
                  <span style={{ marginLeft: '12px', padding: '2px 6px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-pink)', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>F</span>
                </div>
              ))
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{ width: '70px', height: '8px', background: 'var(--text-muted)', opacity: 0.15, borderRadius: '4px' }} />
                    <div style={{ width: '40px', height: '6px', background: 'var(--text-muted)', opacity: 0.1, borderRadius: '3px' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>2 min ago</span>
                  <span style={{ marginLeft: '24px', fontSize: '12px', fontWeight: 600 }}>10/20</span>
                  <span style={{ marginLeft: '12px', width: '16px', height: '16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-pink)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800 }}>F</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{ width: '80px', height: '8px', background: 'var(--text-muted)', opacity: 0.15, borderRadius: '4px' }} />
                    <div style={{ width: '50px', height: '6px', background: 'var(--text-muted)', opacity: 0.1, borderRadius: '3px' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>5 min ago</span>
                  <span style={{ marginLeft: '24px', fontSize: '12px', fontWeight: 600 }}>12/20</span>
                  <span style={{ marginLeft: '12px', width: '16px', height: '16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-pink)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800 }}>F</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{ width: '60px', height: '8px', background: 'var(--text-muted)', opacity: 0.15, borderRadius: '4px' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>10 min ago</span>
                  <span style={{ marginLeft: '24px', fontSize: '12px', fontWeight: 600 }}>3/20</span>
                  <span style={{ marginLeft: '12px', width: '16px', height: '16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-pink)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800 }}>F</span>
                </div>
              </>
            )}
            <span style={{ alignSelf: 'start', fontSize: '11px', color: 'var(--accent-purple)', cursor: 'pointer', fontWeight: 600, marginTop: '4px' }}>See all</span>
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
            TESTS OVERVIEW ({fileCount + 100} TOTAL)
          </span>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '12px'
          }}>
            
            {/* Metric Active */}
            <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'rgba(13, 148, 136, 0.08)', border: '1px solid rgba(13, 148, 136, 0.2)', padding: '6px', borderRadius: '8px' }}>
                <CheckCircle size={16} color="#0d9488" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>ACTIVE</span>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{fileCount}</h4>
              </div>
            </div>

            {/* Metric Quarantine */}
            <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px', borderRadius: '8px' }}>
                <AlertTriangle size={16} color="#ef4444" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>QUARANTINE</span>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{failedRuns.length > 0 ? failedRuns.length : 15}</h4>
              </div>
            </div>

            {/* Metric Evaluating */}
            <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.2)', padding: '6px', borderRadius: '8px' }}>
                <Sparkles size={16} color="#f97316" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>EVALUATING</span>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{genTestsCount > 0 ? genTestsCount : 5}</h4>
              </div>
            </div>

            {/* Metric Draft */}
            <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '6px', borderRadius: '8px' }}>
                <FileText size={16} color="#3b82f6" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>DRAFT</span>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{draftCount > 0 ? draftCount : 8}</h4>
              </div>
            </div>

            {/* Metric Flaky */}
            <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.2)', padding: '6px', borderRadius: '8px' }}>
                <HelpCircle size={16} color="#eab308" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>FLAKY</span>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{runs.filter(r => r.status === 'TIMEOUT').length > 0 ? runs.filter(r => r.status === 'TIMEOUT').length : 5}</h4>
              </div>
            </div>

          </div>
        </div>

        {/* Duplication Level Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            DUPLICATION LEVEL
          </span>

          <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>28%</h2>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-cyan)', boxShadow: '0 0 8px var(--accent-cyan)' }} />
          </div>
        </div>

      </div>

      {/* Bottom Section: Recent Activity & Executions Bar Chart */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        
        {/* Recent Activity card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>
              RECENT ACTIVITY
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {runs.length > 0 ? (
              runs.slice(0, 3).map((run, idx) => (
                <div key={run.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: idx < 2 ? '1px solid var(--border-light)' : 'none', paddingBottom: idx < 2 ? '12px' : 0 }}>
                  <Play size={14} color="var(--accent-purple)" />
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Triggered Suite Execution Run</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Status: {run.status}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Just now</span>
                </div>
              ))
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <div style={{ width: '140px', height: '8px', background: 'var(--text-muted)', opacity: 0.15, borderRadius: '4px' }} />
                    <div style={{ width: '80px', height: '6px', background: 'var(--text-muted)', opacity: 0.1, borderRadius: '3px' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>2 min ago</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <div style={{ width: '120px', height: '8px', background: 'var(--text-muted)', opacity: 0.15, borderRadius: '4px' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>5 min ago</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <div style={{ width: '160px', height: '8px', background: 'var(--text-muted)', opacity: 0.15, borderRadius: '4px' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>12 min ago</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Test executions bar chart card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>
              PULL REQUESTS (18 TOTAL)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', flex: 1 }}>
            {/* SVG Bar Chart with Gradients */}
            <div style={{ height: '100px', width: '100%', display: 'flex', alignItems: 'end', justifyContent: 'space-around', paddingBottom: '8px', borderBottom: '1px dashed var(--border-light)' }}>
              {/* Bar 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '32px', height: '70px', background: 'linear-gradient(to top, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.4) 100%)', borderRadius: '4px' }} />
              </div>
              {/* Bar 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '32px', height: '30px', background: 'linear-gradient(to top, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.5) 100%)', borderRadius: '4px' }} />
              </div>
              {/* Bar 3 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '32px', height: '85px', background: 'linear-gradient(to top, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.8) 100%)', borderRadius: '4px' }} />
              </div>
            </div>

            {/* Labels Row */}
            <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '12px', fontWeight: 700 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '15px' }}>10</span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>MERGED</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', color: '#f97316' }}>3</span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>OPEN</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', color: '#3b82f6' }}>5</span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>REVIEW</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default OverviewTab;
