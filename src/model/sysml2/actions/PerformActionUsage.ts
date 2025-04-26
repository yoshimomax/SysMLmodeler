/**
 * SysML v2 PerformActionUsage クラス
 * 実行アクションの使用を表す
 * OMG SysML v2 Beta3 Part1 §7.17準拠
 */

import { v4 as uuid } from 'uuid';
import { ActionUsage, ActionUsageParams } from '../ActionUsage';
import { SysML2_ActionUsage } from '../interfaces';
import { ValidationError } from '../validator';

/**
 * PerformActionUsage コンストラクタパラメータ
 */
export interface PerformActionUsageParams extends ActionUsageParams {
  target?: string;      // ターゲット要素のID
  isParallel?: boolean; // 並列実行かどうか
  arguments?: string[]; // 引数リスト
}

/**
 * PerformActionUsage クラス
 * 他のアクションを実行するアクション
 */
export class PerformActionUsage extends ActionUsage {
  /** クラス識別子 */
  __type: 'PerformActionUsage' = 'PerformActionUsage';

  /** 実行対象のアクションID */
  target?: string;
  
  /** 並列実行かどうか */
  isParallel: boolean = false;
  
  /** 引数リスト */
  arguments: string[] = [];

  /**
   * PerformActionUsage コンストラクタ
   * @param params PerformActionUsageのプロパティ
   */
  constructor(params: PerformActionUsageParams = {}) {
    super(params);
    
    this.target = params.target;
    if (params.isParallel !== undefined) this.isParallel = params.isParallel;
    if (params.arguments) this.arguments = [...params.arguments];
  }

  /**
   * アクションの検証
   * @throws ValidationError 検証エラー
   */
  validate(): void {
    super.validate();
    
    // 実行対象の存在確認
    if (!this.target && !this.actionDefinition) {
      throw new ValidationError(`PerformActionUsage (id=${this.id}, name=${this.name})は` +
        `targetまたはactionDefinition属性のいずれかを持つ必要があります`);
    }
  }

  /**
   * 引数を追加
   * @param argId 追加する引数のID
   */
  addArgument(argId: string): void {
    if (!this.arguments.includes(argId)) {
      this.arguments.push(argId);
    }
  }

  /**
   * 引数を削除
   * @param argId 削除する引数のID
   * @returns 削除に成功した場合はtrue
   */
  removeArgument(argId: string): boolean {
    const index = this.arguments.indexOf(argId);
    if (index >= 0) {
      this.arguments.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * JSON形式に変換
   * @returns JSONオブジェクト
   */
  toJSON(): SysML2_ActionUsage & { 
    target?: string;
    isParallel: boolean;
    arguments: string[];
  } {
    return {
      ...super.toJSON(),
      __type: this.__type,
      target: this.target,
      isParallel: this.isParallel,
      arguments: [...this.arguments]
    };
  }

  /**
   * JSONからPerformActionUsageを復元
   * @param json JSONオブジェクト
   * @returns 復元されたPerformActionUsage
   */
  static fromJSON(json: ReturnType<PerformActionUsage['toJSON']>): PerformActionUsage {
    const actionUsage = new PerformActionUsage({
      id: json.id,
      name: json.name,
      description: json.description,
      actionDefinition: json.actionDefinition,
      isReference: json.isReference,
      guard: json.guard,
      target: json.target,
      isParallel: json.isParallel
    });
    
    if (json.parameters) actionUsage.parameters = [...json.parameters];
    if (json.bodies) actionUsage.bodies = [...json.bodies];
    if (json.successions) actionUsage.successions = [...json.successions];
    if (json.preconditions) actionUsage.preconditions = [...json.preconditions];
    if (json.postconditions) actionUsage.postconditions = [...json.postconditions];
    if (json.arguments) actionUsage.arguments = [...json.arguments];

    return actionUsage;
  }
}