/**
 * SysML v2 ActionDefinition クラス
 * アクションの定義を表すクラス
 * OMG SysML v2 Beta3 Part1 §7.17準拠
 */

import { v4 as uuid } from 'uuid';
import { Definition } from './Definition';
import { SysML2_ActionDefinition } from './interfaces';
import { ValidationError } from './validator';

/**
 * ActionDefinition コンストラクタパラメータ
 */
export interface ActionDefinitionParams {
  id?: string;
  name?: string;
  description?: string;
  isAbstract?: boolean;
  parameters?: string[];
  bodies?: string[];
  guardParams?: string[];
  preconditions?: string[];
  postconditions?: string[];
}

/**
 * ActionDefinition クラス
 * SysML v2 のアクション定義を表現する
 */
export class ActionDefinition extends Definition implements SysML2_ActionDefinition {
  /** クラス識別子 */
  __type: 'ActionDefinition' = 'ActionDefinition';
  
  /** このActionDefinitionを使用するActionUsageのIDリスト */
  actionUsages: string[] = [];
  
  /** パラメータのIDリスト */
  parameters: string[] = [];
  
  /** 抽象アクションかどうか */
  isAbstract: boolean = false;
  
  /** アクション本体（Behavior）のIDリスト */
  bodies: string[] = [];
  
  /** ガード条件パラメータのIDリスト */
  guardParams: string[] = [];
  
  /** 事前条件のIDリスト */
  preconditions: string[] = [];
  
  /** 事後条件のIDリスト */
  postconditions: string[] = [];

  /**
   * ActionDefinition コンストラクタ
   * @param params ActionDefinitionのプロパティ
   */
  constructor(params: ActionDefinitionParams = {}) {
    super(params);
    
    this.id = params.id || uuid();
    this.name = params.name || '';
    this.description = params.description;
    
    if (params.isAbstract !== undefined) this.isAbstract = params.isAbstract;
    if (params.parameters) this.parameters = [...params.parameters];
    if (params.bodies) this.bodies = [...params.bodies];
    if (params.guardParams) this.guardParams = [...params.guardParams];
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
      throw new ValidationError(`ActionDefinition (id=${this.id})はname属性を持つ必要があります`);
    }
    
    // その他のビジネスルール検証はここに追加
    // パラメータの存在性、パラメータタイプの互換性など
  }

  /**
   * ActionUsageへの参照を追加
   * @param actionUsageId 追加するActionUsageのID
   */
  addActionUsage(actionUsageId: string): void {
    if (!this.actionUsages.includes(actionUsageId)) {
      this.actionUsages.push(actionUsageId);
    }
  }

  /**
   * ActionUsageへの参照を削除
   * @param actionUsageId 削除するActionUsageのID
   * @returns 削除に成功した場合はtrue
   */
  removeActionUsage(actionUsageId: string): boolean {
    const index = this.actionUsages.indexOf(actionUsageId);
    if (index >= 0) {
      this.actionUsages.splice(index, 1);
      return true;
    }
    return false;
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
   * ガード条件パラメータを追加
   * @param paramId 追加するガード条件パラメータのID
   */
  addGuardParam(paramId: string): void {
    if (!this.guardParams.includes(paramId)) {
      this.guardParams.push(paramId);
    }
  }

  /**
   * ガード条件パラメータを削除
   * @param paramId 削除するガード条件パラメータのID
   * @returns 削除に成功した場合はtrue
   */
  removeGuardParam(paramId: string): boolean {
    const index = this.guardParams.indexOf(paramId);
    if (index >= 0) {
      this.guardParams.splice(index, 1);
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
  toJSON(): SysML2_ActionDefinition {
    return {
      ...super.toJSON(),
      __type: this.__type,
      actionUsages: [...this.actionUsages],
      parameters: [...this.parameters],
      isAbstract: this.isAbstract,
      bodies: [...this.bodies],
      guardParams: [...this.guardParams],
      preconditions: [...this.preconditions],
      postconditions: [...this.postconditions]
    };
  }

  /**
   * JSONからActionDefinitionを復元
   * @param json JSONオブジェクト
   * @returns 復元されたActionDefinition
   */
  static fromJSON(json: SysML2_ActionDefinition): ActionDefinition {
    const actionDef = new ActionDefinition({
      id: json.id,
      name: json.name,
      description: json.description,
      isAbstract: json.isAbstract
    });
    
    if (json.parameters) actionDef.parameters = [...json.parameters];
    if (json.bodies) actionDef.bodies = [...json.bodies];
    if (json.guardParams) actionDef.guardParams = [...json.guardParams];
    if (json.preconditions) actionDef.preconditions = [...json.preconditions];
    if (json.postconditions) actionDef.postconditions = [...json.postconditions];
    if (json.actionUsages) actionDef.actionUsages = [...json.actionUsages];

    return actionDef;
  }
}