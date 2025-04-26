/**
 * ActionDefinition クラスのテスト
 */

import { ActionDefinition } from '../../../src/model/sysml2/ActionDefinition';
import { ValidationError } from '../../../src/model/sysml2/validator';

describe('ActionDefinition', () => {
  it('基本プロパティを持つActionDefinitionを作成できる', () => {
    const actionDef = new ActionDefinition({
      name: 'ProcessOrder',
      description: '注文処理アクション',
      isAbstract: false
    });
    
    expect(actionDef.id).toBeDefined();
    expect(actionDef.name).toBe('ProcessOrder');
    expect(actionDef.description).toBe('注文処理アクション');
    expect(actionDef.isAbstract).toBe(false);
    expect(actionDef.parameters).toEqual([]);
    expect(actionDef.bodies).toEqual([]);
    expect(actionDef.guardParams).toEqual([]);
    expect(actionDef.preconditions).toEqual([]);
    expect(actionDef.postconditions).toEqual([]);
    expect(actionDef.actionUsages).toEqual([]);
  });
  
  it('パラメータとボディを持つActionDefinitionを作成できる', () => {
    const paramId1 = 'param-1';
    const paramId2 = 'param-2';
    const bodyId = 'body-1';
    
    const actionDef = new ActionDefinition({
      name: 'ProcessOrderWithParams',
      parameters: [paramId1, paramId2],
      bodies: [bodyId]
    });
    
    expect(actionDef.parameters).toEqual([paramId1, paramId2]);
    expect(actionDef.bodies).toEqual([bodyId]);
  });
  
  it('事前条件と事後条件を持つActionDefinitionを作成できる', () => {
    const preCondId = 'precond-1';
    const postCondId = 'postcond-1';
    
    const actionDef = new ActionDefinition({
      name: 'SecureAction',
      preconditions: [preCondId],
      postconditions: [postCondId]
    });
    
    expect(actionDef.preconditions).toEqual([preCondId]);
    expect(actionDef.postconditions).toEqual([postCondId]);
  });
  
  it('addParameter/removeParameterメソッドが正しく動作する', () => {
    const actionDef = new ActionDefinition({ name: 'TestAction' });
    const paramId = 'param-1';
    
    // パラメータ追加
    actionDef.addParameter(paramId);
    expect(actionDef.parameters).toContain(paramId);
    
    // 同じパラメータを追加しても重複しない
    actionDef.addParameter(paramId);
    expect(actionDef.parameters.length).toBe(1);
    
    // パラメータ削除
    const result = actionDef.removeParameter(paramId);
    expect(result).toBe(true);
    expect(actionDef.parameters).not.toContain(paramId);
    
    // 存在しないパラメータの削除
    const falseResult = actionDef.removeParameter('non-existent');
    expect(falseResult).toBe(false);
  });
  
  it('addBody/removeBodyメソッドが正しく動作する', () => {
    const actionDef = new ActionDefinition({ name: 'TestAction' });
    const bodyId = 'body-1';
    
    // ボディ追加
    actionDef.addBody(bodyId);
    expect(actionDef.bodies).toContain(bodyId);
    
    // 同じボディを追加しても重複しない
    actionDef.addBody(bodyId);
    expect(actionDef.bodies.length).toBe(1);
    
    // ボディ削除
    const result = actionDef.removeBody(bodyId);
    expect(result).toBe(true);
    expect(actionDef.bodies).not.toContain(bodyId);
  });
  
  it('addGuardParam/removeGuardParamメソッドが正しく動作する', () => {
    const actionDef = new ActionDefinition({ name: 'TestAction' });
    const guardParamId = 'guard-param-1';
    
    // ガードパラメータ追加
    actionDef.addGuardParam(guardParamId);
    expect(actionDef.guardParams).toContain(guardParamId);
    
    // ガードパラメータ削除
    const result = actionDef.removeGuardParam(guardParamId);
    expect(result).toBe(true);
    expect(actionDef.guardParams).not.toContain(guardParamId);
  });
  
  it('addActionUsage/removeActionUsageメソッドが正しく動作する', () => {
    const actionDef = new ActionDefinition({ name: 'TestAction' });
    const actionUsageId = 'action-usage-1';
    
    // アクション使用追加
    actionDef.addActionUsage(actionUsageId);
    expect(actionDef.actionUsages).toContain(actionUsageId);
    
    // アクション使用削除
    const result = actionDef.removeActionUsage(actionUsageId);
    expect(result).toBe(true);
    expect(actionDef.actionUsages).not.toContain(actionUsageId);
  });
  
  it('JSONシリアライズとデシリアライズが正しく動作する', () => {
    const original = new ActionDefinition({
      id: 'action-def-1',
      name: 'SerializeTest',
      description: 'シリアライズテスト',
      isAbstract: true,
      parameters: ['param-1', 'param-2'],
      bodies: ['body-1'],
      guardParams: ['guard-1'],
      preconditions: ['pre-1'],
      postconditions: ['post-1']
    });
    
    // JSONに変換
    const json = original.toJSON();
    
    // JSONから復元
    const restored = ActionDefinition.fromJSON(json);
    
    // 同じ内容であることを確認
    expect(restored.id).toBe(original.id);
    expect(restored.name).toBe(original.name);
    expect(restored.description).toBe(original.description);
    expect(restored.isAbstract).toBe(original.isAbstract);
    expect(restored.parameters).toEqual(original.parameters);
    expect(restored.bodies).toEqual(original.bodies);
    expect(restored.guardParams).toEqual(original.guardParams);
    expect(restored.preconditions).toEqual(original.preconditions);
    expect(restored.postconditions).toEqual(original.postconditions);
  });
  
  it('名前がないとvalidateでエラーになる', () => {
    const actionDef = new ActionDefinition({
      id: 'invalid-action'
      // nameを指定していない
    });
    
    expect(() => actionDef.validate()).toThrow(ValidationError);
    expect(() => actionDef.validate()).toThrow(/nameプロパティ/);
  });
});