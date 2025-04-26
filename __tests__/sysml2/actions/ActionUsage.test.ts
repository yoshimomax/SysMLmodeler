/**
 * ActionUsage クラスのテスト
 */

import { ActionUsage } from '../../../src/model/sysml2/ActionUsage';
import { ValidationError } from '../../../src/model/sysml2/validator';

describe('ActionUsage', () => {
  it('基本プロパティを持つActionUsageを作成できる', () => {
    const action = new ActionUsage({
      name: 'ProcessOrderAction',
      description: '注文処理アクションの使用例',
      actionDefinition: 'action-def-1'
    });
    
    expect(action.id).toBeDefined();
    expect(action.name).toBe('ProcessOrderAction');
    expect(action.description).toBe('注文処理アクションの使用例');
    expect(action.actionDefinition).toBe('action-def-1');
    expect(action.isReference).toBe(false);
    expect(action.parameters).toEqual([]);
    expect(action.bodies).toEqual([]);
    expect(action.guard).toBeUndefined();
    expect(action.successions).toEqual([]);
    expect(action.preconditions).toEqual([]);
    expect(action.postconditions).toEqual([]);
  });
  
  it('参照型のActionUsageを作成できる', () => {
    const action = new ActionUsage({
      name: 'ReferenceAction',
      actionDefinition: 'action-def-2',
      isReference: true
    });
    
    expect(action.isReference).toBe(true);
    expect(action.actionDefinition).toBe('action-def-2');
  });
  
  it('ガード条件を持つActionUsageを作成できる', () => {
    const action = new ActionUsage({
      name: 'GuardedAction',
      guard: 'temperature > 100'
    });
    
    expect(action.guard).toBe('temperature > 100');
  });
  
  it('後続アクションを持つActionUsageを作成できる', () => {
    const nextActionId1 = 'next-action-1';
    const nextActionId2 = 'next-action-2';
    
    const action = new ActionUsage({
      name: 'SequencedAction',
      successions: [nextActionId1, nextActionId2]
    });
    
    expect(action.successions).toEqual([nextActionId1, nextActionId2]);
  });
  
  it('addParameter/removeParameterメソッドが正しく動作する', () => {
    const action = new ActionUsage({ name: 'TestAction' });
    const paramId = 'param-1';
    
    // パラメータ追加
    action.addParameter(paramId);
    expect(action.parameters).toContain(paramId);
    
    // 同じパラメータを追加しても重複しない
    action.addParameter(paramId);
    expect(action.parameters.length).toBe(1);
    
    // パラメータ削除
    const result = action.removeParameter(paramId);
    expect(result).toBe(true);
    expect(action.parameters).not.toContain(paramId);
    
    // 存在しないパラメータの削除
    const falseResult = action.removeParameter('non-existent');
    expect(falseResult).toBe(false);
  });
  
  it('addBody/removeBodyメソッドが正しく動作する', () => {
    const action = new ActionUsage({ name: 'TestAction' });
    const bodyId = 'body-1';
    
    // ボディ追加
    action.addBody(bodyId);
    expect(action.bodies).toContain(bodyId);
    
    // 同じボディを追加しても重複しない
    action.addBody(bodyId);
    expect(action.bodies.length).toBe(1);
    
    // ボディ削除
    const result = action.removeBody(bodyId);
    expect(result).toBe(true);
    expect(action.bodies).not.toContain(bodyId);
  });
  
  it('addSuccession/removeSuccessionメソッドが正しく動作する', () => {
    const action = new ActionUsage({ name: 'TestAction' });
    const nextActionId = 'next-action-1';
    
    // 後続アクション追加
    action.addSuccession(nextActionId);
    expect(action.successions).toContain(nextActionId);
    
    // 同じ後続アクションを追加しても重複しない
    action.addSuccession(nextActionId);
    expect(action.successions.length).toBe(1);
    
    // 後続アクション削除
    const result = action.removeSuccession(nextActionId);
    expect(result).toBe(true);
    expect(action.successions).not.toContain(nextActionId);
  });
  
  it('事前条件と事後条件の操作メソッドが正しく動作する', () => {
    const action = new ActionUsage({ name: 'TestAction' });
    const preCondId = 'precond-1';
    const postCondId = 'postcond-1';
    
    // 事前条件追加
    action.addPrecondition(preCondId);
    expect(action.preconditions).toContain(preCondId);
    
    // 事後条件追加
    action.addPostcondition(postCondId);
    expect(action.postconditions).toContain(postCondId);
    
    // 事前条件削除
    let result = action.removePrecondition(preCondId);
    expect(result).toBe(true);
    expect(action.preconditions).not.toContain(preCondId);
    
    // 事後条件削除
    result = action.removePostcondition(postCondId);
    expect(result).toBe(true);
    expect(action.postconditions).not.toContain(postCondId);
  });
  
  it('JSONシリアライズとデシリアライズが正しく動作する', () => {
    const original = new ActionUsage({
      id: 'action-usage-1',
      name: 'SerializeTest',
      description: 'シリアライズテスト',
      actionDefinition: 'action-def-1',
      isReference: true,
      parameters: ['param-1', 'param-2'],
      bodies: ['body-1'],
      guard: 'status == "ready"',
      successions: ['next-1', 'next-2'],
      preconditions: ['pre-1'],
      postconditions: ['post-1']
    });
    
    // JSONに変換
    const json = original.toJSON();
    
    // JSONから復元
    const restored = ActionUsage.fromJSON(json);
    
    // 同じ内容であることを確認
    expect(restored.id).toBe(original.id);
    expect(restored.name).toBe(original.name);
    expect(restored.description).toBe(original.description);
    expect(restored.actionDefinition).toBe(original.actionDefinition);
    expect(restored.isReference).toBe(original.isReference);
    expect(restored.parameters).toEqual(original.parameters);
    expect(restored.bodies).toEqual(original.bodies);
    expect(restored.guard).toBe(original.guard);
    expect(restored.successions).toEqual(original.successions);
    expect(restored.preconditions).toEqual(original.preconditions);
    expect(restored.postconditions).toEqual(original.postconditions);
  });
  
  it('名前がないとvalidateでエラーになる', () => {
    const action = new ActionUsage({
      id: 'invalid-action'
      // nameを指定していない
    });
    
    expect(() => action.validate()).toThrow(ValidationError);
    expect(() => action.validate()).toThrow(/nameプロパティ/);
  });
  
  it('参照型で定義が指定されていないとvalidateでエラーになる', () => {
    const action = new ActionUsage({
      name: 'InvalidReferenceAction',
      isReference: true
      // actionDefinitionを指定していない
    });
    
    expect(() => action.validate()).toThrow(ValidationError);
    expect(() => action.validate()).toThrow(/actionDefinition/);
  });
});