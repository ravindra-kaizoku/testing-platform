import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileCode, Folder, FolderOpen } from 'lucide-react';

// Converts a list of file items with relative paths into a hierarchical tree
function buildTree(files) {
  const root = { name: 'root', isFolder: true, children: {} };

  files.forEach(file => {
    const parts = file.filePath.split('/');
    let current = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      
      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          isFolder: !isLast,
          fullPath: parts.slice(0, index + 1).join('/'),
          id: isLast ? file.id : null,
          children: {}
        };
      }
      current = current.children[part];
    });
  });

  return root;
}

function TreeNode({ node, level, selectedFileId, onFileSelect }) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (node.isFolder) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(node.id, node.fullPath);
    }
  };

  const paddingLeft = `${level * 14 + 10}px`;
  const isSelected = !node.isFolder && selectedFileId === node.id;

  const sortedChildren = Object.values(node.children).sort((a, b) => {
    // Folders first, then alphabetically
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div style={{ userSelect: 'none' }}>
      <div 
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '6px 8px',
          paddingLeft: paddingLeft,
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '13px',
          fontFamily: 'monospace',
          backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
          color: isSelected ? '#a78bfa' : 'var(--text-primary)',
          borderLeft: isSelected ? '2px solid var(--accent-purple)' : '2px solid transparent',
          transition: 'background-color 0.2s',
          marginTop: '2px'
        }}
        onMouseOver={(e) => {
          if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
        }}
        onMouseOut={(e) => {
          if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {node.isFolder ? (
          <>
            <span style={{ display: 'inline-flex', marginRight: '4px' }}>
              {isOpen ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />}
            </span>
            <span style={{ display: 'inline-flex', marginRight: '8px', color: '#fbbf24' }}>
              {isOpen ? <FolderOpen size={15} /> : <Folder size={15} />}
            </span>
          </>
        ) : (
          <span style={{ display: 'inline-flex', marginRight: '8px', marginLeft: '18px', color: 'var(--accent-cyan)' }}>
            <FileCode size={15} />
          </span>
        )}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {node.name}
        </span>
      </div>

      {node.isFolder && isOpen && (
        <div>
          {sortedChildren.map(child => (
            <TreeNode 
              key={child.fullPath} 
              node={child} 
              level={level + 1} 
              selectedFileId={selectedFileId}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FileExplorer({ files, selectedFileId, onFileSelect }) {
  if (files.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
        No Java files detected in this project.
      </div>
    );
  }

  const tree = buildTree(files);
  const topLevelNodes = Object.values(tree.children).sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div style={{ overflowY: 'auto', flex: 1, maxHeight: '500px', paddingRight: '4px' }}>
      {topLevelNodes.map(node => (
        <TreeNode 
          key={node.fullPath} 
          node={node} 
          level={0} 
          selectedFileId={selectedFileId}
          onFileSelect={onFileSelect}
        />
      ))}
    </div>
  );
}

export default FileExplorer;
