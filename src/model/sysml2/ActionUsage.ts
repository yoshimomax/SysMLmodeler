/**
 * SysML v2 ActionUsage クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.17に準拠
 * 
 * ActionUsageは、アクションの使用を表すクラスです。
 * 後続関係、パラメータ値、および実行順序を定義します。
 */

import { v4 as uuid } from 'uuid';
import { Feature } from '../kerml/Feature';

export class ActionUsage extends Feature {
  /** このアクションの後続アクションのID配列 */
  successions: string[] = [];
  
  /** このアクションが参照するアクション定義のID */
  actionDefinition?: string;
  
  /** アクションが持つパラメータ値のマッピング */
  parameterValues: Map<string, any> = new Map();
  
  /** アクションが持つパラメータ参照のリスト */
  parameters: string[] = [];
  
  /** 実行のガード条件（アクションが実行される条件） */
  guard?: string;
  
  /**
   * アクション使用のコンストラクタ
   * @param options アクション使用の初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    actionDefinition?: string;
    successions?: string[];
    parameterValues?: Record<string, any>;
    parameters?: string[];
    guard?: string;
    ownerId?: string;
    isAbstract?: boolean;
  } = {}) {
    // Feature基底クラスのコンストラクタを呼び出し
    super({
      id: options.id,
      name: options.name,
      ownerId: options.ownerId,
      isAbstract: options.isAbstract
    });
    
    this.actionDefinition = options.actionDefinition;
    this.successions = options.successions || [];
    this.parameters = options.parameters || [];
    this.guard = options.guard;
    
    // パラメータ値のマッピングを初期化
    if (options.parameterValues) {
      Object.entries(options.parameterValues).forEach(([key, value]) => {
        this.parameterValues.set(key, value);
      });
    }
  }
  
  /**
   * 後続アクションを追加する
   * @param successorId 後続アクションのID
   */
  addSuccession(successorId: string): void {
    if (!this.successions.includes(successorId)) {
      this.successions.push(successorId);
    }
  }
  
  /**
   * 後続アクションを削除する
   * @param successorId 削除する後続アクションのID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeSuccession(successorId: string): boolean {
    const initialLength = this.successions.length;
    this.successions = this.successions.filter(id => id !== successorId);
    return this.successions.length !== initialLength;
  }
  
  /**
   * パラメータを追加する
   * @param parameterId 追加するパラメータのID
   */
  addParameter(parameterId: string): void {
    if (!this.parameters.includes(parameterId)) {
      this.parameters.push(parameterId);
    }
  }
  
  /**
   * パラメータ値を設定する
   * @param parameterId パラメータID
   * @param value パラメータの値
   */
  setParameterValue(parameterId: string, value: any): void {
    this.parameterValues.set(parameterId, value);
  }
  
  /**
   * パラメータ値を取得する
   * @param parameterId パラメータID
   * @returns パラメータの値、存在しない場合はundefined
   */
  getParameterValue(parameterId: string): any {
    return this.parameterValues.get(parameterId);
  }
  
  /**
   * ガード条件を設定する
   * @param condition アクションが実行される条件式
   */
  setGuard(condition: string): void {
    this.guard = condition;
  }
  
  /**
   * アクション使用の情報をオブジェクトとして返す
   */
  override toObject() {
    const baseObject = super.toJSON();
    
    // パラメータ値のマッピングをオブジェクトに変換
    const parameterValuesObj: Record<string, any> = {};
    this.parameterValues.forEach((value, paramId) => {
      parameterValuesObj[paramId] = value;
    });
    
    return {
      ...baseObject,
      actionDefinition: this.actionDefinition,
      successions: [...this.successions],
      parameters: [...this.parameters],
      parameterValues: parameterValuesObj,
      guard: this.guard
    };
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
    
    // ActionUsageインスタンスを作成
    const actionUsage = new ActionUsage({
      id: json.id || uuid(),
      name: json.name,
      ownerId: json.ownerId,
      isAbstract: json.isAbstract,
      actionDefinition: json.actionDefinition,
      successions: Array.isArray(json.successions) ? [...json.successions] : [],
      parameters: Array.isArray(json.parameters) ? [...json.parameters] : [],
      parameterValues: json.parameterValues || {},
      guard: json.guard
    });
    
    return actionUsage;
  }
  
  /**
   * JSONシリアライズ用のメソッド
   * @returns JSON形式のオブジェクト
   */
  toJSON(): any {
    const obj = this.toObject();
    return {
      ...obj,
      __type: 'ActionUsage'
    };
  }
}