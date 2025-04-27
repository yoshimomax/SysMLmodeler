/**
 * SysML v2 ActionUsage クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §10.4に準拠
 * 
 * ActionUsageは、システム内での行動を表現するクラスです。
 * 様々な種類のアクションや制御構造の基底クラスとなります。
 */

import { v4 as uuid } from 'uuid';
import { Feature } from '../kerml/Feature';
import { FeatureObject } from '../kerml/Feature';

/**
 * ActionUsage クラス
 * SysML v2のアクション使用を表現するクラス
 */
export class ActionUsage extends Feature {
  /** アクション定義への参照ID */
  actionDefinitionId?: string;
  
  /** 継続関係（次のアクション）への参照ID配列 */
  successions: string[] = [];
  
  /** パラメータ値のマップ */
  parameterValues: Record<string, any> = {};
  
  /** パラメータID配列 */
  parameters: string[] = [];
  
  /** ガード条件（実行条件） */
  guard?: string;
  
  /**
   * ActionUsage コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    actionDefinitionId?: string;
    successions?: string[];
    parameterValues?: Record<string, any>;
    parameters?: string[];
    guard?: string;
    ownerId?: string;
    description?: string;
    isAbstract?: boolean;
  } = {}) {
    super({
      id: options.id,
      name: options.name,
      ownerId: options.ownerId,
      description: options.description,
      isAbstract: options.isAbstract
    });
    
    this.actionDefinitionId = options.actionDefinitionId;
    
    if (options.successions) {
      this.successions = [...options.successions];
    }
    
    if (options.parameterValues) {
      this.parameterValues = { ...options.parameterValues };
    }
    
    if (options.parameters) {
      this.parameters = [...options.parameters];
    }
    
    this.guard = options.guard;
  }
  
  /**
   * 継続関係（次のアクション）を追加
   * @param successorId 次のアクションのID
   */
  addSuccession(successorId: string): void {
    if (!this.successions.includes(successorId)) {
      this.successions.push(successorId);
    }
  }
  
  /**
   * 継続関係（次のアクション）を削除
   * @param successorId 削除する次のアクションのID
   */
  removeSuccession(successorId: string): void {
    this.successions = this.successions.filter(id => id !== successorId);
  }
  
  /**
   * パラメータ値を設定
   * @param name パラメータ名
   * @param value 値
   */
  setParameterValue(name: string, value: any): void {
    this.parameterValues[name] = value;
  }
  
  /**
   * アクションの情報をオブジェクトとして返す
   * @returns FeatureObject 構造
   */
  override toObject(): FeatureObject {
    const baseObject = super.toObject();
    return {
      ...baseObject,
      type: 'ActionUsage',
      properties: {
        ...baseObject.properties,
        actionDefinitionId: this.actionDefinitionId,
        successions: [...this.successions],
        parameterValues: { ...this.parameterValues },
        parameters: [...this.parameters],
        guard: this.guard
      }
    };
  }
  
  /**
   * JSONシリアライズ用のメソッド
   * @returns JSON形式のオブジェクト
   */
  override toJSON(): any {
    const obj = this.toObject();
    // obj.properties内のすべてのプロパティをトップレベルに移動
    const result = {
      ...obj,
      ...obj.properties,
      __type: 'ActionUsage'
    };
    // propertiesプロパティを除外した新しいオブジェクトを作成
    const { properties, ...resultWithoutProperties } = result;
    return resultWithoutProperties;
  }
  
  /**
   * JSONデータからActionUsageインスタンスを作成する
   * @param json JSON形式のデータ
   * @returns 新しいActionUsageインスタンス
   */
  static fromJSON(json: any): ActionUsage {
    if (!json || typeof json !== 'object') {
      throw new Error('有効なJSONオブジェクトではありません');
    }
    
    const actionUsage = new ActionUsage({
      id: json.id || uuid(),
      name: json.name,
      ownerId: json.ownerId,
      description: json.description,
      isAbstract: json.isAbstract,
      actionDefinitionId: json.actionDefinitionId,
      successions: json.successions,
      parameterValues: json.parameterValues,
      parameters: json.parameters,
      guard: json.guard
    });
    
    return actionUsage;
  }
}