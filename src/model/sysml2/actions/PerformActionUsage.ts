/**
 * SysML v2 PerformActionUsage クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §10.4.2に準拠
 * 
 * PerformActionUsageは、アクション定義の呼び出しを表現するアクションクラスです。
 */

import { v4 as uuid } from 'uuid';
import { ActionUsage } from '../ActionUsage';
import { FeatureObject } from '../../kerml/Feature';

/**
 * PerformActionUsage クラス
 * SysML v2の呼び出しアクションを表現するクラス
 */
export class PerformActionUsage extends ActionUsage {
  /** 呼び出すアクション定義ID */
  performedActionId?: string;
  
  /** 引数値マッピング */
  argumentValues: Record<string, any> = {};
  
  /**
   * PerformActionUsage コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    performedActionId?: string;
    argumentValues?: Record<string, any>;
    ownerId?: string;
    description?: string;
    isAbstract?: boolean;
  } = {}) {
    super({
      id: options.id,
      name: options.name,
      actionDefinitionId: options.performedActionId,
      ownerId: options.ownerId,
      description: options.description,
      isAbstract: options.isAbstract
    });
    
    this.performedActionId = options.performedActionId;
    
    if (options.argumentValues) {
      this.argumentValues = { ...options.argumentValues };
    }
  }
  
  /**
   * 引数値を設定する
   * @param name 引数名
   * @param value 値
   */
  setArgumentValue(name: string, value: any): void {
    this.argumentValues[name] = value;
  }
  
  /**
   * 呼び出すアクション定義を設定する
   * @param actionId アクション定義ID
   */
  setPerformedAction(actionId: string): void {
    this.performedActionId = actionId;
    this.actionDefinitionId = actionId;
  }
  
  /**
   * アクションの情報をオブジェクトとして返す
   * @returns FeatureObject 構造
   */
  override toObject(): FeatureObject {
    const baseObject = super.toObject();
    return {
      ...baseObject,
      type: 'PerformActionUsage',
      properties: {
        ...baseObject.properties,
        performedActionId: this.performedActionId,
        argumentValues: { ...this.argumentValues }
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
      __type: 'PerformActionUsage'
    };
    // propertiesプロパティを除外した新しいオブジェクトを作成
    const { properties, ...resultWithoutProperties } = result;
    return resultWithoutProperties;
  }
  
  /**
   * JSONデータからPerformActionUsageインスタンスを作成する
   * @param json JSON形式のデータ
   * @returns 新しいPerformActionUsageインスタンス
   */
  static fromJSON(json: any): PerformActionUsage {
    if (!json || typeof json !== 'object') {
      throw new Error('有効なJSONオブジェクトではありません');
    }
    
    const performAction = new PerformActionUsage({
      id: json.id || uuid(),
      name: json.name,
      ownerId: json.ownerId,
      description: json.description,
      isAbstract: json.isAbstract,
      performedActionId: json.performedActionId,
      argumentValues: json.argumentValues
    });
    
    return performAction;
  }
}