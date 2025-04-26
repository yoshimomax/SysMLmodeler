/**
 * SysML v2 状態マシンバリデータ
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.18 State Machines に基づく検証
 * 
 * 主な検証内容:
 * - 初期状態の存在と一意性
 * - 遷移の整合性（遷移元・遷移先の存在）
 * - 状態の到達可能性
 * - ガード条件の競合と矛盾
 * - 終了状態への適切な遷移
 */

import { ValidationError } from './validator';
import { StateDefinition } from './StateDefinition';
import { StateUsage } from './StateUsage';
import { TransitionDefinition } from './TransitionDefinition';
import { TransitionUsage } from './TransitionUsage';

/**
 * 状態マシンの初期状態をチェック
 * 状態マシンには1つだけ初期状態が存在する必要がある
 * @param states 状態のリスト
 * @param contextName コンテキスト名（エラーメッセージ用）
 * @throws ValidationError 初期状態が存在しないか、複数存在する場合
 */
export function validateInitialState(
  states: StateDefinition[] | StateUsage[],
  contextName: string
): void {
  if (!states || states.length === 0) {
    throw new ValidationError(`${contextName}には状態が必要です`);
  }

  const initialStates = states.filter(state => state.isInitial);
  
  if (initialStates.length === 0) {
    throw new ValidationError(`${contextName}には初期状態が必要です`);
  }
  
  if (initialStates.length > 1) {
    const stateNames = initialStates.map(s => s.name || s.id).join(', ');
    throw new ValidationError(`${contextName}に複数の初期状態(${stateNames})が定義されています。初期状態は1つだけ必要です`);
  }
}

/**
 * 状態遷移の整合性チェック
 * @param transitions 遷移のリスト
 * @param stateMap 状態ID -> 状態 のマップ（または状態IDを解決する関数）
 * @param contextName コンテキスト名（エラーメッセージ用）
 * @throws ValidationError 遷移に問題がある場合
 */
export function validateTransitions(
  transitions: TransitionUsage[],
  stateMap: { [id: string]: StateDefinition | StateUsage } | ((id: string) => StateDefinition | StateUsage | undefined),
  contextName: string
): void {
  if (!transitions || transitions.length === 0) {
    return; // 遷移がない場合はOK（ただし初期状態のみの単純な状態マシンを想定）
  }
  
  // 状態IDを解決する関数を準備
  const resolveState = typeof stateMap === 'function' 
    ? stateMap 
    : (id: string) => stateMap[id];
  
  for (const transition of transitions) {
    // 遷移元と遷移先が存在するか確認
    const sourceId = transition.sourceStateId;
    const targetId = transition.targetStateId;
    
    if (!sourceId || !targetId) {
      throw new ValidationError(
        `${contextName}の遷移(id=${transition.id}, name=${transition.name || 'unnamed'})に` +
        `遷移元状態または遷移先状態が設定されていません`
      );
    }
    
    const sourceState = resolveState(sourceId);
    if (!sourceState) {
      throw new ValidationError(
        `${contextName}の遷移(id=${transition.id}, name=${transition.name || 'unnamed'})の` +
        `遷移元状態(id=${sourceId})が見つかりません`
      );
    }
    
    const targetState = resolveState(targetId);
    if (!targetState) {
      throw new ValidationError(
        `${contextName}の遷移(id=${transition.id}, name=${transition.name || 'unnamed'})の` +
        `遷移先状態(id=${targetId})が見つかりません`
      );
    }
  }
}

/**
 * 状態到達可能性チェック
 * すべての状態が初期状態から到達可能か検証する
 * @param states 状態のリスト
 * @param transitions 遷移のリスト
 * @param contextName コンテキスト名（エラーメッセージ用）
 * @returns 到達不可能な状態ID配列（空なら全て到達可能）
 */
export function findUnreachableStates(
  states: (StateDefinition | StateUsage)[],
  transitions: TransitionUsage[],
  contextName: string
): string[] {
  if (!states || states.length === 0) {
    return []; // 状態がない場合は空の配列を返す
  }
  
  // 初期状態を見つける
  const initialState = states.find(state => state.isInitial);
  if (!initialState) {
    throw new ValidationError(`${contextName}には初期状態が必要です`);
  }
  
  // 到達可能な状態IDの集合
  const reachableStateIds = new Set<string>([initialState.id]);
  
  // 到達可能な状態が増えなくなるまで繰り返す
  let changed = true;
  while (changed) {
    changed = false;
    
    for (const transition of transitions) {
      // 遷移元が到達可能で、遷移先がまだ到達可能でない場合
      if (
        transition.sourceStateId && 
        transition.targetStateId &&
        reachableStateIds.has(transition.sourceStateId) &&
        !reachableStateIds.has(transition.targetStateId)
      ) {
        // 遷移先を到達可能とマーク
        reachableStateIds.add(transition.targetStateId);
        changed = true;
      }
    }
  }
  
  // 到達不可能な状態IDを抽出
  const unreachableStateIds = states
    .filter(state => !reachableStateIds.has(state.id))
    .map(state => state.id);
  
  return unreachableStateIds;
}

/**
 * ガード条件の重複/競合チェック
 * 同じ遷移元を持つ遷移間でのガード条件の重複や競合を検出
 * @param transitions 遷移のリスト
 * @param contextName コンテキスト名（エラーメッセージ用）
 * @throws ValidationError ガード条件に問題がある場合
 */
export function validateGuardConditions(
  transitions: TransitionUsage[],
  contextName: string
): void {
  if (!transitions || transitions.length <= 1) {
    return; // 遷移が1つ以下なら競合なし
  }
  
  // 遷移元状態ごとに遷移をグループ化
  const transitionsBySource: { [sourceId: string]: TransitionUsage[] } = {};
  
  for (const transition of transitions) {
    const sourceId = transition.sourceStateId;
    if (!sourceId) continue;
    
    transitionsBySource[sourceId] = transitionsBySource[sourceId] || [];
    transitionsBySource[sourceId].push(transition);
  }
  
  // 各グループ内で競合チェック
  for (const sourceId in transitionsBySource) {
    const sourceTransitions = transitionsBySource[sourceId];
    if (sourceTransitions.length <= 1) continue;
    
    // else遷移があるかチェック
    const elseTransitions = sourceTransitions.filter(t => t.isElse);
    
    if (elseTransitions.length > 1) {
      const transIds = elseTransitions.map(t => t.id).join(', ');
      throw new ValidationError(
        `${contextName}の状態(id=${sourceId})から出る複数のelse遷移(${transIds})が存在します。` +
        `else遷移は1つまで定義できます`
      );
    }
    
    // ガード条件のないデフォルト遷移の重複チェック
    const defaultTransitions = sourceTransitions.filter(
      t => !t.guard && !t.isElse && !t.trigger
    );
    
    if (defaultTransitions.length > 1) {
      const transIds = defaultTransitions.map(t => t.id).join(', ');
      throw new ValidationError(
        `${contextName}の状態(id=${sourceId})から出る複数のデフォルト遷移(${transIds})が存在します。` +
        `ガード条件とトリガーのない遷移は1つまで定義できます`
      );
    }
  }
}

/**
 * 状態マシン全体の検証
 * @param states 状態のリスト
 * @param transitions 遷移のリスト
 * @param contextName コンテキスト名（エラーメッセージ用）
 * @throws ValidationError 状態マシンに問題がある場合
 */
export function validateStateMachine(
  states: (StateDefinition | StateUsage)[],
  transitions: TransitionUsage[],
  contextName: string
): void {
  // 初期状態のチェック
  validateInitialState(states, contextName);
  
  // 状態ID -> 状態 のマップを作成
  const stateMap: { [id: string]: StateDefinition | StateUsage } = {};
  states.forEach(state => { stateMap[state.id] = state; });
  
  // 遷移の整合性チェック
  validateTransitions(transitions, stateMap, contextName);
  
  // ガード条件の重複/競合チェック
  validateGuardConditions(transitions, contextName);
  
  // 到達不可能な状態を検出
  const unreachableStateIds = findUnreachableStates(states, transitions, contextName);
  
  if (unreachableStateIds.length > 0) {
    const stateNames = unreachableStateIds
      .map(id => (stateMap[id]?.name || id))
      .join(', ');
    
    throw new ValidationError(
      `${contextName}に初期状態から到達不可能な状態(${stateNames})が存在します`
    );
  }
}