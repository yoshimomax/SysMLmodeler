/**
 * SysML v2のTransitionDefinitionクラス
 * 状態間の遷移を定義する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.18に準拠
 */

import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { Definition } from './Definition';
import { SysML2_TransitionDefinition } from './interfaces';

export class TransitionDefinition extends Definition {
  /** このTransitionDefinitionを使用するTransitionUsageのIDリスト */
  transitionUsages: string[];

  /** 遷移元状態の型 */
  sourceStateType?: string;

  /** 遷移先状態の型 */
  targetStateType?: string;

  /** ガード条件の型 */
  guardType?: string;

  /** トリガーの型 */
  triggerType?: string;

  /** エフェクトアクションの型 */
  effectType?: string;

  /**
   * TransitionDefinition コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    isAbstract?: boolean;
    isVariation?: boolean;
    stereotype?: string;
    ownedFeatures?: string[] | Feature[];
    transitionUsages?: string[];
    sourceStateType?: string;
    targetStateType?: string;
    guardType?: string;
    triggerType?: string;
    effectType?: string;
  }) {
    super(params);

    this.transitionUsages = params.transitionUsages || [];
    this.sourceStateType = params.sourceStateType;
    this.targetStateType = params.targetStateType;
    this.guardType = params.guardType;
    this.triggerType = params.triggerType;
    this.effectType = params.effectType;
  }

  /**
   * TransitionUsageへの参照を追加する
   * @param transitionUsageId 追加するTransitionUsageのID
   */
  addTransitionUsageReference(transitionUsageId: string): void {
    if (!this.transitionUsages.includes(transitionUsageId)) {
      this.transitionUsages.push(transitionUsageId);
    }
  }

  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_TransitionDefinition形式のJSONオブジェクト
   */
  toJSON(): SysML2_TransitionDefinition {
    return {
      ...super.toJSON(),
      __type: 'TransitionDefinition',
      transitionUsages: this.transitionUsages,
      sourceStateType: this.sourceStateType,
      targetStateType: this.targetStateType,
      guardType: this.guardType,
      triggerType: this.triggerType,
      effectType: this.effectType
    };
  }

  /**
   * JSONオブジェクトからTransitionDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns TransitionDefinitionインスタンス
   */
  static fromJSON(json: SysML2_TransitionDefinition): TransitionDefinition {
    return new TransitionDefinition({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      ownedFeatures: json.ownedFeatures,
      transitionUsages: json.transitionUsages,
      sourceStateType: json.sourceStateType,
      targetStateType: json.targetStateType,
      guardType: json.guardType,
      triggerType: json.triggerType,
      effectType: json.effectType
    });
  }

  /**
   * 状態遷移定義のバリデーション
   * - 遷移元・遷移先の状態型は必須
   * - ガード条件がある場合はブール型であること
   * @throws ValidationError バリデーションエラーがある場合
   */
  validate(): void {
    super.validate();

    if (!this.sourceStateType) {
      throw new Error(`状態遷移定義(id=${this.id}, name=${this.name})には遷移元状態の型(sourceStateType)を指定する必要があります`);
    }

    if (!this.targetStateType) {
      throw new Error(`状態遷移定義(id=${this.id}, name=${this.name})には遷移先状態の型(targetStateType)を指定する必要があります`);
    }

    // ガード条件がある場合は、guardTypeとして有効な式型(BooleanやPredicate型など)であることを確認
    if (this.guardType && !this.isValidGuardType(this.guardType)) {
      throw new Error(`状態遷移定義(id=${this.id}, name=${this.name})のガード条件型(${this.guardType})は有効な論理型である必要があります`);
    }
  }

  /**
   * ガード条件型が有効かチェック
   * @param guardType 検証するガード条件型名
   * @returns 有効であればtrue
   */
  private isValidGuardType(guardType: string): boolean {
    // 有効なガード条件型のリスト（SysML v2 仕様に基づく）
    const validGuardTypes = [
      'Boolean', 'BooleanExpression', 'Predicate', 'Constraint', 'Expression'
    ];
    
    return validGuardTypes.some(type => guardType.includes(type));
  }
}