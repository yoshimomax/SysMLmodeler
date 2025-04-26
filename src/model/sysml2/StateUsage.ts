import { v4 as uuidv4 } from 'uuid';
import { Usage } from './Usage';
import { SysML2_StateUsage } from './interfaces';

/**
 * SysML v2のStateUsageクラス
 * システム要素の状態の使用を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.12に準拠
 */
export class StateUsage extends Usage {
  /** 参照するStateDefinitionのID */
  stateDefinitionId?: string;
  
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
   * StateUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    stateDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    isInitial?: boolean;
    entryActions?: string[];
    doActions?: string[];
    exitActions?: string[];
    transitions?: string[];
    nestedStates?: string[];
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.stateDefinitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages
    });
    
    this.stateDefinitionId = params.stateDefinitionId || params.definitionId;
    this.isInitial = params.isInitial ?? false;
    this.entryActions = params.entryActions || [];
    this.doActions = params.doActions || [];
    this.exitActions = params.exitActions || [];
    this.transitions = params.transitions || [];
    this.nestedStates = params.nestedStates || [];
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
      // スーパークラスのnestedUsagesにも追加
      if (!this.nestedUsages.includes(stateId)) {
        this.nestedUsages.push(stateId);
      }
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
      
      // スーパークラスのnestedUsagesからも削除
      const usageIndex = this.nestedUsages.indexOf(stateId);
      if (usageIndex !== -1) {
        this.nestedUsages.splice(usageIndex, 1);
      }
      
      return true;
    }
    return false;
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_StateUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_StateUsage {
    return {
      ...super.toJSON(),
      __type: 'StateUsage',
      stateDefinition: this.stateDefinitionId,
      isInitial: this.isInitial,
      entryActions: this.entryActions,
      doActions: this.doActions,
      exitActions: this.exitActions,
      transitions: this.transitions,
      nestedStates: this.nestedStates
    };
  }
  
  /**
   * JSONオブジェクトからStateUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns StateUsageインスタンス
   */
  static fromJSON(json: SysML2_StateUsage): StateUsage {
    return new StateUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      stateDefinitionId: json.stateDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
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
      stereotype: this.stereotype || 'state',
      definitionId: this.stateDefinitionId,
      isInitial: this.isInitial,
      entryActions: this.entryActions,
      doActions: this.doActions,
      exitActions: this.exitActions,
      transitions: this.transitions,
      nestedStates: this.nestedStates
    };
  }
}