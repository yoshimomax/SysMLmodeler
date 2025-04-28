/**
 * 状態マシン検証機能のテスト
 * SysML v2の状態マシン関連クラスと検証ロジックをテスト
 */

import { StateDefinition } from '../../src/model/sysml2/StateDefinition';
import { StateUsage } from '../../src/model/sysml2/StateUsage';
import { TransitionDefinition } from '../../src/model/sysml2/TransitionDefinition';
import { TransitionUsage } from '../../src/model/sysml2/TransitionUsage';
import { ValidationError } from '../../src/model/sysml2/validator';
import {
  validateInitialState,
  validateTransitions,
  findUnreachableStates,
  validateGuardConditions,
  validateStateMachine
} from '../../src/model/sysml2/StateMachineValidator';

describe('SysML2 状態マシン機能', () => {
  describe('TransitionDefinition', () => {
    it('基本プロパティを持つTransitionDefinitionを作成できる', () => {
      const transitionDef = new TransitionDefinition({
        name: 'MoveTransition',
        sourceStateType: 'Idle',
        targetStateType: 'Moving',
        guardType: 'Boolean',
        triggerType: 'Event',
        effectType: 'Action'
      });
      
      expect(transitionDef.id).toBeDefined();
      expect(transitionDef.name).toBe('MoveTransition');
      expect(transitionDef.sourceStateType).toBe('Idle');
      expect(transitionDef.targetStateType).toBe('Moving');
      expect(transitionDef.guardType).toBe('Boolean');
      expect(transitionDef.triggerType).toBe('Event');
      expect(transitionDef.effectType).toBe('Action');
      expect(transitionDef.transitionUsages).toEqual([]);
    });
    
    it('JSONシリアライズとデシリアライズが正しく動作する', () => {
      const original = new TransitionDefinition({
        id: 'transition-def-1',
        name: 'MoveTransition',
        sourceStateType: 'Idle',
        targetStateType: 'Moving',
        guardType: 'Boolean'
      });
      
      const json = original.toJSON();
      expect(json.__type).toBe('TransitionDefinition');
      
      const restored = TransitionDefinition.fromJSON(json);
      expect(restored.id).toBe(original.id);
      expect(restored.name).toBe(original.name);
      expect(restored.sourceStateType).toBe(original.sourceStateType);
      expect(restored.targetStateType).toBe(original.targetStateType);
      expect(restored.guardType).toBe(original.guardType);
    });
    
    it('必須プロパティが欠けていると検証でエラーになる', () => {
      // 遷移元状態型がない
      const missingSource = new TransitionDefinition({
        name: 'InvalidTransition',
        targetStateType: 'Moving'
      });
      
      expect(() => missingSource.validate()).toThrow(/遷移元状態の型.*を指定する必要があります/);
      
      // 遷移先状態型がない
      const missingTarget = new TransitionDefinition({
        name: 'InvalidTransition',
        sourceStateType: 'Idle'
      });
      
      expect(() => missingTarget.validate()).toThrow(/遷移先状態の型.*を指定する必要があります/);
    });
    
    it('無効なガード条件型でエラーになる', () => {
      const invalidGuard = new TransitionDefinition({
        name: 'InvalidGuardTransition',
        sourceStateType: 'Idle',
        targetStateType: 'Moving',
        guardType: 'InvalidType' // 無効なガード条件型
      });
      
      expect(() => invalidGuard.validate()).toThrow(/ガード条件型.*は有効な論理型である必要があります/);
    });
  });
  
  describe('TransitionUsage', () => {
    it('基本プロパティを持つTransitionUsageを作成できる', () => {
      const transition = new TransitionUsage({
        name: 'idleToMoving',
        sourceStateId: 'state-idle',
        targetStateId: 'state-moving',
        guard: 'isReadyToMove == true',
        trigger: 'startButton',
        effect: 'startEngine()'
      });
      
      expect(transition.id).toBeDefined();
      expect(transition.name).toBe('idleToMoving');
      expect(transition.sourceStateId).toBe('state-idle');
      expect(transition.targetStateId).toBe('state-moving');
      expect(transition.guard).toBe('isReadyToMove == true');
      expect(transition.trigger).toBe('startButton');
      expect(transition.effect).toBe('startEngine()');
      expect(transition.isElse).toBe(false);
    });
    
    it('JSONシリアライズとデシリアライズが正しく動作する', () => {
      const original = new TransitionUsage({
        id: 'transition-1',
        name: 'idleToMoving',
        sourceStateId: 'state-idle',
        targetStateId: 'state-moving',
        guard: 'isReadyToMove == true',
        isElse: false
      });
      
      const json = original.toJSON();
      expect(json.__type).toBe('TransitionUsage');
      
      const restored = TransitionUsage.fromJSON(json);
      expect(restored.id).toBe(original.id);
      expect(restored.name).toBe(original.name);
      expect(restored.sourceStateId).toBe(original.sourceStateId);
      expect(restored.targetStateId).toBe(original.targetStateId);
      expect(restored.guard).toBe(original.guard);
      expect(restored.isElse).toBe(original.isElse);
    });
    
    it('必須プロパティが欠けていると検証でエラーになる', () => {
      // 遷移元状態IDがない
      const missingSource = new TransitionUsage({
        name: 'invalidTransition',
        targetStateId: 'state-moving'
      });
      
      expect(() => missingSource.validate()).toThrow(/遷移元状態.*を指定する必要があります/);
      
      // 遷移先状態IDがない
      const missingTarget = new TransitionUsage({
        name: 'invalidTransition',
        sourceStateId: 'state-idle'
      });
      
      expect(() => missingTarget.validate()).toThrow(/遷移先状態.*を指定する必要があります/);
    });
    
    it('else遷移はガード条件を持てない', () => {
      const invalidElse = new TransitionUsage({
        name: 'invalidElseTransition',
        sourceStateId: 'state-idle',
        targetStateId: 'state-error',
        guard: 'someCondition',
        isElse: true // elseなのにガード条件がある
      });
      
      expect(() => invalidElse.validate()).toThrow(/else遷移.*にはガード条件.*を指定できません/);
    });
    
    it('自己遷移にはトリガーかガード条件が必要', () => {
      const invalidSelfTransition = new TransitionUsage({
        name: 'invalidSelfTransition',
        sourceStateId: 'state-idle',
        targetStateId: 'state-idle' // 同じ状態への遷移
      });
      
      expect(() => invalidSelfTransition.validate()).toThrow(/自己遷移.*にはトリガー.*またはガード条件.*のいずれかが必要です/);
      
      // トリガーがあれば有効
      const validWithTrigger = new TransitionUsage({
        name: 'validSelfTransition',
        sourceStateId: 'state-idle',
        targetStateId: 'state-idle',
        trigger: 'reset'
      });
      
      expect(() => validWithTrigger.validate()).not.toThrow();
      
      // ガード条件があれば有効
      const validWithGuard = new TransitionUsage({
        name: 'validSelfTransition',
        sourceStateId: 'state-idle',
        targetStateId: 'state-idle',
        guard: 'needsReset'
      });
      
      expect(() => validWithGuard.validate()).not.toThrow();
    });
  });
  
  describe('状態マシン検証', () => {
    // テスト用の状態定義
    let states: StateDefinition[];
    let transitions: TransitionUsage[];
    
    beforeEach(() => {
      // 基本的な3状態マシン（初期、動作中、終了）を準備
      states = [
        new StateDefinition({
          id: 'state-initial',
          name: 'Initial',
          isInitial: true
        }),
        new StateDefinition({
          id: 'state-running',
          name: 'Running'
        }),
        new StateDefinition({
          id: 'state-final',
          name: 'Final'
        })
      ];
      
      // 基本的な遷移を準備
      transitions = [
        new TransitionUsage({
          id: 'trans-init-to-run',
          name: 'Initialize',
          sourceStateId: 'state-initial',
          targetStateId: 'state-running',
          trigger: 'start'
        }),
        new TransitionUsage({
          id: 'trans-run-to-final',
          name: 'Complete',
          sourceStateId: 'state-running',
          targetStateId: 'state-final',
          trigger: 'complete'
        })
      ];
    });
    
    it('初期状態がない場合にエラーになる', () => {
      // 初期状態フラグを外す
      states[0].isInitial = false;
      
      expect(() => validateInitialState(states, 'TestStateMachine')).toThrow(/初期状態が必要です/);
    });
    
    it('複数の初期状態があるとエラーになる', () => {
      // 2つめの状態も初期状態にする
      states[1].isInitial = true;
      
      expect(() => validateInitialState(states, 'TestStateMachine')).toThrow(/複数の初期状態.*が定義されています/);
    });
    
    it('遷移の整合性をチェックする', () => {
      // 不正な遷移先ID
      const invalidTransition = new TransitionUsage({
        id: 'trans-invalid',
        name: 'InvalidTransition',
        sourceStateId: 'state-running',
        targetStateId: 'state-nonexistent' // 存在しない状態ID
      });
      
      transitions.push(invalidTransition);
      
      // 状態マップを準備
      const stateMap: { [id: string]: StateDefinition } = {};
      states.forEach(state => { stateMap[state.id] = state; });
      
      expect(() => validateTransitions(transitions, stateMap, 'TestStateMachine'))
        .toThrow(/遷移先状態.*が見つかりません/);
    });
    
    it('到達不可能な状態を検出する', () => {
      // 遷移を削除して到達不可能な状態を作る
      transitions = [
        new TransitionUsage({
          id: 'trans-init-to-run',
          name: 'Initialize',
          sourceStateId: 'state-initial',
          targetStateId: 'state-running'
        })
        // state-finalへの遷移がなくなる
      ];
      
      const unreachable = findUnreachableStates(states, transitions, 'TestStateMachine');
      expect(unreachable).toHaveLength(1);
      expect(unreachable[0]).toBe('state-final');
      
      // 状態マシン全体の検証
      expect(() => validateStateMachine(states, transitions, 'TestStateMachine'))
        .toThrow(/到達不可能な状態.*が存在します/);
    });
    
    it('重複するデフォルト遷移をチェックする', () => {
      // 同じ遷移元から複数のデフォルト遷移（ガード条件なし）
      transitions = [
        new TransitionUsage({
          id: 'trans-init-to-run1',
          name: 'ToRunning1',
          sourceStateId: 'state-initial',
          targetStateId: 'state-running'
        }),
        new TransitionUsage({
          id: 'trans-init-to-run2',
          name: 'ToRunning2',
          sourceStateId: 'state-initial', // 同じ遷移元
          targetStateId: 'state-running'  // 同じ遷移先
        })
      ];
      
      expect(() => validateGuardConditions(transitions, 'TestStateMachine'))
        .toThrow(/複数のデフォルト遷移.*が存在します/);
    });
    
    it('複数のelse遷移をチェックする', () => {
      // 同じ遷移元から複数のelse遷移
      transitions = [
        new TransitionUsage({
          id: 'trans-run-to-final1',
          name: 'ToFinal1',
          sourceStateId: 'state-running',
          targetStateId: 'state-final',
          isElse: true
        }),
        new TransitionUsage({
          id: 'trans-run-to-final2',
          name: 'ToFinal2',
          sourceStateId: 'state-running', // 同じ遷移元
          targetStateId: 'state-final',   // 同じ遷移先
          isElse: true                   // 両方else
        })
      ];
      
      expect(() => validateGuardConditions(transitions, 'TestStateMachine'))
        .toThrow(/複数のelse遷移.*が存在します/);
    });
    
    it('有効な状態マシンは検証にパスする', () => {
      // 既存のstatesとtransitionsは有効な状態マシン
      expect(() => validateStateMachine(states, transitions, 'TestStateMachine')).not.toThrow();
    });
  });
});