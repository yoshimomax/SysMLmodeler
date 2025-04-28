/**
 * IfActionUsage クラスのテスト
 */

import { IfActionUsage } from '../../../src/model/sysml2/actions/IfActionUsage';
import { ValidationError } from '../../../src/model/sysml2/validator';
import { v4 as uuid } from 'uuid';

describe('IfActionUsage', () => {
  it('基本プロパティを持つIfActionUsageを作成できる', () => {
    const thenBranchId = uuid();
    const elseBranchId = uuid();
    
    const ifAction = new IfActionUsage({
      name: 'CheckTemperature',
      condition: 'temperature > 100',
      branches: [
        {
          id: thenBranchId,
          condition: 'temperature > 100',
          actions: ['action-1', 'action-2'],
          isElse: false
        },
        {
          id: elseBranchId,
          actions: ['action-3'],
          isElse: true
        }
      ]
    });
    
    expect(ifAction.id).toBeDefined();
    expect(ifAction.name).toBe('CheckTemperature');
    expect(ifAction.condition).toBe('temperature > 100');
    expect(ifAction.branches).toHaveLength(2);
    
    // then分岐の確認
    const thenBranch = ifAction.branches.find(b => b.id === thenBranchId);
    expect(thenBranch).toBeDefined();
    expect(thenBranch?.condition).toBe('temperature > 100');
    expect(thenBranch?.actions).toEqual(['action-1', 'action-2']);
    expect(thenBranch?.isElse).toBe(false);
    
    // else分岐の確認
    const elseBranch = ifAction.branches.find(b => b.id === elseBranchId);
    expect(elseBranch).toBeDefined();
    expect(elseBranch?.condition).toBeUndefined();
    expect(elseBranch?.actions).toEqual(['action-3']);
    expect(elseBranch?.isElse).toBe(true);
  });
  
  it('addBranchメソッドで分岐を追加できる', () => {
    const ifAction = new IfActionUsage({
      name: 'TestIf',
      condition: 'x > 0'
    });
    
    // then分岐を追加
    const thenBranchId = ifAction.addBranch({
      condition: 'x > 0',
      actions: ['action-1'],
      isElse: false
    });
    
    // else分岐を追加
    const elseBranchId = ifAction.addBranch({
      actions: ['action-2'],
      isElse: true
    });
    
    expect(ifAction.branches).toHaveLength(2);
    
    // 追加した分岐が存在するか確認
    const thenBranch = ifAction.branches.find(b => b.id === thenBranchId);
    expect(thenBranch).toBeDefined();
    expect(thenBranch?.condition).toBe('x > 0');
    
    const elseBranch = ifAction.branches.find(b => b.id === elseBranchId);
    expect(elseBranch).toBeDefined();
    expect(elseBranch?.isElse).toBe(true);
  });
  
  it('removeBranchメソッドで分岐を削除できる', () => {
    const branchId1 = uuid();
    const branchId2 = uuid();
    
    const ifAction = new IfActionUsage({
      name: 'TestIf',
      branches: [
        {
          id: branchId1,
          condition: 'x > 0',
          actions: ['action-1']
        },
        {
          id: branchId2,
          actions: ['action-2'],
          isElse: true
        }
      ]
    });
    
    // 分岐を削除
    const result = ifAction.removeBranch(branchId1);
    expect(result).toBe(true);
    expect(ifAction.branches).toHaveLength(1);
    expect(ifAction.branches[0].id).toBe(branchId2);
    
    // 存在しない分岐の削除
    const falseResult = ifAction.removeBranch('non-existent');
    expect(falseResult).toBe(false);
  });
  
  it('addActionToBranch/removeActionFromBranchメソッドが正しく動作する', () => {
    const branchId = uuid();
    const ifAction = new IfActionUsage({
      name: 'TestIf',
      branches: [
        {
          id: branchId,
          condition: 'x > 0',
          actions: ['action-1']
        }
      ]
    });
    
    // 分岐にアクションを追加
    const result = ifAction.addActionToBranch(branchId, 'action-2');
    expect(result).toBe(true);
    
    const branch = ifAction.branches.find(b => b.id === branchId);
    expect(branch?.actions).toContain('action-1');
    expect(branch?.actions).toContain('action-2');
    
    // 分岐からアクションを削除
    const removeResult = ifAction.removeActionFromBranch(branchId, 'action-1');
    expect(removeResult).toBe(true);
    
    const updatedBranch = ifAction.branches.find(b => b.id === branchId);
    expect(updatedBranch?.actions).not.toContain('action-1');
    expect(updatedBranch?.actions).toContain('action-2');
    
    // 存在しない分岐へのアクション追加
    const falseResult = ifAction.addActionToBranch('non-existent', 'action-3');
    expect(falseResult).toBe(false);
    
    // 存在しないアクションの削除
    const falseRemoveResult = ifAction.removeActionFromBranch(branchId, 'non-existent');
    expect(falseRemoveResult).toBe(false);
  });
  
  it('JSONシリアライズとデシリアライズが正しく動作する', () => {
    const branchId1 = uuid();
    const branchId2 = uuid();
    
    const original = new IfActionUsage({
      id: 'if-action-1',
      name: 'SerializeTest',
      condition: 'x > 0',
      branches: [
        {
          id: branchId1,
          condition: 'x > 10',
          actions: ['action-1', 'action-2']
        },
        {
          id: branchId2,
          actions: ['action-3'],
          isElse: true
        }
      ]
    });
    
    // JSONに変換
    const json = original.toJSON();
    
    // JSONから復元
    const restored = IfActionUsage.fromJSON(json);
    
    // 同じ内容であることを確認
    expect(restored.id).toBe(original.id);
    expect(restored.name).toBe(original.name);
    expect(restored.condition).toBe(original.condition);
    expect(restored.branches).toHaveLength(original.branches.length);
    
    // 各分岐の確認
    const restoredBranch1 = restored.branches.find(b => b.id === branchId1);
    expect(restoredBranch1).toBeDefined();
    expect(restoredBranch1?.condition).toBe('x > 10');
    expect(restoredBranch1?.actions).toEqual(['action-1', 'action-2']);
    
    const restoredBranch2 = restored.branches.find(b => b.id === branchId2);
    expect(restoredBranch2).toBeDefined();
    expect(restoredBranch2?.isElse).toBe(true);
    expect(restoredBranch2?.actions).toEqual(['action-3']);
  });
  
  it('分岐がないとvalidateでエラーになる', () => {
    const ifAction = new IfActionUsage({
      name: 'InvalidIf',
      condition: 'x > 0'
      // branchesを指定していない
    });
    
    expect(() => ifAction.validate()).toThrow(ValidationError);
    expect(() => ifAction.validate()).toThrow(/少なくとも1つの分岐/);
  });
  
  it('複数のelse分岐があるとvalidateでエラーになる', () => {
    const ifAction = new IfActionUsage({
      name: 'InvalidElseIf',
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
        },
        {
          id: uuid(),
          actions: ['action-3'],
          isElse: true // 2つ目のelse
        }
      ]
    });
    
    expect(() => ifAction.validate()).toThrow(ValidationError);
    expect(() => ifAction.validate()).toThrow(/最大1つのelse分岐/);
  });
  
  it('else以外の分岐に条件がないとvalidateでエラーになる', () => {
    const ifAction = new IfActionUsage({
      name: 'InvalidConditionIf',
      branches: [
        {
          id: uuid(),
          // conditionがない
          actions: ['action-1'],
          isElse: false
        }
      ]
    });
    
    expect(() => ifAction.validate()).toThrow(ValidationError);
    expect(() => ifAction.validate()).toThrow(/condition属性/);
  });
  
  it('分岐内にアクションがないとvalidateでエラーになる', () => {
    const ifAction = new IfActionUsage({
      name: 'InvalidActionsIf',
      branches: [
        {
          id: uuid(),
          condition: 'x > 0',
          actions: [] // 空のアクションリスト
        }
      ]
    });
    
    expect(() => ifAction.validate()).toThrow(ValidationError);
    expect(() => ifAction.validate()).toThrow(/少なくとも1つのアクション/);
  });
});