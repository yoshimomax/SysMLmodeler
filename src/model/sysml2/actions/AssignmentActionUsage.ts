/**
 * SysML v2 AssignmentActionUsage クラス
 * 代入アクションの使用を表す
 * OMG SysML v2 Beta3 Part1 §7.17準拠
 */

import { v4 as uuid } from 'uuid';
import { ActionUsage, ActionUsageParams } from '../ActionUsage';
import { SysML2_ActionUsage } from '../interfaces';
import { ValidationError } from '../validator';

/**
 * AssignmentActionUsage コンストラクタパラメータ
 */
export interface AssignmentActionUsageParams extends ActionUsageParams {
  target?: string;              // 代入先のID
  value?: string;               // 代入する値またはID
  expression?: string;          // 代入式
  isComposite?: boolean;        // 複合代入かどうか
  operator?: string;            // 演算子（+=, -= など）
}

/**
 * AssignmentActionUsage クラス
 * 値を代入するアクション
 */
export class AssignmentActionUsage extends ActionUsage {
  /** クラス識別子 */
  __type: 'AssignmentActionUsage' = 'AssignmentActionUsage';

  /** 代入先のID */
  target?: string;
  
  /** 代入する値またはID */
  value?: string;
  
  /** 代入式 */
  expression?: string;
  
  /** 複合代入かどうか */
  isComposite: boolean = false;
  
  /** 演算子（+=, -= など） */
  operator?: string;

  /**
   * AssignmentActionUsage コンストラクタ
   * @param params AssignmentActionUsageのプロパティ
   */
  constructor(params: AssignmentActionUsageParams = {}) {
    super(params);
    
    this.target = params.target;
    this.value = params.value;
    this.expression = params.expression;
    if (params.isComposite !== undefined) this.isComposite = params.isComposite;
    this.operator = params.operator;
  }

  /**
   * アクションの検証
   * @throws ValidationError 検証エラー
   */
  validate(): void {
    super.validate();
    
    // 代入先の存在確認
    if (!this.target) {
      throw new ValidationError(`AssignmentActionUsage (id=${this.id}, name=${this.name})は` +
        `target属性を持つ必要があります`);
    }
    
    // 値または式の存在確認
    if (!this.value && !this.expression) {
      throw new ValidationError(`AssignmentActionUsage (id=${this.id}, name=${this.name})は` +
        `valueまたはexpression属性のいずれかを持つ必要があります`);
    }
    
    // 複合代入の場合は演算子が必要
    if (this.isComposite && !this.operator) {
      throw new ValidationError(`複合代入AssignmentActionUsage (id=${this.id}, name=${this.name})は` +
        `operator属性を持つ必要があります`);
    }
  }

  /**
   * JSON形式に変換
   * @returns JSONオブジェクト
   */
  toJSON(): SysML2_ActionUsage & { 
    target?: string;
    value?: string;
    expression?: string;
    isComposite: boolean;
    operator?: string;
  } {
    return {
      ...super.toJSON(),
      __type: this.__type,
      target: this.target,
      value: this.value,
      expression: this.expression,
      isComposite: this.isComposite,
      operator: this.operator
    };
  }

  /**
   * JSONからAssignmentActionUsageを復元
   * @param json JSONオブジェクト
   * @returns 復元されたAssignmentActionUsage
   */
  static fromJSON(json: ReturnType<AssignmentActionUsage['toJSON']>): AssignmentActionUsage {
    const actionUsage = new AssignmentActionUsage({
      id: json.id,
      name: json.name,
      description: json.description,
      actionDefinition: json.actionDefinition,
      isReference: json.isReference,
      guard: json.guard,
      target: json.target,
      value: json.value,
      expression: json.expression,
      isComposite: json.isComposite,
      operator: json.operator
    });
    
    if (json.parameters) actionUsage.parameters = [...json.parameters];
    if (json.bodies) actionUsage.bodies = [...json.bodies];
    if (json.successions) actionUsage.successions = [...json.successions];
    if (json.preconditions) actionUsage.preconditions = [...json.preconditions];
    if (json.postconditions) actionUsage.postconditions = [...json.postconditions];

    return actionUsage;
  }
}