/**
 * SysML v2 TerminateActionUsage クラス
 * 終了アクションの使用を表す
 * OMG SysML v2 Beta3 Part1 §7.17準拠
 */

import { v4 as uuid } from 'uuid';
import { ActionUsage, ActionUsageParams } from '../ActionUsage';
import { SysML2_ActionUsage } from '../interfaces';
import { ValidationError } from '../validator';

/**
 * TerminateActionUsage コンストラクタパラメータ
 */
export interface TerminateActionUsageParams extends ActionUsageParams {
  target?: string;         // 終了対象のID
  scope?: 'self' | 'all';  // 終了スコープ
  returnValue?: string;    // 戻り値
}

/**
 * TerminateActionUsage クラス
 * 処理を終了するアクション
 */
export class TerminateActionUsage extends ActionUsage {
  /** クラス識別子 */
  __type: 'TerminateActionUsage' = 'TerminateActionUsage';

  /** 終了対象のID */
  target?: string;
  
  /** 終了スコープ */
  scope: 'self' | 'all' = 'self';
  
  /** 戻り値 */
  returnValue?: string;

  /**
   * TerminateActionUsage コンストラクタ
   * @param params TerminateActionUsageのプロパティ
   */
  constructor(params: TerminateActionUsageParams = {}) {
    super(params);
    
    this.target = params.target;
    if (params.scope) this.scope = params.scope;
    this.returnValue = params.returnValue;
  }

  /**
   * アクションの検証
   * @throws ValidationError 検証エラー
   */
  validate(): void {
    super.validate();
    
    // スコープの確認（許容値：'self', 'all'）
    if (this.scope !== 'self' && this.scope !== 'all') {
      throw new ValidationError(`TerminateActionUsage (id=${this.id}, name=${this.name})の` +
        `scope属性は'self'または'all'である必要があります`);
    }
  }

  /**
   * JSON形式に変換
   * @returns JSONオブジェクト
   */
  toJSON(): SysML2_ActionUsage & { 
    target?: string;
    scope: 'self' | 'all';
    returnValue?: string;
  } {
    return {
      ...super.toJSON(),
      __type: this.__type,
      target: this.target,
      scope: this.scope,
      returnValue: this.returnValue
    };
  }

  /**
   * JSONからTerminateActionUsageを復元
   * @param json JSONオブジェクト
   * @returns 復元されたTerminateActionUsage
   */
  static fromJSON(json: ReturnType<TerminateActionUsage['toJSON']>): TerminateActionUsage {
    const actionUsage = new TerminateActionUsage({
      id: json.id,
      name: json.name,
      description: json.description,
      actionDefinition: json.actionDefinition,
      isReference: json.isReference,
      guard: json.guard,
      target: json.target,
      scope: json.scope as 'self' | 'all',
      returnValue: json.returnValue
    });
    
    if (json.parameters) actionUsage.parameters = [...json.parameters];
    if (json.bodies) actionUsage.bodies = [...json.bodies];
    if (json.successions) actionUsage.successions = [...json.successions];
    if (json.preconditions) actionUsage.preconditions = [...json.preconditions];
    if (json.postconditions) actionUsage.postconditions = [...json.postconditions];

    return actionUsage;
  }
}