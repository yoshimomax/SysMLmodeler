/**
 * FeatureValidator
 * SysML v2 フィーチャメンバーシップの検証ロジック
 */
import { ModelElement, ModelRelationship } from '../store/sysmlStore';

export interface FeatureValidationError {
  type: 'error' | 'warning';
  message: string;
  code: string;
  sourceElement?: ModelElement;
  targetElement?: ModelElement;
}

export class FeatureValidator {
  /**
   * フィーチャメンバーシップの多重度検証
   * SysML v2では所有関係の多重度制約を検証
   * @param ownerElement 所有者要素（親）
   * @param featureElement フィーチャ要素（子）
   * @param relationship 所有関係
   * @param existingRelationships 既存の関係リスト
   * @returns バリデーションエラーの配列、問題がなければ空配列
   */
  static validateFeatureMembershipMultiplicity(
    ownerElement: ModelElement | undefined,
    featureElement: ModelElement | undefined,
    relationship: ModelRelationship,
    existingRelationships: ModelRelationship[]
  ): FeatureValidationError[] {
    const errors: FeatureValidationError[] = [];
    
    // 要素の存在チェック
    if (!ownerElement) {
      errors.push({
        type: 'error',
        message: `所有者要素（ID: ${relationship.sourceId}）が見つかりません`,
        code: 'OWNER_NOT_FOUND'
      });
      return errors; // これ以上のチェックは不要
    }
    
    if (!featureElement) {
      errors.push({
        type: 'error',
        message: `フィーチャ要素（ID: ${relationship.targetId}）が見つかりません`,
        code: 'FEATURE_NOT_FOUND'
      });
      return errors; // これ以上のチェックは不要
    }
    
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
    
    // 1. フィーチャの多重度検証 - フィーチャが複数の所有者を持てるか
    const featureOwnedCount = existingRelationships.filter(
      rel => rel.type === 'FeatureMembership' && rel.targetId === featureElement.id && rel.id !== relationship.id
    ).length;
    
    // フィーチャの多重度（デフォルトは0..1: 一つの所有者のみ）
    const featureOwnedMult = parseMultiplicity(featureElement.ownedMultiplicity || '0..1');
    
    if (featureOwnedCount >= featureOwnedMult.max) {
      errors.push({
        type: 'error',
        message: `フィーチャ ${featureElement.name} (${featureElement.type}) は最大 ${featureOwnedMult.max} つの所有者しか持てません`,
        code: 'FEATURE_OWNERSHIP_LIMIT_EXCEEDED',
        targetElement: featureElement
      });
    }
    
    // 2. 所有者のフィーチャ型ごとの多重度検証
    // 同じ型のフィーチャを何個所有しているか
    const featureType = featureElement.type;
    const sameTypeFeatureCount = existingRelationships.filter(rel => {
      if (rel.type !== 'FeatureMembership' || rel.sourceId !== ownerElement.id || rel.id === relationship.id) {
        return false;
      }
      
      // 関連するフィーチャの型をチェック
      const feature = rel.targetElement; // 仮に targetElement プロパティが存在すると仮定
      return feature && feature.type === featureType;
    }).length;
    
    // 型ごとの多重度制限（例: PartDefinition は Port を0..* 持てる）
    const typeMultiplicityLimit = this.getTypeMultiplicityLimit(ownerElement.type, featureType);
    
    if (sameTypeFeatureCount >= typeMultiplicityLimit.max) {
      errors.push({
        type: 'warning',
        message: `所有者 ${ownerElement.name} (${ownerElement.type}) は ${featureType} 型のフィーチャを最大 ${typeMultiplicityLimit.max} 個まで持てます`,
        code: 'OWNER_FEATURE_TYPE_LIMIT',
        sourceElement: ownerElement,
        targetElement: featureElement
      });
    }
    
    // 3. フィーチャが循環所有関係を作成していないか検証
    if (this.wouldCreateOwnershipCycle(relationship, existingRelationships)) {
      errors.push({
        type: 'error',
        message: `この関係を追加すると所有関係の循環が発生します: ${ownerElement.name} → ${featureElement.name} → ...`,
        code: 'OWNERSHIP_CYCLE',
        sourceElement: ownerElement,
        targetElement: featureElement
      });
    }
    
    return errors;
  }
  
  /**
   * 特定の型の所有者が持てる特定の型のフィーチャの多重度制限を取得
   * SysML v2の仕様に基づく型制約
   */
  private static getTypeMultiplicityLimit(
    ownerType: string,
    featureType: string
  ): { min: number, max: number } {
    // デフォルトは無制限
    const defaultLimit = { min: 0, max: Infinity };
    
    // SysML v2仕様に基づく型ごとの制約
    const typeConstraints: Record<string, Record<string, { min: number, max: number }>> = {
      'PartDefinition': {
        'PortUsage': { min: 0, max: Infinity },
        'AttributeUsage': { min: 0, max: Infinity },
        'PartUsage': { min: 0, max: Infinity },
        'ActionUsage': { min: 0, max: Infinity },
        'StateUsage': { min: 0, max: Infinity }
      },
      'InterfaceDefinition': {
        'AttributeUsage': { min: 0, max: Infinity },
        'FlowPropertyUsage': { min: 0, max: Infinity }
        // インターフェースはPort所有不可
      },
      'ActionDefinition': {
        'ParameterUsage': { min: 0, max: Infinity },
        'ActionUsage': { min: 0, max: Infinity },
        'StateUsage': { min: 0, max: Infinity }
      },
      'StateDefinition': {
        'StateUsage': { min: 0, max: Infinity },
        'TransitionUsage': { min: 0, max: Infinity }
      }
    };
    
    // 所有者タイプに対する制約マップがあるか
    if (typeConstraints[ownerType]) {
      // フィーチャタイプに対する制約があるか
      if (typeConstraints[ownerType][featureType]) {
        return typeConstraints[ownerType][featureType];
      }
    }
    
    // デフォルト値を返す
    return defaultLimit;
  }
  
  /**
   * 所有関係の循環を検出
   * @param newRelationship 追加する関係
   * @param existingRelationships 既存の関係リスト
   * @returns 循環が発生する場合true
   */
  private static wouldCreateOwnershipCycle(
    newRelationship: ModelRelationship,
    existingRelationships: ModelRelationship[]
  ): boolean {
    // FeatureMembership以外は無視
    if (newRelationship.type !== 'FeatureMembership') {
      return false;
    }
    
    // グラフ探索で循環を検出
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    // targetId から辿っていき、sourceId に戻ってくる経路があるか探索
    const hasCycle = (nodeId: string): boolean => {
      if (nodeId === newRelationship.sourceId) {
        // 元の所有者に戻ってきたら循環あり
        return true;
      }
      
      if (recursionStack.has(nodeId)) {
        // すでに再帰的に探索中のノードに戻ったら循環あり
        return true;
      }
      
      if (visited.has(nodeId)) {
        // 探索済みで循環が見つからなかったノード
        return false;
      }
      
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      // このノードが所有者である関係を全て取得
      const outgoingRelationships = existingRelationships.filter(
        rel => rel.type === 'FeatureMembership' && rel.sourceId === nodeId
      );
      
      // 各フィーチャで再帰的に探索
      for (const rel of outgoingRelationships) {
        if (hasCycle(rel.targetId)) {
          return true;
        }
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    // 新しい関係のターゲット(フィーチャ)から探索
    return hasCycle(newRelationship.targetId);
  }
}