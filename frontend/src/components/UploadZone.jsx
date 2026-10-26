import React, { useState, useRef } from 'react';
import { Upload, FileArchive, AlertCircle, CheckCircle2 } from 'lucide-react';

function UploadZone({ onUploadSuccess }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile.name.endsWith('.zip')) {
      setStatus('error');
      setErrorMsg('Invalid file format. Please upload a ZIP archive containing your Maven Java project.');
      setFile(null);
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setStatus('error');
      setErrorMsg('File exceeds the 50MB size limit. Please upload a smaller project ZIP.');
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setStatus('idle');
    setErrorMsg('');
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const uploadFile = async () => {
    if (!file) return;
    setStatus('uploading');
    setProgress(20);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress growth
      const timer = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 300);

      const response = await fetch('/api/projects/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(timer);

      if (response.ok) {
        const data = await response.json();
        setProgress(100);
        setStatus('success');
        setTimeout(() => {
          onUploadSuccess(data);
        }, 800);
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Server returned an error.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Connection to the server failed.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', width: '100%', marginTop: '40px' }} className="fade-in">
      <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
        Start AI-Powered Testing
      </h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>
        Upload your Maven Java project ZIP file. We will extract it safely, map your source code, and prepare JUnit 5 test generations.
      </p>

      <div 
        className="glass-panel" 
        style={{
          padding: '48px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderStyle: isDragActive ? 'dashed' : 'solid',
          borderColor: isDragActive ? 'var(--accent-purple)' : 'var(--border-light)',
          background: isDragActive ? 'rgba(139, 92, 246, 0.05)' : 'var(--bg-card)',
          cursor: 'pointer'
        }}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={status === 'idle' ? onButtonClick : undefined}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          style={{ display: 'none' }} 
          accept=".zip" 
          onChange={handleChange}
          disabled={status === 'uploading'}
        />

        <div style={{
          background: 'rgba(255,255,255,0.03)',
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border-light)',
          marginBottom: '20px'
        }}>
          {file ? (
            <FileArchive size={32} color="var(--accent-cyan)" />
          ) : (
            <Upload size={32} color="var(--text-secondary)" />
          )}
        </div>

        {file ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 600, fontSize: '16px', margin: '0 0 4px 0' }}>{file.name}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 16px 0' }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 600, fontSize: '16px', margin: '0 0 8px 0' }}>
              Drag & Drop your ZIP here
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 16px 0' }}>
              or click to browse local files
            </p>
          </div>
        )}

        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Supported: Maven Java ZIP archives up to 50MB
        </div>
      </div>

      {status === 'error' && (
        <div style={{
          marginTop: '20px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'start',
          gap: '10px'
        }}>
          <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span style={{ color: '#ef4444', fontSize: '13px', fontWeight: 500 }}>{errorMsg}</span>
        </div>
      )}

      {status === 'uploading' && (
        <div style={{ marginTop: '24px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span>Extracting files securely...</span>
            <span>{progress}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '3px', width: '100%', overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(90deg, var(--accent-purple) 0%, var(--accent-cyan) 100%)',
              height: '100%',
              width: `${progress}%`,
              transition: 'width 0.2s ease-out'
            }} />
          </div>
        </div>
      )}

      {status === 'success' && (
        <div style={{
          marginTop: '20px',
          background: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} color="#22c55e" />
          <span style={{ color: '#22c55e', fontSize: '13px', fontWeight: 600 }}>
            Upload parsed! Loading workspace...
          </span>
        </div>
      )}

      {file && status === 'idle' && (
        <button 
          onClick={uploadFile} 
          className="btn-primary" 
          style={{ width: '100%', justifyContent: 'center', marginTop: '24px' }}
        >
          Proceed to Dashboard
        </button>
      )}
    </div>
  );
}

export default UploadZone;
