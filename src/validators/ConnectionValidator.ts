/**
 * ConnectionValidator
 * SysML v2 接続関係の検証ロジック
 */
import { ModelElement, ModelRelationship } from '../store/sysmlStore';

export interface ConnectionValidationError {
  type: 'error' | 'warning';
  message: string;
  code: string; // エラーコード (e.g. 'TYPE_MISMATCH')
  sourceElement?: ModelElement;
  targetElement?: ModelElement;
}

export class ConnectionValidator {
  /**
   * 接続の型互換性検証 
   * SysML v2では接続のエンドポイントとなる要素の型互換性が重要
   * @param sourceElement 接続元要素
   * @param targetElement 接続先要素
   * @param connection 接続関係オブジェクト
   * @returns バリデーションエラーの配列、問題がなければ空配列
   */
  static validateConnectionTypeCompatibility(
    sourceElement: ModelElement | undefined,
    targetElement: ModelElement | undefined,
    connection: ModelRelationship
  ): ConnectionValidationError[] {
    const errors: ConnectionValidationError[] = [];
    
    // 接続元または接続先が存在しない場合はエラー
    if (!sourceElement) {
      errors.push({
        type: 'error',
        message: `接続元要素（ID: ${connection.sourceId}）が見つかりません`,
        code: 'SOURCE_NOT_FOUND'
      });
      return errors; // これ以上のチェックは不要
    }
    
    if (!targetElement) {
      errors.push({
        type: 'error',
        message: `接続先要素（ID: ${connection.targetId}）が見つかりません`,
        code: 'TARGET_NOT_FOUND'
      });
      return errors; // これ以上のチェックは不要
    }
    
    // ConnectionUsageの型互換性検証
    if (connection.type === 'ConnectionUsage') {
      // InterfaceDefinition/Usage 間の接続のみを許可
      // または PartDefinition/Usage→InterfaceDefinition/Usage の接続を許可
      
      // インターフェース関連の型判定 - SysML v2では InterfaceDefinition または InterfaceUsage
      const isInterface = (element: ModelElement) => 
        element.type === 'InterfaceDefinition' || 
        element.type === 'InterfaceUsage';
      
      // 部品関連の型判定 - SysML v2では PartDefinition または PartUsage
      const isPart = (element: ModelElement) => 
        element.type === 'PartDefinition' || 
        element.type === 'PartUsage';
      
      // 接続タイプを取得（明示的設定がなければデフォルト）
      const connectionKind = connection.connectionKind || 'standard';
      
      // 標準接続の型検証
      if (connectionKind === 'standard') {
        // インターフェース → インターフェース
        if (isInterface(sourceElement) && !isInterface(targetElement)) {
          errors.push({
            type: 'error',
            message: `インターフェース ${sourceElement.name} はインターフェースにのみ接続できます。接続先 ${targetElement.name} は ${targetElement.type} です。`,
            code: 'INTERFACE_CONNECTION_TYPE_MISMATCH',
            sourceElement,
            targetElement
          });
        }
        
        // 部品は制約が緩い（インターフェースにも部品にも接続可能）
        // 特にチェックしない
      }
      
      // 項目フロー接続の型検証
      if (connectionKind === 'itemFlow') {
        // 入出力関連チェック（オプション）
        if (sourceElement.direction === 'in' && targetElement.direction === 'out') {
          errors.push({
            type: 'warning',
            message: `項目フローの向きが不自然です: 入力ポート ${sourceElement.name} から出力ポート ${targetElement.name} への流れは不適切です`,
            code: 'ITEM_FLOW_DIRECTION_WRONG',
            sourceElement,
            targetElement
          });
        }
        
        // 項目型の互換性チェック
        const sourceItemType = sourceElement.itemType;
        const targetItemType = targetElement.itemType;
        
        if (sourceItemType && targetItemType && sourceItemType !== targetItemType) {
          errors.push({
            type: 'warning',
            message: `項目型の不一致: 接続元の項目型 ${sourceItemType} と接続先の項目型 ${targetItemType} が異なります`,
            code: 'ITEM_TYPE_MISMATCH',
            sourceElement,
            targetElement
          });
        }
      }
    }
    
    return errors;
  }
  
  /**
   * 接続の多重度検証
   * SysML v2では要素間の多重度制約を検証
   * @param sourceElement 接続元要素
   * @param targetElement 接続先要素
   * @param connection 接続関係オブジェクト
   * @param existingConnections 既存の接続リスト
   * @returns バリデーションエラーの配列、問題がなければ空配列
   */
  static validateConnectionMultiplicity(
    sourceElement: ModelElement | undefined,
    targetElement: ModelElement | undefined,
    connection: ModelRelationship,
    existingConnections: ModelRelationship[]
  ): ConnectionValidationError[] {
    const errors: ConnectionValidationError[] = [];
    
    // 要素の存在チェック
    if (!sourceElement || !targetElement) {
      return errors; // 要素不在はすでに別の検証で捕捉済み
    }
    
    // 既存の接続数をカウント
    const sourceOutgoingCount = existingConnections.filter(
      conn => conn.sourceId === sourceElement.id && conn.type === connection.type
    ).length;
    
    const targetIncomingCount = existingConnections.filter(
      conn => conn.targetId === targetElement.id && conn.type === connection.type
    ).length;
    
    // 多重度の解析（SysML v2形式）
    const parseMultiplicity = (mult: string | undefined): { min: number, max: number } => {
      if (!mult) return { min: 0, max: Infinity }; // デフォルト: 0..*
      
      // 単一値 (例: '1')
      if (!mult.includes('..')) {
        const value = parseInt(mult, 10);
        return isNaN(value) ? { min: 0, max: Infinity } : { min: value, max: value };
      }
      
      // 範囲 (例: '0..1', '1..*')
      const parts = mult.split('..');
      const min = parseInt(parts[0], 10);
      const max = parts[1] === '*' ? Infinity : parseInt(parts[1], 10);
      
      return {
        min: isNaN(min) ? 0 : min,
        max: isNaN(max) ? Infinity : max
      };
    };
    
    // 接続元の出力多重度検証
    const sourceOutMult = parseMultiplicity(sourceElement.outMultiplicity);
    if (sourceOutgoingCount >= sourceOutMult.max) {
      errors.push({
        type: 'error',
        message: `接続元 ${sourceElement.name} の出力多重度上限 (${sourceElement.outMultiplicity || '0..*'}) を超えています`,
        code: 'SOURCE_OUT_MULTIPLICITY_EXCEEDED',
        sourceElement
      });
    }
    
    // 接続先の入力多重度検証
    const targetInMult = parseMultiplicity(targetElement.inMultiplicity);
    if (targetIncomingCount >= targetInMult.max) {
      errors.push({
        type: 'error',
        message: `接続先 ${targetElement.name} の入力多重度上限 (${targetElement.inMultiplicity || '0..*'}) を超えています`,
        code: 'TARGET_IN_MULTIPLICITY_EXCEEDED',
        targetElement
      });
    }
    
    return errors;
  }
  
  /**
   * 接続のサイクル検出
   * @param connection 検証する接続
   * @param allConnections すべての接続のリスト
   * @returns サイクルが検出された場合true
   */
  static detectCycles(
    connection: ModelRelationship,
    allConnections: ModelRelationship[]
  ): boolean {
    // 検証対象以外の既存接続
    const existingConnections = allConnections.filter(c => c.id !== connection.id);
    
    // 閉路検出のためのDFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (nodeId: string): boolean => {
      // すでに訪問済みなら再計算不要
      if (visited.has(nodeId)) return false;
      
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      // この頂点から出る辺を探索
      const outgoingConnections = existingConnections.filter(c => c.sourceId === nodeId);
      
      for (const conn of outgoingConnections) {
        const nextNodeId = conn.targetId;
        
        // 新しく追加する接続の接続先が今の頂点なら閉路
        if (connection.sourceId === nextNodeId && connection.targetId === nodeId) {
          return true;
        }
        
        // 再帰スタックに含まれているなら閉路
        if (recursionStack.has(nextNodeId)) {
          return true;
        }
        
        // まだ訪問していない頂点なら再帰的に探索
        if (!visited.has(nextNodeId) && hasCycle(nextNodeId)) {
          return true;
        }
      }
      
      // 頂点を再帰スタックから削除
      recursionStack.delete(nodeId);
      return false;
    };
    
    // 新しい接続の接続元から探索開始
    return hasCycle(connection.sourceId);
  }
}