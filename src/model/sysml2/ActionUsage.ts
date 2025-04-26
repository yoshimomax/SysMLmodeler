/**
 * SysML v2 ActionUsage クラス
 * アクションの使用を表すクラス
 * OMG SysML v2 Beta3 Part1 §7.17準拠
 */

import { v4 as uuid } from 'uuid';
import { Usage } from './Usage';
import { SysML2_ActionUsage } from './interfaces';
import { ValidationError } from './validator';

/**
 * ActionUsage コンストラクタパラメータ
 */
export interface ActionUsageParams {
  id?: string;
  name?: string;
  description?: string;
  actionDefinition?: string;
  isReference?: boolean;
  parameters?: string[];
  bodies?: string[];
  guard?: string;
  successions?: string[];
  preconditions?: string[];
  postconditions?: string[];
}

/**
 * ActionUsage クラス
 * SysML v2 のアクション使用を表現する
 */
export class ActionUsage extends Usage implements SysML2_ActionUsage {
  /** クラス識別子 */
  __type: 'ActionUsage' = 'ActionUsage';
  
  /** 参照するActionDefinitionのID */
  actionDefinition?: string;
  
  /** このActionUsageが他のActionUsageへの参照かどうか */
  isReference: boolean = false;
  
  /** パラメータのIDリスト */
  parameters: string[] = [];
  
  /** アクション本体（Behavior）のIDリスト */
  bodies: string[] = [];
  
  /** ガード条件 */
  guard?: string;
  
  /** 後続アクション（succession関係）のIDリスト */
  successions: string[] = [];
  
  /** 事前条件のIDリスト */
  preconditions: string[] = [];
  
  /** 事後条件のIDリスト */
  postconditions: string[] = [];

  /**
   * ActionUsage コンストラクタ
   * @param params ActionUsageのプロパティ
   */
  constructor(params: ActionUsageParams = {}) {
    super(params);
    
    this.id = params.id || uuid();
    this.name = params.name || '';
    this.description = params.description;
    this.actionDefinition = params.actionDefinition;
    
    if (params.isReference !== undefined) this.isReference = params.isReference;
    if (params.parameters) this.parameters = [...params.parameters];
    if (params.bodies) this.bodies = [...params.bodies];
    this.guard = params.guard;
    if (params.successions) this.successions = [...params.successions];
    if (params.preconditions) this.preconditions = [...params.preconditions];
    if (params.postconditions) this.postconditions = [...params.postconditions];
  }

  /**
   * アクションの検証
   * @throws ValidationError 検証エラー
   */
  validate(): void {
    super.validate();
    
    // 名前の存在確認
    if (!this.name) {
      throw new ValidationError(`ActionUsage (id=${this.id})はname属性を持つ必要があります`);
    }
    
    // 参照の場合は参照先が必要
    if (this.isReference && !this.actionDefinition) {
      throw new ValidationError(`参照型ActionUsage (id=${this.id}, name=${this.name})は` +
        `actionDefinition属性を持つ必要があります`);
    }
    
    // パラメータの整合性検証などのビジネスルールはここに追加
  }

  /**
   * パラメータを追加
   * @param parameterId 追加するパラメータのID
   */
  addParameter(parameterId: string): void {
    if (!this.parameters.includes(parameterId)) {
      this.parameters.push(parameterId);
    }
  }

  /**
   * パラメータを削除
   * @param parameterId 削除するパラメータのID
   * @returns 削除に成功した場合はtrue
   */
  removeParameter(parameterId: string): boolean {
    const index = this.parameters.indexOf(parameterId);
    if (index >= 0) {
      this.parameters.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * アクション本体を追加
   * @param bodyId 追加するアクション本体のID
   */
  addBody(bodyId: string): void {
    if (!this.bodies.includes(bodyId)) {
      this.bodies.push(bodyId);
    }
  }

  /**
   * アクション本体を削除
   * @param bodyId 削除するアクション本体のID
   * @returns 削除に成功した場合はtrue
   */
  removeBody(bodyId: string): boolean {
    const index = this.bodies.indexOf(bodyId);
    if (index >= 0) {
      this.bodies.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 後続アクションを追加
   * @param actionId 追加する後続アクションのID
   */
  addSuccession(actionId: string): void {
    if (!this.successions.includes(actionId)) {
      this.successions.push(actionId);
    }
  }

  /**
   * 後続アクションを削除
   * @param actionId 削除する後続アクションのID
   * @returns 削除に成功した場合はtrue
   */
  removeSuccession(actionId: string): boolean {
    const index = this.successions.indexOf(actionId);
    if (index >= 0) {
      this.successions.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 事前条件を追加
   * @param conditionId 追加する事前条件のID
   */
  addPrecondition(conditionId: string): void {
    if (!this.preconditions.includes(conditionId)) {
      this.preconditions.push(conditionId);
    }
  }

  /**
   * 事前条件を削除
   * @param conditionId 削除する事前条件のID
   * @returns 削除に成功した場合はtrue
   */
  removePrecondition(conditionId: string): boolean {
    const index = this.preconditions.indexOf(conditionId);
    if (index >= 0) {
      this.preconditions.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 事後条件を追加
   * @param conditionId 追加する事後条件のID
   */
  addPostcondition(conditionId: string): void {
    if (!this.postconditions.includes(conditionId)) {
      this.postconditions.push(conditionId);
    }
  }

  /**
   * 事後条件を削除
   * @param conditionId 削除する事後条件のID
   * @returns 削除に成功した場合はtrue
   */
  removePostcondition(conditionId: string): boolean {
    const index = this.postconditions.indexOf(conditionId);
    if (index >= 0) {
      this.postconditions.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * JSON形式に変換
   * @returns JSONオブジェクト
   */
  toJSON(): SysML2_ActionUsage {
    return {
      ...super.toJSON(),
      __type: this.__type,
      actionDefinition: this.actionDefinition,
      isReference: this.isReference,
      parameters: [...this.parameters],
      bodies: [...this.bodies],
      guard: this.guard,
      successions: [...this.successions],
      preconditions: [...this.preconditions],
      postconditions: [...this.postconditions]
    };
  }

  /**
   * JSONからActionUsageを復元
   * @param json JSONオブジェクト
   * @returns 復元されたActionUsage
   */
  static fromJSON(json: SysML2_ActionUsage): ActionUsage {
    const actionUsage = new ActionUsage({
      id: json.id,
      name: json.name,
      description: json.description,
      actionDefinition: json.actionDefinition,
      isReference: json.isReference,
      guard: json.guard
    });
    
    if (json.parameters) actionUsage.parameters = [...json.parameters];
    if (json.bodies) actionUsage.bodies = [...json.bodies];
    if (json.successions) actionUsage.successions = [...json.successions];
    if (json.preconditions) actionUsage.preconditions = [...json.preconditions];
    if (json.postconditions) actionUsage.postconditions = [...json.postconditions];

    return actionUsage;
  }
}