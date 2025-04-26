import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { Definition } from './Definition';
import { SysML2_StateDefinition } from './interfaces';

/**
 * SysML v2のStateDefinitionクラス
 * システム要素の状態を定義する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.12に準拠
 */
export class StateDefinition extends Definition {
  /** このStateDefinitionを使用するStateUsageのIDリスト */
  stateUsages: string[];
  
  /** 初期状態かどうか */
  isInitial: boolean;
  
  /** 状態エントリー時に実行するアクションのIDリスト */
  entryActions: string[];
  
  /** 状態滞在中に実行するアクションのIDリスト */
  doActions: string[];
  
  /** 状態退出時に実行するアクションのIDリスト */
  exitActions: string[];
  
  /** 状態遷移のIDリスト */
  transitions: string[];
  
  /** ネストされた状態のIDリスト */
  nestedStates: string[];
  
  /**
   * StateDefinition コンストラクタ
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
    stateUsages?: string[];
    isInitial?: boolean;
    entryActions?: string[];
    doActions?: string[];
    exitActions?: string[];
    transitions?: string[];
    nestedStates?: string[];
  }) {
    super(params);
    
    this.stateUsages = params.stateUsages || [];
    this.isInitial = params.isInitial ?? false;
    this.entryActions = params.entryActions || [];
    this.doActions = params.doActions || [];
    this.exitActions = params.exitActions || [];
    this.transitions = params.transitions || [];
    this.nestedStates = params.nestedStates || [];
  }
  
  /**
   * StateUsageへの参照を追加する
   * @param stateUsageId 追加するStateUsageのID
   */
  addStateUsageReference(stateUsageId: string): void {
    if (!this.stateUsages.includes(stateUsageId)) {
      this.stateUsages.push(stateUsageId);
    }
  }
  
  /**
   * エントリーアクションを追加する
   * @param actionId 追加するアクションのID
   */
  addEntryAction(actionId: string): void {
    if (!this.entryActions.includes(actionId)) {
      this.entryActions.push(actionId);
    }
  }
  
  /**
   * Doアクションを追加する
   * @param actionId 追加するアクションのID
   */
  addDoAction(actionId: string): void {
    if (!this.doActions.includes(actionId)) {
      this.doActions.push(actionId);
    }
  }
  
  /**
   * 退出アクションを追加する
   * @param actionId 追加するアクションのID
   */
  addExitAction(actionId: string): void {
    if (!this.exitActions.includes(actionId)) {
      this.exitActions.push(actionId);
    }
  }
  
  /**
   * 遷移を追加する
   * @param transitionId 追加する遷移のID
   */
  addTransition(transitionId: string): void {
    if (!this.transitions.includes(transitionId)) {
      this.transitions.push(transitionId);
    }
  }
  
  /**
   * ネストされた状態を追加する
   * @param stateId 追加する状態のID
   */
  addNestedState(stateId: string): void {
    if (!this.nestedStates.includes(stateId)) {
      this.nestedStates.push(stateId);
    }
  }
  
  /**
   * ネストされた状態を削除する
   * @param stateId 削除する状態のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeNestedState(stateId: string): boolean {
    const index = this.nestedStates.indexOf(stateId);
    if (index !== -1) {
      this.nestedStates.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_StateDefinition形式のJSONオブジェクト
   */
  toJSON(): SysML2_StateDefinition {
    return {
      ...super.toJSON(),
      __type: 'StateDefinition',
      stateUsages: this.stateUsages,
      isInitial: this.isInitial,
      entryActions: this.entryActions,
      doActions: this.doActions,
      exitActions: this.exitActions,
      transitions: this.transitions,
      nestedStates: this.nestedStates
    };
  }
  
  /**
   * JSONオブジェクトからStateDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns StateDefinitionインスタンス
   */
  static fromJSON(json: SysML2_StateDefinition): StateDefinition {
    return new StateDefinition({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      ownedFeatures: json.ownedFeatures,
      stateUsages: json.stateUsages,
      isInitial: json.isInitial,
      entryActions: json.entryActions,
      doActions: json.doActions,
      exitActions: json.exitActions,
      transitions: json.transitions,
      nestedStates: json.nestedStates
    });
  }
  
  /**
   * オブジェクトをプレーンなJavaScriptオブジェクトに変換する（UI表示用）
   * @returns プレーンなJavaScriptオブジェクト
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      stereotype: this.stereotype || 'state_def',
      isAbstract: this.isAbstract,
      isInitial: this.isInitial,
      entryActions: this.entryActions,
      doActions: this.doActions,
      exitActions: this.exitActions,
      transitions: this.transitions,
      nestedStates: this.nestedStates
    };
  }
}