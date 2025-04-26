/**
 * SysML v2のTransitionUsageクラス
 * 状態間の遷移を表現する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.18に準拠
 */

import { v4 as uuidv4 } from 'uuid';
import { Usage } from './Usage';
import { SysML2_TransitionUsage } from './interfaces';

export class TransitionUsage extends Usage {
  /** 参照するTransitionDefinitionのID */
  transitionDefinitionId?: string;

  /** 遷移元状態のID */
  sourceStateId?: string;

  /** 遷移先状態のID */
  targetStateId?: string;

  /** 遷移条件（ガード条件） */
  guard?: string;

  /** 遷移を引き起こすトリガー（イベント） */
  trigger?: string;

  /** 遷移時に実行するアクション */
  effect?: string;

  /** 遷移の優先度 */
  priority?: number;

  /** else遷移かどうか */
  isElse: boolean;

  /**
   * TransitionUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    transitionDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    sourceStateId?: string;
    targetStateId?: string;
    guard?: string;
    trigger?: string;
    effect?: string;
    priority?: number;
    isElse?: boolean;
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.transitionDefinitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages
    });

    this.transitionDefinitionId = params.transitionDefinitionId || params.definitionId;
    this.sourceStateId = params.sourceStateId;
    this.targetStateId = params.targetStateId;
    this.guard = params.guard;
    this.trigger = params.trigger;
    this.effect = params.effect;
    this.priority = params.priority;
    this.isElse = params.isElse ?? false;
  }

  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_TransitionUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_TransitionUsage {
    return {
      ...super.toJSON(),
      __type: 'TransitionUsage',
      transitionDefinition: this.transitionDefinitionId,
      sourceStateId: this.sourceStateId,
      targetStateId: this.targetStateId,
      guard: this.guard,
      trigger: this.trigger,
      effect: this.effect,
      priority: this.priority,
      isElse: this.isElse
    };
  }

  /**
   * JSONオブジェクトからTransitionUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns TransitionUsageインスタンス
   */
  static fromJSON(json: SysML2_TransitionUsage): TransitionUsage {
    return new TransitionUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      transitionDefinitionId: json.transitionDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
      sourceStateId: json.sourceStateId,
      targetStateId: json.targetStateId,
      guard: json.guard,
      trigger: json.trigger,
      effect: json.effect,
      priority: json.priority,
      isElse: json.isElse
    });
  }

  /**
   * 状態遷移のバリデーション
   * - 遷移元・遷移先状態のIDは必須
   * - else遷移の場合はガード条件を持たない
   * - 同一状態間でのループ遷移の場合はトリガーまたはガード条件が必要
   * @param stateIdResolver 状態IDを解決する関数（オプション）
   * @throws ValidationError バリデーションエラーがある場合
   */
  validate(stateIdResolver?: (id: string) => any): void {
    super.validate();

    // 遷移元と遷移先の状態IDは必須
    if (!this.sourceStateId) {
      throw new Error(`遷移(id=${this.id}, name=${this.name})には遷移元状態(sourceStateId)を指定する必要があります`);
    }

    if (!this.targetStateId) {
      throw new Error(`遷移(id=${this.id}, name=${this.name})には遷移先状態(targetStateId)を指定する必要があります`);
    }

    // else遷移の場合、ガード条件は持てない
    if (this.isElse && this.guard) {
      throw new Error(`else遷移(id=${this.id}, name=${this.name})にはガード条件(guard)を指定できません`);
    }

    // 自己遷移（同一状態間のループ）の場合、トリガーまたはガード条件が必要
    if (this.sourceStateId === this.targetStateId) {
      if (!this.trigger && !this.guard) {
        throw new Error(`自己遷移(id=${this.id}, name=${this.name})にはトリガー(trigger)またはガード条件(guard)のいずれかが必要です`);
      }
    }

    // 状態IDリゾルバがある場合は、存在性チェック
    if (stateIdResolver) {
      try {
        const sourceState = stateIdResolver(this.sourceStateId!);
        if (!sourceState) {
          throw new Error(`遷移(id=${this.id})の遷移元状態(id=${this.sourceStateId})が見つかりません`);
        }

        const targetState = stateIdResolver(this.targetStateId!);
        if (!targetState) {
          throw new Error(`遷移(id=${this.id})の遷移先状態(id=${this.targetStateId})が見つかりません`);
        }
      } catch (error) {
        throw new Error(`遷移(id=${this.id})の状態参照が無効です: ${error.message}`);
      }
    }
  }
}