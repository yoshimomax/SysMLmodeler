/**
 * ActionValidator クラスのテスト
 */

import { ActionUsage } from '../../../src/model/sysml2/ActionUsage';
import { IfActionUsage } from '../../../src/model/sysml2/actions/IfActionUsage';
import { LoopActionUsage } from '../../../src/model/sysml2/actions/LoopActionUsage';
import { ActionValidator } from '../../../src/model/sysml2/validator/ActionValidator';
import { ValidationError } from '../../../src/model/sysml2/validator';
import { v4 as uuid } from 'uuid';

describe('ActionValidator', () => {
  describe('validateParameters', () => {
    it('パラメータが存在しない場合は成功する', () => {
      const action = new ActionUsage({ name: 'TestAction' });
      
      // パラメータがないので、常に失敗するgetParameterでも成功する
      const getParameter = () => undefined;
      
      expect(() => {
        ActionValidator.validateParameters(action, getParameter);
      }).not.toThrow();
    });
    
    it('全てのパラメータが存在する場合は成功する', () => {
      const paramId1 = 'param-1';
      const paramId2 = 'param-2';
      
      const action = new ActionUsage({
        name: 'TestAction',
        parameters: [paramId1, paramId2]
      });
      
      // パラメータが存在する
      const getParameter = (id: string) => ({ id });
      
      expect(() => {
        ActionValidator.validateParameters(action, getParameter);
      }).not.toThrow();
    });
    
    it('パラメータが見つからない場合はエラーになる', () => {
      const paramId1 = 'param-1';
      const paramId2 = 'param-2'; // この存在しないパラメータがエラーになる
      
      const action = new ActionUsage({
        name: 'TestAction',
        parameters: [paramId1, paramId2]
      });
      
      // param-1のみ存在する
      const getParameter = (id: string) => id === paramId1 ? { id } : undefined;
      
      expect(() => {
        ActionValidator.validateParameters(action, getParameter);
      }).toThrow(ValidationError);
      
      expect(() => {
        ActionValidator.validateParameters(action, getParameter);
      }).toThrow(/パラメータ.*が見つかりません/);
    });
  });
  
  describe('validateIfGuardExclusivity', () => {
    it('分岐が1つのみの場合は成功する', () => {
      const ifAction = new IfActionUsage({
        name: 'TestIf',
        branches: [
          {
            id: uuid(),
            condition: 'x > 0',
            actions: ['action-1']
          }
        ]
      });
      
      expect(() => {
        ActionValidator.validateIfGuardExclusivity(ifAction);
      }).not.toThrow();
    });
    
    it('分岐が複数で条件が異なる場合は成功する', () => {
      const ifAction = new IfActionUsage({
        name: 'TestIf',
        branches: [
          {
            id: uuid(),
            condition: 'x > 0',
            actions: ['action-1']
          },
          {
            id: uuid(),
            condition: 'x < 0',
            actions: ['action-2']
          },
          {
            id: uuid(),
            actions: ['action-3'],
            isElse: true
          }
        ]
      });
      
      expect(() => {
        ActionValidator.validateIfGuardExclusivity(ifAction);
      }).not.toThrow();
    });
    
    it('分岐に重複する条件がある場合はエラーになる', () => {
      const ifAction = new IfActionUsage({
        name: 'TestIf',
        branches: [
          {
            id: uuid(),
            condition: 'x > 0', // 重複する条件
            actions: ['action-1']
          },
          {
            id: uuid(),
            condition: 'x > 0', // 重複する条件
            actions: ['action-2']
          }
        ]
      });
      
      expect(() => {
        ActionValidator.validateIfGuardExclusivity(ifAction);
      }).toThrow(ValidationError);
      
      expect(() => {
        ActionValidator.validateIfGuardExclusivity(ifAction);
      }).toThrow(/重複するガード条件/);
    });
  });
  
  describe('validateSuccessions', () => {
    it('後続関係がない場合は成功する', () => {
      const action = new ActionUsage({ name: 'TestAction' });
      
      // 常に失敗するgetActionでも成功する
      const getAction = () => undefined;
      
      expect(() => {
        ActionValidator.validateSuccessions(action, getAction);
      }).not.toThrow();
    });
    
    it('全ての後続アクションが存在する場合は成功する', () => {
      const succId1 = 'succ-1';
      const succId2 = 'succ-2';
      
      const action = new ActionUsage({
        name: 'TestAction',
        successions: [succId1, succId2]
      });
      
      // 後続アクションが存在する
      const getAction = (id: string) => new ActionUsage({ id, name: `Action-${id}` });
      
      expect(() => {
        ActionValidator.validateSuccessions(action, getAction);
      }).not.toThrow();
    });
    
    it('後続アクションが見つからない場合はエラーになる', () => {
      const succId1 = 'succ-1';
      const succId2 = 'succ-2'; // この存在しないアクションがエラーになる
      
      const action = new ActionUsage({
        name: 'TestAction',
        successions: [succId1, succId2]
      });
      
      // succ-1のみ存在する
      const getAction = (id: string) => id === succId1 ? new ActionUsage({ id, name: `Action-${id}` }) : undefined;
      
      expect(() => {
        ActionValidator.validateSuccessions(action, getAction);
      }).toThrow(ValidationError);
      
      expect(() => {
        ActionValidator.validateSuccessions(action, getAction);
      }).toThrow(/後続アクション.*が見つかりません/);
    });
  });
  
  describe('validateLoopMultiplicity', () => {
    it('シリアルループは常に成功する', () => {
      const loopAction = new LoopActionUsage({
        name: 'TestLoop',
        loopType: 'while',
        condition: 'x > 0',
        bodyActions: ['action-1'],
        isParallel: false
      });
      
      // 常に失敗するgetActionでも成功する
      const getAction = () => undefined;
      
      expect(() => {
        ActionValidator.validateLoopMultiplicity(loopAction, getAction);
      }).not.toThrow();
    });
    
    it('パラレルループで全てのボディアクションが存在する場合は成功する', () => {
      const actionId1 = 'action-1';
      const actionId2 = 'action-2';
      
      const loopAction = new LoopActionUsage({
        name: 'TestLoop',
        loopType: 'while',
        condition: 'x > 0',
        bodyActions: [actionId1, actionId2],
        isParallel: true
      });
      
      // ボディアクションが存在する
      const getAction = (id: string) => new ActionUsage({ id, name: `Action-${id}` });
      
      expect(() => {
        ActionValidator.validateLoopMultiplicity(loopAction, getAction);
      }).not.toThrow();
    });
    
    it('パラレルループでボディアクションが見つからない場合はエラーになる', () => {
      const actionId1 = 'action-1';
      const actionId2 = 'action-2'; // この存在しないアクションがエラーになる
      
      const loopAction = new LoopActionUsage({
        name: 'TestLoop',
        loopType: 'while',
        condition: 'x > 0',
        bodyActions: [actionId1, actionId2],
        isParallel: true
      });
      
      // action-1のみ存在する
      const getAction = (id: string) => id === actionId1 ? new ActionUsage({ id, name: `Action-${id}` }) : undefined;
      
      expect(() => {
        ActionValidator.validateLoopMultiplicity(loopAction, getAction);
      }).toThrow(ValidationError);
      
      expect(() => {
        ActionValidator.validateLoopMultiplicity(loopAction, getAction);
      }).toThrow(/bodyAction.*が見つかりません/);
    });
  });
  
  describe('validateAction', () => {
    it('ベーシックアクションの検証が成功する', () => {
      const action = new ActionUsage({
        name: 'TestAction'
      });
      
      // パラメータとアクションが存在する
      const getParameter = (id: string) => ({ id });
      const getAction = (id: string) => new ActionUsage({ id, name: `Action-${id}` });
      
      expect(() => {
        ActionValidator.validateAction(action, getParameter, getAction);
      }).not.toThrow();
    });
    
    it('IF分岐アクションの検証が成功する', () => {
      const ifAction = new IfActionUsage({
        name: 'TestIf',
        branches: [
          {
            id: uuid(),
            condition: 'x > 0',
            actions: ['action-1']
          },
          {
            id: uuid(),
            actions: ['action-2'],
            isElse: true
          }
        ]
      });
      
      // パラメータとアクションが存在する
      const getParameter = (id: string) => ({ id });
      const getAction = (id: string) => new ActionUsage({ id, name: `Action-${id}` });
      
      expect(() => {
        ActionValidator.validateAction(ifAction, getParameter, getAction);
      }).not.toThrow();
    });
    
    it('ループアクションの検証が成功する', () => {
      const loopAction = new LoopActionUsage({
        name: 'TestLoop',
        loopType: 'while',
        condition: 'x > 0',
        bodyActions: ['action-1']
      });
      
      // パラメータとアクションが存在する
      const getParameter = (id: string) => ({ id });
      const getAction = (id: string) => new ActionUsage({ id, name: `Action-${id}` });
      
      expect(() => {
        ActionValidator.validateAction(loopAction, getParameter, getAction);
      }).not.toThrow();
    });
  });
  
  describe('validateActionHierarchy', () => {
    it('単一アクションの階層検証が成功する', () => {
      const rootAction = new ActionUsage({
        name: 'RootAction'
      });
      
      // パラメータとアクションが存在する
      const getParameter = (id: string) => ({ id });
      const getAction = (id: string) => new ActionUsage({ id, name: `Action-${id}` });
      
      expect(() => {
        ActionValidator.validateActionHierarchy([rootAction], getParameter, getAction);
      }).not.toThrow();
    });
    
    it('複数アクションの階層検証が成功する', () => {
      const rootAction1 = new ActionUsage({
        name: 'RootAction1'
      });
      
      const rootAction2 = new IfActionUsage({
        name: 'RootAction2',
        branches: [
          {
            id: uuid(),
            condition: 'x > 0',
            actions: ['action-1']
          }
        ]
      });
      
      // パラメータとアクションが存在する
      const getParameter = (id: string) => ({ id });
      const getAction = (id: string) => new ActionUsage({ id, name: `Action-${id}` });
      
      expect(() => {
        ActionValidator.validateActionHierarchy([rootAction1, rootAction2], getParameter, getAction);
      }).not.toThrow();
    });
  });
});