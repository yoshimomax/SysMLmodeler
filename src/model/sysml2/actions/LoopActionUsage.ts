/**
 * SysML v2 LoopActionUsage クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.17.5に準拠
 * 
 * LoopActionUsageは、繰り返しアクションを表現するクラスです。
 * 条件が満たされる間、または指定された回数だけ特定のアクションを繰り返し実行します。
 */

import { v4 as uuid } from 'uuid';
import { ActionUsage } from '../ActionUsage';
import { FeatureObject } from '../../kerml/Feature';

export class LoopActionUsage extends ActionUsage {
  /** 繰り返し種別（while, until, forEach） */
  loopType: 'while' | 'until' | 'forEach';
  
  /** 繰り返し条件 */
  condition?: string;
  
  /** 繰り返し回数の上限（オプション） */
  maxIterations?: number;
  
  /** 繰り返し本体のアクションID配列 */
  bodyActions: string[] = [];
  
  /** 
   * 設定パラメータID （forEachループで使用）
   * forEachループの場合、このパラメータは反復ごとに値が設定されます
   */
  setupParameterId?: string;
  
  /**
   * LoopActionUsage コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    loopType: 'while' | 'until' | 'forEach';
    condition?: string;
    maxIterations?: number;
    bodyActions?: string[];
    setupParameterId?: string;
    actionDefinition?: string;
    successions?: string[];
    parameterValues?: Record<string, any>;
    parameters?: string[];
    guard?: string;
    ownerId?: string;
    isAbstract?: boolean;
  }) {
    // ActionUsage基底クラスのコンストラクタを呼び出し
    super({
      id: options.id,
      name: options.name,
      actionDefinition: options.actionDefinition,
      successions: options.successions,
      parameterValues: options.parameterValues,
      parameters: options.parameters,
      guard: options.guard,
      ownerId: options.ownerId,
      isAbstract: options.isAbstract
    });
    
    // ループ特有のプロパティを初期化
    this.loopType = options.loopType;
    this.condition = options.condition;
    this.maxIterations = options.maxIterations;
    this.bodyActions = options.bodyActions || [];
    this.setupParameterId = options.setupParameterId;
  }
  
  /**
   * 本体アクションを追加する
   * @param actionId 追加するアクションID
   */
  addBodyAction(actionId: string): void {
    if (!this.bodyActions.includes(actionId)) {
      this.bodyActions.push(actionId);
    }
  }
  
  /**
   * 本体アクションを削除する
   * @param actionId 削除するアクションID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeBodyAction(actionId: string): boolean {
    const initialLength = this.bodyActions.length;
    this.bodyActions = this.bodyActions.filter(id => id !== actionId);
    return this.bodyActions.length !== initialLength;
  }
  
  /**
   * ループ条件を設定する
   * @param condition 条件式
   */
  setCondition(condition: string): void {
    this.condition = condition;
  }
  
  /**
   * 最大繰り返し回数を設定する
   * @param maxCount 最大繰り返し回数
   */
  setMaxIterations(maxCount: number): void {
    this.maxIterations = maxCount;
  }
  
  /**
   * setupParameterIdを設定する
   * @param parameterId パラメータID
   */
  setSetupParameterId(parameterId: string): void {
    this.setupParameterId = parameterId;
  }
  
  /**
   * ループ種別を変更する
   * @param loopType 新しいループ種別
   */
  setLoopType(loopType: 'while' | 'until' | 'forEach'): void {
    this.loopType = loopType;
  }
  
  /**
   * ループアクションの情報をオブジェクトとして返す
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
        maxIterations: this.maxIterations,
        bodyActions: [...this.bodyActions],
        setupParameterId: this.setupParameterId
      }
    };
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
    
    // 必須のループ種別を検証
    if (!json.loopType || !['while', 'until', 'forEach'].includes(json.loopType)) {
      throw new Error('有効なloopTypeが指定されていません');
    }
    
    // LoopActionUsageインスタンスを作成
    const loopAction = new LoopActionUsage({
      id: json.id || uuid(),
      name: json.name,
      ownerId: json.ownerId,
      isAbstract: json.isAbstract,
      actionDefinition: json.actionDefinition,
      successions: Array.isArray(json.successions) ? [...json.successions] : [],
      parameters: Array.isArray(json.parameters) ? [...json.parameters] : [],
      parameterValues: json.parameterValues || {},
      guard: json.guard,
      loopType: json.loopType,
      condition: json.condition,
      maxIterations: typeof json.maxIterations === 'number' ? json.maxIterations : undefined,
      bodyActions: Array.isArray(json.bodyActions) ? [...json.bodyActions] : [],
      setupParameterId: json.setupParameterId
    });
    
    return loopAction;
  }
  
  /**
   * JSONシリアライズ用のメソッド
   * @returns JSON形式のオブジェクト
   */
  toJSON(): any {
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
}