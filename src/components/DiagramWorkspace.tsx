import React, { useEffect } from 'react';
import DiagramEditor from './DiagramEditor';
import PropertyPanel from './PropertyPanel';
import { useSysMLModelStore } from '../store/sysmlStore';

/**
 * DiagramEditorとPropertyPanelを統合したワークスペース
 */
const DiagramWorkspace: React.FC = () => {
  // Zustandストアを直接使用
  const { 
    selectedElementId,
    initializeSampleModel
  } = useSysMLModelStore();
  
  useEffect(() => {
    // サンプルモデルを初期化（必要に応じてコメントアウト）
    initializeSampleModel();
  }, [initializeSampleModel]);
  
  return (
    <div className="diagram-workspace">
      <div className="diagram-editor-container">
        <DiagramEditor />
      </div>
      <div className="property-panel-container">
        <PropertyPanel selectedElementId={selectedElementId} />
      </div>
      
      <style>
        {`
          .diagram-workspace {
            display: flex;
            height: calc(100vh - 100px);
            min-height: 600px;
            border: 1px solid #ddd;
            background-color: #fff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .diagram-editor-container {
            flex-grow: 1;
            min-width: 0; /* 重要: flexアイテムがはみ出すのを防ぐ */
          }
          
          .property-panel-container {
            width: 300px;
            flex-shrink: 0;
          }
        `}
      </style>
    </div>
  );
};

export default DiagramWorkspace;