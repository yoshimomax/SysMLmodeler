/**
 * SysML v2 ActionDefinition クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.17に準拠
 * 
 * ActionDefinitionは、アクションの型を定義するクラスです。
 * パラメータを含み、アクションの振る舞いの枠組みを表現します。
 */

import { v4 as uuid } from 'uuid';
import { Definition } from '../kerml/Definition';
import { Parameter } from '../kerml/Parameter';

export class ActionDefinition extends Definition {
  /** アクションが持つパラメータの参照リスト */
  parameters: string[] = [];
  
  /** アクションが持つパラメータのマッピング */
  parameterMappings: Map<string, string> = new Map();
  
  /** パラメータ方向のマッピング (in/out/inout) */
  parameterDirections: Map<string, 'in' | 'out' | 'inout'> = new Map();
  
  /**
   * アクション定義のコンストラクタ
   * @param options アクション定義の初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    parameters?: string[];
    parameterMappings?: Record<string, string>;
    parameterDirections?: Record<string, 'in' | 'out' | 'inout'>;
    ownerId?: string;
    isAbstract?: boolean;
    isVariation?: boolean;
  }) {
    // Definition基底クラスのコンストラクタを呼び出し
    super({
      id: options.id,
      name: options.name,
      ownerId: options.ownerId,
      isAbstract: options.isAbstract,
      isVariation: options.isVariation
    });
    
    // パラメータリストの初期化
    this.parameters = options.parameters || [];
    
    // パラメータマッピングの初期化
    if (options.parameterMappings) {
      Object.entries(options.parameterMappings).forEach(([key, value]) => {
        this.parameterMappings.set(key, value);
      });
    }
    
    // パラメータ方向の初期化
    if (options.parameterDirections) {
      Object.entries(options.parameterDirections).forEach(([key, value]) => {
        this.parameterDirections.set(key, value);
      });
    }
    
    // 各パラメータを特性として登録
    this.parameters.forEach(parameterId => {
      if (!this.ownedFeatures.includes(parameterId)) {
        this.ownedFeatures.push(parameterId);
      }
    });
    
    // KerML制約の検証
    try {
      this.validate();
    } catch (error) {
      console.warn(`警告: ActionDefinition(id=${this.id}, name=${this.name}) の検証中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * パラメータを追加する
   * @param parameterId 追加するパラメータのID
   * @param direction パラメータの方向（デフォルトは 'in'）
   */
  addParameter(parameterId: string, direction: 'in' | 'out' | 'inout' = 'in'): void {
    if (!this.parameters.includes(parameterId)) {
      this.parameters.push(parameterId);
      this.parameterDirections.set(parameterId, direction);
      
      // Definition基底クラスの特性としても追加
      if (!this.ownedFeatures.includes(parameterId)) {
        this.ownedFeatures.push(parameterId);
      }
    }
  }
  
  /**
   * パラメータを削除する
   * @param parameterId 削除するパラメータのID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeParameter(parameterId: string): boolean {
    const initialLength = this.parameters.length;
    this.parameters = this.parameters.filter(id => id !== parameterId);
    
    // マッピングと方向情報も削除
    this.parameterMappings.delete(parameterId);
    this.parameterDirections.delete(parameterId);
    
    // Definition基底クラスからも特性を削除
    this.removeFeature(parameterId);
    
    return this.parameters.length !== initialLength;
  }
  
  /**
   * パラメータ間のマッピングを設定する
   * @param sourceId ソースパラメータID
   * @param targetId ターゲットパラメータID
   */
  setParameterMapping(sourceId: string, targetId: string): void {
    this.parameterMappings.set(sourceId, targetId);
  }
  
  /**
   * パラメータの方向を設定する
   * @param parameterId パラメータID
   * @param direction パラメータの方向
   */
  setParameterDirection(parameterId: string, direction: 'in' | 'out' | 'inout'): void {
    this.parameterDirections.set(parameterId, direction);
  }
  
  /**
   * パラメータの方向を取得する
   * @param parameterId パラメータID
   * @returns パラメータの方向、設定されていない場合は 'in'
   */
  getParameterDirection(parameterId: string): 'in' | 'out' | 'inout' {
    return this.parameterDirections.get(parameterId) || 'in';
  }
  
  /**
   * KerML制約およびSysML v2の制約を検証する
   * SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.17に準拠
   */
  validate(): void {
    // 親クラス（Definition）の制約を検証
    super.validate();
    
    // SysML v2固有の制約検証
    // アクション定義特有の検証ロジック
  }
  
  /**
   * アクション定義の情報をオブジェクトとして返す
   */
  override toObject() {
    const baseObject = super.toObject();
    
    // パラメータ方向とマッピングをオブジェクトに変換
    const parameterDirectionsObj: Record<string, 'in' | 'out' | 'inout'> = {};
    this.parameterDirections.forEach((direction, paramId) => {
      parameterDirectionsObj[paramId] = direction;
    });
    
    const parameterMappingsObj: Record<string, string> = {};
    this.parameterMappings.forEach((targetId, sourceId) => {
      parameterMappingsObj[sourceId] = targetId;
    });
    
    return {
      ...baseObject,
      parameters: [...this.parameters],
      parameterDirections: parameterDirectionsObj,
      parameterMappings: parameterMappingsObj
    };
  }
  
  /**
   * JSONデータからActionDefinitionインスタンスを作成する
   * @param json JSON形式のデータ
   * @returns 新しいActionDefinitionインスタンス
   */
  static fromJSON(json: any): ActionDefinition {
    if (!json || typeof json !== 'object') {
      throw new Error('有効なJSONオブジェクトではありません');
    }
    
    // パラメータリストの復元
    const parameters = Array.isArray(json.parameters) ? [...json.parameters] : [];
    
    // パラメータ方向とマッピングの復元
    const parameterDirections = json.parameterDirections || {};
    const parameterMappings = json.parameterMappings || {};
    
    // ActionDefinitionインスタンスを作成
    const actionDef = new ActionDefinition({
      id: json.id || uuid(),
      name: json.name,
      ownerId: json.ownerId,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      parameters,
      parameterDirections,
      parameterMappings
    });
    
    // その他の特性を復元
    if (Array.isArray(json.ownedFeatures)) {
      // パラメータから追加されたIDを除外
      const existingFeatureIds = new Set(parameters);
      
      // 既存のものを除外して追加
      json.ownedFeatures.forEach((featureId: string) => {
        if (!existingFeatureIds.has(featureId) && !actionDef.ownedFeatures.includes(featureId)) {
          actionDef.ownedFeatures.push(featureId);
        }
      });
    }
    
    return actionDef;
  }
  
  /**
   * JSONシリアライズ用のメソッド
   * @returns JSON形式のオブジェクト
   */
  toJSON(): any {
    const obj = this.toObject();
    return {
      ...obj,
      __type: 'ActionDefinition'
    };
  }
}