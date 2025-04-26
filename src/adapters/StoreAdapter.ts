import { useSysMLStore } from '../store/sysmlStore';
import { useAppStore } from '../../client/src/lib/store';

/**
 * StoreAdapter クラス
 * 既存のアプリケーションストア（client/src/lib/store）と
 * 新しいSysML v2モデルストア（src/store/sysmlStore）の間を
 * ブリッジするためのアダプター
 */
export class StoreAdapter {
  /**
   * AppStoreからSysMLStoreにモデルを変換する
   * @param appStore アプリケーションストア状態
   * @returns SysMLモデル
   */
  static appToSysML(appStore: any): any {
    const { currentDiagram } = appStore;
    
    if (!currentDiagram) {
      throw new Error('現在のダイアグラムがありません');
    }
    
    // 新しいSysMLモデルを作成
    const sysmlStore = useSysMLStore.getState();
    const model = sysmlStore.createModel(currentDiagram.name || 'Converted Model');
    
    // ダイアグラムを作成
    const diagramId = sysmlStore.createDiagram(
      currentDiagram.name || 'Main Diagram',
      currentDiagram.type || 'block'
    );
    
    // 要素を追加
    if (currentDiagram.elements) {
      for (const element of currentDiagram.elements) {
        const { id, name, type, position, size, stereotype } = element;
        
        // 要素をブロックとして追加（既存のIDは保持）
        sysmlStore.addBlock(
          name,
          position?.x || 0,
          position?.y || 0,
          stereotype || 'block'
        );
      }
    }
    
    // リレーションシップを追加
    if (currentDiagram.relationships) {
      for (const relationship of currentDiagram.relationships) {
        const { id, name, type, sourceId, targetId, vertices } = relationship;
        
        // リレーションシップを追加
        const relationshipId = sysmlStore.addConnection(
          sourceId,
          targetId,
          name || 'connection',
          type || 'association'
        );
        
        // 頂点情報があれば更新
        if (vertices && vertices.length > 0) {
          sysmlStore.updateRelationship(relationshipId, { vertices });
        }
      }
    }
    
    return model;
  }
  
  /**
   * SysMLStoreからAppStoreにモデルを変換する
   * @param sysmlStore SysMLストア状態
   * @returns AppStoreダイアグラム
   */
  static sysMLToApp(sysmlStore: any): any {
    const { currentModel, currentDiagramId } = sysmlStore;
    
    if (!currentModel || !currentDiagramId) {
      throw new Error('現在のモデルまたはダイアグラムがありません');
    }
    
    // 現在のダイアグラムを取得
    const currentDiagram = currentModel.diagrams.find((d: any) => d.id === currentDiagramId);
    if (!currentDiagram) {
      throw new Error('現在のダイアグラムが見つかりません');
    }
    
    // ダイアグラムデータを直接AppStore形式で返す
    return currentDiagram;
  }
  
  /**
   * AppStoreの要素更新をSysMLStoreに反映する
   * @param elementId 要素ID
   * @param updates 更新内容
   */
  static updateElementInBothStores(elementId: string, updates: any): void {
    // AppStoreを更新
    const appStore = useAppStore.getState();
    appStore.updateElement(elementId, updates);
    
    // SysMLStoreを更新
    const sysmlStore = useSysMLStore.getState();
    if (sysmlStore.currentModel) {
      sysmlStore.updateElement(elementId, updates);
    }
  }
  
  /**
   * AppStoreのリレーションシップ更新をSysMLStoreに反映する
   * @param relationshipId リレーションシップID
   * @param updates 更新内容
   */
  static updateRelationshipInBothStores(relationshipId: string, updates: any): void {
    // AppStoreを更新
    const appStore = useAppStore.getState();
    appStore.updateRelationship(relationshipId, updates);
    
    // SysMLStoreを更新
    const sysmlStore = useSysMLStore.getState();
    if (sysmlStore.currentModel) {
      sysmlStore.updateRelationship(relationshipId, updates);
    }
  }
  
  /**
   * AppStore選択をSysMLStoreに同期する
   * @param elementId 要素ID
   * @param elementName 要素名
   */
  static syncElementSelection(elementId: string, elementName: string): void {
    // AppStore選択を更新
    const appStore = useAppStore.getState();
    appStore.setSelectedElement({ id: elementId, name: elementName });
    
    // SysMLStore選択を更新
    const sysmlStore = useSysMLStore.getState();
    sysmlStore.selectElement(elementId, elementName);
  }
  
  /**
   * AppStoreのリレーションシップ選択をSysMLStoreに同期する
   * @param relationshipId リレーションシップID
   */
  static syncRelationshipSelection(relationshipId: string): void {
    // AppStore選択を更新
    const appStore = useAppStore.getState();
    const currentDiagram = appStore.currentDiagram;
    
    if (currentDiagram) {
      const relationship = currentDiagram.relationships.find(r => r.id === relationshipId);
      if (relationship) {
        appStore.setSelectedRelationship(relationship);
      }
    }
    
    // SysMLStore選択を更新
    const sysmlStore = useSysMLStore.getState();
    sysmlStore.selectRelationship(relationshipId);
  }
  
  /**
   * 選択クリアを両方のストアに適用
   */
  static clearSelectionInBothStores(): void {
    // AppStore選択をクリア
    const appStore = useAppStore.getState();
    appStore.setSelectedElement(null);
    appStore.setSelectedRelationship(null);
    
    // SysMLStore選択をクリア
    const sysmlStore = useSysMLStore.getState();
    sysmlStore.clearSelection();
  }
}

/**
 * SysMLとAppStoreの連携ユーティリティ
 */
export const StoreSync = {
  /**
   * ストア同期の初期化
   * AppStore状態変更をリッスンしてSysMLストアにも反映する
   */
  init() {
    // AppStore側のサブスクリプションを設定
    return useAppStore.subscribe(
      // 状態に変化があるたびに呼び出される
      (state) => {
        // 現在のSysMLストア状態を取得
        const sysmlState = useSysMLStore.getState();
        
        // 選択状態の同期
        if (state.selectedElement) {
          sysmlState.selectElement(
            state.selectedElement.id,
            state.selectedElement.name
          );
        } else if (state.selectedRelationship) {
          sysmlState.selectRelationship(
            state.selectedRelationship.id
          );
        } else if (!state.selectedElement && !state.selectedRelationship) {
          // 両方nullならクリア
          sysmlState.clearSelection();
        }
      }
    );
  },
  
  /**
   * モデルを双方のストアに適用
   * @param modelData モデルデータ
   */
  applyModelToBothStores(modelData: any) {
    // AppStoreに適用
    const appStore = useAppStore.getState();
    
    // ダイアグラム情報を抽出
    const diagramData = modelData.diagrams && modelData.diagrams.length > 0
      ? modelData.diagrams[0]
      : { name: modelData.name, elements: [], relationships: [] };
    
    appStore.setCurrentDiagram(diagramData);
    
    // SysMLStoreにモデルをロード
    const sysmlStore = useSysMLStore.getState();
    sysmlStore.loadModel(modelData);
  }
};