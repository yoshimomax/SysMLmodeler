/**
 * SysML v2 LoopActionUsage クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §10.4.8に準拠
 * 
 * LoopActionUsageは、繰り返し処理を表現するアクションクラスです。
 */

import { v4 as uuid } from 'uuid';
import { ActionUsage } from '../ActionUsage';
import { FeatureObject } from '../../kerml/Feature';

/**
 * LoopActionUsage クラス
 * SysML v2の繰り返しアクションを表現するクラス
 */
export class LoopActionUsage extends ActionUsage {
  /** ループの種類 */
  loopType: 'while' | 'until' | 'for' = 'while';
  
  /** ループ条件 */
  condition?: string;
  
  /** ループ本体アクションIDの配列 */
  bodyActions: string[] = [];
  
  /** 初期化アクションID（for-loopの場合） */
  setupActionId?: string;
  
  /** 更新アクションID（for-loopの場合） */
  updateActionId?: string;
  
  /**
   * LoopActionUsage コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    loopType?: 'while' | 'until' | 'for';
    condition?: string;
    bodyActions?: string[];
    setupActionId?: string;
    updateActionId?: string;
    ownerId?: string;
    description?: string;
    isAbstract?: boolean;
  } = {}) {
    super({
      id: options.id,
      name: options.name,
      actionDefinitionId: 'action.control.loop',
      ownerId: options.ownerId,
      description: options.description,
      isAbstract: options.isAbstract
    });
    
    this.loopType = options.loopType || 'while';
    this.condition = options.condition;
    
    if (options.bodyActions) {
      this.bodyActions = [...options.bodyActions];
    }
    
    this.setupActionId = options.setupActionId;
    this.updateActionId = options.updateActionId;
  }
  
  /**
   * 本体アクションを追加する
   * @param actionId 追加するアクションのID
   */
  addBodyAction(actionId: string): void {
    if (!this.bodyActions.includes(actionId)) {
      this.bodyActions.push(actionId);
    }
  }
  
  /**
   * 本体アクションを削除する
   * @param actionId 削除するアクションのID
   */
  removeBodyAction(actionId: string): void {
    this.bodyActions = this.bodyActions.filter(id => id !== actionId);
  }
  
  /**
   * 初期化アクションを設定する（for-loop用）
   * @param actionId 初期化アクションのID
   */
  setSetupAction(actionId: string): void {
    this.setupActionId = actionId;
  }
  
  /**
   * 更新アクションを設定する（for-loop用）
   * @param actionId 更新アクションのID
   */
  setUpdateAction(actionId: string): void {
    this.updateActionId = actionId;
  }
  
  /**
   * ループ条件を設定する
   * @param condition 条件式
   */
  setCondition(condition: string): void {
    this.condition = condition;
  }
  
  /**
   * アクションの情報をオブジェクトとして返す
   * @returns FeatureObject 構造
   */
  override toObject(): FeatureObject {
    const baseObject = super.toObject();
    return {
      ...baseObject,
      type: 'LoopActionUsage',
      properties: {
        ...baseObject.properties,
        loopType: this.loopType,
        condition: this.condition,
        bodyActions: [...this.bodyActions],
        setupActionId: this.setupActionId,
        updateActionId: this.updateActionId
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
      __type: 'LoopActionUsage'
    };
    // propertiesプロパティを除外した新しいオブジェクトを作成
    const { properties, ...resultWithoutProperties } = result;
    return resultWithoutProperties;
  }
  
  /**
   * JSONデータからLoopActionUsageインスタンスを作成する
   * @param json JSON形式のデータ
   * @returns 新しいLoopActionUsageインスタンス
   */
  static fromJSON(json: any): LoopActionUsage {
    if (!json || typeof json !== 'object') {
      throw new Error('有効なJSONオブジェクトではありません');
    }
    
    const loopAction = new LoopActionUsage({
      id: json.id || uuid(),
      name: json.name,
      ownerId: json.ownerId,
      description: json.description,
      isAbstract: json.isAbstract,
      loopType: json.loopType,
      condition: json.condition,
      bodyActions: json.bodyActions,
      setupActionId: json.setupActionId,
      updateActionId: json.updateActionId
    });
    
    return loopAction;
  }
}