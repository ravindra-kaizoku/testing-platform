import React, { useState, useEffect } from 'react';
import UploadZone from './components/UploadZone';
import Dashboard from './components/Dashboard';
import { Terminal, Sun, Moon } from 'lucide-react';

function App() {
  const [projectId, setProjectId] = useState(null);
  const [projectName, setProjectName] = useState(null);
  const [detectedFilesCount, setDetectedFilesCount] = useState(0);
  
  // Theme state persisted to local storage
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleUploadSuccess = (data) => {
    setProjectId(data.projectId);
    setProjectName(data.projectName);
    setDetectedFilesCount(data.detectedFilesCount);
  };

  const handleReset = () => {
    setProjectId(null);
    setProjectName(null);
    setDetectedFilesCount(0);
  };

  // If project is loaded, render the full-screen immersive dashboard layout
  if (projectId) {
    return (
      <Dashboard 
        projectId={projectId} 
        projectName={projectName} 
        detectedFilesCount={detectedFilesCount} 
        onReset={handleReset}
        isDark={isDark}
        setIsDark={setIsDark}
      />
    );
  }

  // Otherwise, render landing upload portal page
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Top Header with Theme Switch */}
      <header style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-light)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-purple) 0%, #3b82f6 100%)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(139, 92, 246, 0.2)'
          }}>
            <Terminal size={22} color="#fff" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)'
            }} className="text-gradient">
              Cloud AI Testing Platform
            </h1>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
              Academic Prototype &bull; AWS Architecture
            </span>
          </div>
        </div>

        {/* Theme Switcher on upload screen */}
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
      </header>

      {/* Main Upload Portal Area */}
      <main style={{ flex: 1, padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <UploadZone onUploadSuccess={handleUploadSuccess} />
      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px',
        textAlign: 'center',
        borderTop: '1px solid var(--border-light)',
        fontSize: '12px',
        color: 'var(--text-muted)',
        background: 'var(--bg-card)'
      }}>
        Cloud-Based AI Software Testing Platform &bull; Built with Spring Boot, React, AWS Bedrock and Docker.
      </footer>
    </div>
  );
}

export default App;
