import React, { useState, useEffect, useRef } from 'react';
import FileExplorer from './FileExplorer';
import CodeViewer from './CodeViewer';
import TestEditor from './TestEditor';
import ExecutionDashboard from './ExecutionDashboard';
import OverviewTab from './OverviewTab';
import { 
  BarChart3, 
  Code2, 
  Settings as SettingsIcon, 
  LogOut, 
  FolderOpen, 
  Files, 
  Cpu, 
  Play, 
  Sparkles, 
  Sun, 
  Moon, 
  Layers,
  Database
} from 'lucide-react';

function Dashboard({ projectId, projectName, detectedFilesCount, onReset, isDark, setIsDark }) {
  const [files, setFiles] = useState([]);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [codeContent, setCodeContent] = useState('');
  const [loadingCode, setLoadingCode] = useState(false);
  const [mode, setMode] = useState('view'); // 'view', 'edit-test', 'run-tests'
  const [activeRun, setActiveRun] = useState(null);
  
  // Navigation State: 'workspace' (first after upload), 'overview' (second), 'settings'
  const [activeTab, setActiveTab] = useState('workspace');
  
  const pollingRef = useRef(null);

  useEffect(() => {
    fetchProjectFiles();
    fetchRuns();
    return () => stopPolling();
  }, [projectId]);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const fetchProjectFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/files`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
        if (data.length > 0) {
          handleFileSelect(data[0].id, data[0].filePath);
        }
      }
    } catch (err) {
      console.error("Failed to load project files", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRuns = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/runs`);
      if (res.ok) {
        const data = await res.json();
        setRuns(data);
      }
    } catch (err) {
      console.error("Failed to load runs", err);
    }
  };

  const handleFileSelect = async (fileId, filePath) => {
    setSelectedFileId(fileId);
    setSelectedFileName(filePath);
    setLoadingCode(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/files/${fileId}`);
      if (res.ok) {
        const data = await res.json();
        setCodeContent(data.content);
      }
    } catch (err) {
      console.error("Failed to load source code", err);
      setCodeContent("// Error: Failed to retrieve source code.");
    } finally {
      setLoadingCode(false);
    }
  };

  const startTestExecution = async () => {
    setMode('run-tests');
    setActiveRun({ 
      status: 'PENDING', 
      logs: '[SYSTEM INFO] Triggering maven tests run...\n', 
      testsRun: 0, 
      failures: 0, 
      errors: 0, 
      skipped: 0, 
      executionTimeMs: 0 
    });
    
    try {
      const res = await fetch(`/api/projects/${projectId}/run-tests`, {
        method: 'POST'
      });
      if (res.ok) {
        const initialRun = await res.json();
        setActiveRun(initialRun);
        
        // Start polling
        stopPolling();
        pollingRef.current = setInterval(() => pollRunStatus(initialRun.id), 1200);
      } else {
        throw new Error("Failed to start test execution.");
      }
    } catch (err) {
      console.error(err);
      setActiveRun({
        status: 'FAILED',
        logs: `[SYSTEM ERROR] Failed to trigger build: ${err.message}\n`,
        testsRun: 0,
        failures: 0,
        errors: 0,
        skipped: 0,
        executionTimeMs: 0
      });
    }
  };

  const pollRunStatus = async (runId) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/runs/${runId}`);
      if (res.ok) {
        const runData = await res.json();
        setActiveRun(runData);
        
        if (runData.status !== 'RUNNING' && runData.status !== 'PENDING') {
          stopPolling();
          fetchRuns(); // Refresh runs list for analytics Tab
        }
      }
    } catch (err) {
      console.error("Error polling test status", err);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', margin: 0, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      
      {/* 1. LEFT NAVIGATION SIDEBAR (Dark navy background matching screenshot) */}
      <aside style={{
        width: '76px',
        backgroundColor: 'var(--bg-sidebar)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 0',
        flexShrink: 0,
        gap: '32px',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        zIndex: 50
      }}>
        {/* App Logo */}
        <div style={{
          background: 'linear-gradient(135deg, var(--accent-purple) 0%, #3b82f6 100%)',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(139,92,246,0.3)'
        }}>
          <Layers size={18} color="#fff" />
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, width: '100%', alignItems: 'center' }}>
          
          {/* 1. Workspace Tab Button (Primary after upload) */}
          <button 
            onClick={() => setActiveTab('workspace')}
            style={{
              background: activeTab === 'workspace' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              border: 'none',
              padding: '12px',
              borderRadius: '12px',
              cursor: 'pointer',
              color: activeTab === 'workspace' ? '#fff' : '#64748b',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Java Files Workspace"
          >
            <Code2 size={20} />
          </button>

          {/* 2. Overview / Telemetry Tab Button (Second) */}
          <button 
            onClick={() => {
              fetchRuns();
              setActiveTab('overview');
            }}
            style={{
              background: activeTab === 'overview' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              border: 'none',
              padding: '12px',
              borderRadius: '12px',
              cursor: 'pointer',
              color: activeTab === 'overview' ? '#fff' : '#64748b',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Execution Telemetry & Overview"
          >
            <BarChart3 size={20} />
          </button>

          {/* Settings Tab Button */}
          <button 
            onClick={() => setActiveTab('settings')}
            style={{
              background: activeTab === 'settings' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              border: 'none',
              padding: '12px',
              borderRadius: '12px',
              cursor: 'pointer',
              color: activeTab === 'settings' ? '#fff' : '#64748b',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Cloud Configurations"
          >
            <SettingsIcon size={20} />
          </button>
        </div>

        {/* Reset/LogOut Button */}
        <button 
          onClick={onReset}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '12px',
            borderRadius: '12px',
            cursor: 'pointer',
            color: '#ef4444',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Sign Out / Reset Project"
        >
          <LogOut size={20} />
        </button>
      </aside>

      {/* 2. MAIN CONTENT AREA (Light grey background matching screenshot) */}
      <main style={{
        flex: 1,
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 40px',
        overflowY: 'auto',
        position: 'relative'
      }}>
        
        {/* Header (Greeting & Theme Toggle & Profile Info) */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '16px'
        }}>
          {/* Greeting Title */}
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Good morning,
            </h1>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Let's evaluate your cloud test execution telemetry metrics.
            </span>
          </div>

          {/* Settings / Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Active Project Pill */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: '20px',
              padding: '6px 16px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-secondary)'
            }}>
              Active Workspace: <span style={{ color: 'var(--accent-purple)' }}>{projectName}</span>
            </div>

            {/* Dark Mode Switch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isDark ? <Moon size={15} color="var(--text-secondary)" /> : <Sun size={15} color="var(--text-secondary)" />}
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Dark Mode</span>
              <label className="theme-switch">
                <input 
                  type="checkbox" 
                  checked={isDark} 
                  onChange={(e) => setIsDark(e.target.checked)} 
                />
                <span className="slider-round"></span>
              </label>
            </div>

            {/* Profile Avatar Pill */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #a78bfa 0%, #3b82f6 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px',
              border: '2px solid var(--bg-card)'
            }}>
              U
            </div>
          </div>
        </header>

        {/* Tab Routing Renders */}
        {activeTab === 'overview' && (
          <OverviewTab 
            projectId={projectId} 
            files={files} 
            runs={runs} 
            onRefresh={fetchRuns}
          />
        )}

        {activeTab === 'workspace' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            gap: '24px',
            alignItems: 'stretch',
            flex: 1
          }}>
            {/* Left Column - File Explorer */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', minHeight: '600px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <FolderOpen size={16} color="var(--accent-purple)" />
                Java File Explorer
              </h3>
              
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, color: 'var(--text-muted)' }}>
                  Loading file tree...
                </div>
              ) : (
                <FileExplorer 
                  files={files} 
                  selectedFileId={selectedFileId} 
                  onFileSelect={handleFileSelect} 
                />
              )}
            </div>

            {/* Right Column - Editor & Run dashboards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              {mode === 'edit-test' ? (
                <TestEditor
                  projectId={projectId}
                  fileId={selectedFileId}
                  fileName={selectedFileName}
                  originalContent={codeContent}
                  onBack={() => setMode('view')}
                />
              ) : mode === 'run-tests' ? (
                <ExecutionDashboard
                  projectId={projectId}
                  fileId={selectedFileId}
                  originalCode={codeContent}
                  onCodeFixApplied={(newCode) => setCodeContent(newCode)}
                  runData={activeRun}
                  onBack={() => {
                    stopPolling();
                    fetchRuns();
                    setMode('view');
                  }}
                />
              ) : (
                <>
                  {/* Action Bar */}
                  <div className="glass-panel" style={{ 
                    padding: '16px 24px', 
                    display: 'flex', 
                    justifyContent: 'between', 
                    alignItems: 'center', 
                    gap: '16px',
                    background: 'var(--bg-card)'
                  }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>PREVIEWING FILE</span>
                      <h4 style={{ margin: 0, fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                        {selectedFileName || 'No file selected'}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                      <button 
                        onClick={() => setMode('edit-test')}
                        className="btn-secondary"
                        style={{ color: 'var(--accent-purple)', borderColor: 'rgba(139,92,246,0.2)' }}
                        disabled={!selectedFileId}
                      >
                        <Sparkles size={14} /> Generate AI Tests
                      </button>
                      
                      <button 
                        onClick={startTestExecution}
                        className="btn-primary"
                        disabled={!selectedFileId}
                      >
                        <Play size={14} /> Run Suite
                      </button>
                    </div>
                  </div>

                  {/* Code Panel */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <CodeViewer 
                      fileName={selectedFileName} 
                      content={codeContent} 
                      loading={loadingCode} 
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="glass-panel fade-in" style={{ padding: '32px', textAlign: 'left', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }} className="text-gradient">Platform configuration Settings</h3>
            
            <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '20px' }}>
              <h5 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 600 }}>AI Core Settings</h5>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Configure global provider integrations. Toggle between Mock synthesize rules and AWS Bedrock services.</span>
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Provider: </span>
                <span style={{ padding: '4px 10px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>MOCK PROVIDER</span>
              </div>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '20px' }}>
              <h5 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 600 }}>Database Infrastructure</h5>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>H2 Database Console is active for evaluation purposes.</span>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', fontSize: '12px' }}>
                <span style={{ fontWeight: 700 }}>JDBC URL:</span>
                <code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>jdbc:h2:mem:cloud_ai_testing</code>
              </div>
            </div>

            <div>
              <h5 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 600 }}>Workspace Sandbox Info</h5>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Isolated maven execution sandbox is managed under host systems.</span>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', fontSize: '12px' }}>
                <span style={{ fontWeight: 700 }}>Execution Path:</span>
                <code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>C:\Users\ravindra_007\.m2\portable-maven\apache-maven-3.9.6\bin\mvn.cmd</code>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}

export default Dashboard;
