import React from 'react';
import DiagramWorkspace from '../components/DiagramWorkspace';

/**
 * SysML v2ダイアグラム編集ページ
 */
const DiagramPage: React.FC = () => {
  return (
    <div className="diagram-page">
      <header className="page-header">
        <h1>SysML v2 ダイアグラムエディタ</h1>
        <div className="header-actions">
          <button className="action-button">
            <span className="icon">💾</span> 保存
          </button>
          <button className="action-button">
            <span className="icon">📁</span> 読み込み
          </button>
          <button className="action-button">
            <span className="icon">🔄</span> リセット
          </button>
        </div>
      </header>
      
      <div className="workspace-container">
        <DiagramWorkspace />
      </div>
      
      <footer className="page-footer">
        <p>SysML v2 OMG仕様準拠 (ptc/2025-02-11)</p>
      </footer>
      
      <style jsx>{`
        .diagram-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          padding: 0;
          margin: 0;
          background-color: #f5f5f5;
        }
        
        .page-header {
          background-color: #2c3e50;
          color: white;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .page-header h1 {
          margin: 0;
          font-size: 1.5rem;
        }
        
        .header-actions {
          display: flex;
          gap: 10px;
        }
        
        .action-button {
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 15px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: background-color 0.2s;
        }
        
        .action-button:hover {
          background-color: #2980b9;
        }
        
        .action-button .icon {
          margin-right: 5px;
        }
        
        .workspace-container {
          flex-grow: 1;
          padding: 20px;
          overflow: hidden;
        }
        
        .page-footer {
          background-color: #2c3e50;
          color: #ecf0f1;
          text-align: center;
          padding: 10px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

export default DiagramPage;