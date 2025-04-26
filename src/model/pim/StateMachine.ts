import { v4 as uuidv4 } from 'uuid';
import { BlockDefinition } from '../sysml2/BlockDefinition';

/**
 * StateMachine クラス
 * システムやコンポーネントの状態遷移を表現する
 */
export class StateMachine {
  /** 一意識別子 */
  readonly id: string;
  
  /** 状態マシン名 */
  name: string;
  
  /** 状態マシンの説明 */
  description?: string;
  
  /** この状態マシンが記述する対象のブロック/要素 */
  owner?: BlockDefinition;
  
  /** 状態のリスト */
  states: State[] = [];
  
  /** 遷移のリスト */
  transitions: Transition[] = [];
  
  /** 初期状態のID */
  initialStateId?: string;
  
  /** 最終状態のIDリスト */
  finalStateIds: string[] = [];
  
  /**
   * StateMachine コンストラクタ
   * @param name 状態マシン名
   * @param owner 状態マシンの所有者（オプション）
   * @param states 状態のリスト（オプション）
   * @param transitions 遷移のリスト（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    owner?: BlockDefinition,
    states: State[] = [],
    transitions: Transition[] = [],
    id?: string
  ) {
    this.id = id || uuidv4();
    this.name = name;
    this.owner = owner;
    this.states = states;
    this.transitions = transitions;
    
    // 状態と遷移の所有者設定
    this.states.forEach(s => {
      s.ownerStateMachine = this;
    });
    
    this.transitions.forEach(t => {
      t.ownerStateMachine = this;
    });
  }
  
  /**
   * 状態を追加する
   * @param state 追加する状態
   */
  addState(state: State): void {
    state.ownerStateMachine = this;
    this.states.push(state);
    
    // 追加された状態が初期状態の場合は初期状態IDを設定
    if (state.isInitial) {
      this.initialStateId = state.id;
    }
    
    // 追加された状態が最終状態の場合は最終状態IDリストに追加
    if (state.isFinal) {
      this.finalStateIds.push(state.id);
    }
  }
  
  /**
   * 遷移を追加する
   * @param transition 追加する遷移
   */
  addTransition(transition: Transition): void {
    transition.ownerStateMachine = this;
    this.transitions.push(transition);
  }
  
  /**
   * 状態を削除する
   * @param stateId 削除する状態のID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeState(stateId: string): boolean {
    const initialLength = this.states.length;
    
    // ステートの削除
    this.states = this.states.filter(s => s.id !== stateId);
    
    // 削除された状態を参照する遷移も削除
    this.transitions = this.transitions.filter(t => 
      t.sourceStateId !== stateId && t.targetStateId !== stateId
    );
    
    // 初期状態が削除された場合は初期状態IDをクリア
    if (this.initialStateId === stateId) {
      this.initialStateId = undefined;
    }
    
    // 最終状態が削除された場合は最終状態IDリストから削除
    this.finalStateIds = this.finalStateIds.filter(id => id !== stateId);
    
    return this.states.length !== initialLength;
  }
  
  /**
   * 遷移を削除する
   * @param transitionId 削除する遷移のID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeTransition(transitionId: string): boolean {
    const initialLength = this.transitions.length;
    this.transitions = this.transitions.filter(t => t.id !== transitionId);
    return this.transitions.length !== initialLength;
  }
  
  /**
   * 初期状態を設定する
   * @param stateId 初期状態として設定する状態のID
   * @returns 設定に成功した場合はtrue、そうでなければfalse
   */
  setInitialState(stateId: string): boolean {
    // 指定した状態が存在するか確認
    const state = this.states.find(s => s.id === stateId);
    if (!state) {
      return false;
    }
    
    // 既存の初期状態をリセット
    if (this.initialStateId) {
      const oldInitialState = this.states.find(s => s.id === this.initialStateId);
      if (oldInitialState) {
        oldInitialState.isInitial = false;
      }
    }
    
    // 新しい初期状態を設定
    state.isInitial = true;
    this.initialStateId = stateId;
    
    return true;
  }
  
  /**
   * 状態マシンの情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      ownerId: this.owner?.id,
      ownerName: this.owner?.name,
      states: this.states.map(s => s.toObject()),
      transitions: this.transitions.map(t => t.toObject()),
      initialStateId: this.initialStateId,
      finalStateIds: this.finalStateIds
    };
  }
}

/**
 * State クラス
 * 状態マシン内の状態を表現する
 */
export class State {
  /** 一意識別子 */
  readonly id: string;
  
  /** 状態名 */
  name: string;
  
  /** 状態の説明 */
  description?: string;
  
  /** この状態の所有者となる状態マシン */
  ownerStateMachine?: StateMachine;
  
  /** 親状態（複合状態の場合） */
  parentState?: State;
  
  /** 子状態（複合状態の場合） */
  childStates: State[] = [];
  
  /** 状態に入る際の活動 */
  entryAction?: string;
  
  /** 状態に滞在中の活動 */
  doActivity?: string;
  
  /** 状態から出る際の活動 */
  exitAction?: string;
  
  /** 初期状態かどうか */
  isInitial: boolean = false;
  
  /** 最終状態かどうか */
  isFinal: boolean = false;
  
  /** UI上の位置情報（オプション） */
  position?: { x: number; y: number };
  
  /** UI上のサイズ情報（オプション） */
  size?: { width: number; height: number };
  
  /**
   * State コンストラクタ
   * @param name 状態名
   * @param ownerStateMachine 所有者となる状態マシン（オプション）
   * @param parentState 親状態（オプション）
   * @param isInitial 初期状態かどうか（デフォルト: false）
   * @param isFinal 最終状態かどうか（デフォルト: false）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    ownerStateMachine?: StateMachine,
    parentState?: State,
    isInitial: boolean = false,
    isFinal: boolean = false,
    id?: string
  ) {
    this.id = id || uuidv4();
    this.name = name;
    this.ownerStateMachine = ownerStateMachine;
    this.parentState = parentState;
    this.isInitial = isInitial;
    this.isFinal = isFinal;
    
    // 親状態の子状態リストに自身を追加
    if (parentState) {
      parentState.childStates.push(this);
    }
  }
  
  /**
   * 子状態を追加する
   * @param childState 追加する子状態
   */
  addChildState(childState: State): void {
    childState.parentState = this;
    this.childStates.push(childState);
  }
  
  /**
   * 子状態を削除する
   * @param childStateId 削除する子状態のID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeChildState(childStateId: string): boolean {
    const initialLength = this.childStates.length;
    this.childStates = this.childStates.filter(s => s.id !== childStateId);
    return this.childStates.length !== initialLength;
  }
  
  /**
   * 状態の情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      ownerStateMachineId: this.ownerStateMachine?.id,
      parentStateId: this.parentState?.id,
      parentStateName: this.parentState?.name,
      childStates: this.childStates.map(s => s.toObject()),
      entryAction: this.entryAction,
      doActivity: this.doActivity,
      exitAction: this.exitAction,
      isInitial: this.isInitial,
      isFinal: this.isFinal,
      position: this.position,
      size: this.size
    };
  }
}

/**
 * Transition クラス
 * 状態間の遷移を表現する
 */
export class Transition {
  /** 一意識別子 */
  readonly id: string;
  
  /** 遷移名/ラベル */
  name?: string;
  
  /** 遷移の説明 */
  description?: string;
  
  /** この遷移の所有者となる状態マシン */
  ownerStateMachine?: StateMachine;
  
  /** 遷移元の状態ID */
  sourceStateId: string;
  
  /** 遷移元の状態 */
  sourceState?: State;
  
  /** 遷移先の状態ID */
  targetStateId: string;
  
  /** 遷移先の状態 */
  targetState?: State;
  
  /** 遷移のトリガー（イベント） */
  trigger?: string;
  
  /** 遷移の条件（ガード条件） */
  guard?: string;
  
  /** 遷移時のアクション */
  effect?: string;
  
  /** UI表示用の中間点 */
  vertices?: { x: number; y: number }[];
  
  /**
   * Transition コンストラクタ
   * @param sourceStateId 遷移元状態のID
   * @param targetStateId 遷移先状態のID
   * @param ownerStateMachine 所有者となる状態マシン（オプション）
   * @param name 遷移名/ラベル（オプション）
   * @param trigger トリガー/イベント（オプション）
   * @param guard ガード条件（オプション）
   * @param effect 遷移時のアクション（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    sourceStateId: string,
    targetStateId: string,
    ownerStateMachine?: StateMachine,
    name?: string,
    trigger?: string,
    guard?: string,
    effect?: string,
    id?: string
  ) {
    this.id = id || uuidv4();
    this.sourceStateId = sourceStateId;
    this.targetStateId = targetStateId;
    this.ownerStateMachine = ownerStateMachine;
    this.name = name;
    this.trigger = trigger;
    this.guard = guard;
    this.effect = effect;
    
    // 状態マシンが指定されている場合は状態参照を設定
    if (ownerStateMachine) {
      this.sourceState = ownerStateMachine.states.find(s => s.id === sourceStateId);
      this.targetState = ownerStateMachine.states.find(s => s.id === targetStateId);
    }
  }
  
  /**
   * 中間点を設定する
   * @param vertices 中間点の配列
   */
  setVertices(vertices: { x: number; y: number }[]): void {
    this.vertices = vertices;
  }
  
  /**
   * 遷移の情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      ownerStateMachineId: this.ownerStateMachine?.id,
      sourceStateId: this.sourceStateId,
      sourceStateName: this.sourceState?.name,
      targetStateId: this.targetStateId,
      targetStateName: this.targetState?.name,
      trigger: this.trigger,
      guard: this.guard,
      effect: this.effect,
      vertices: this.vertices
    };
  }
}