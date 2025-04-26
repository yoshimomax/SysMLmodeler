/**
 * アクション関連クラスの統合テスト
 * ActionDefinition、各種ActionUsage、ActionValidatorの統合テスト
 */

import { ActionDefinition } from '../../../src/model/sysml2/ActionDefinition';
import { ActionUsage } from '../../../src/model/sysml2/ActionUsage';
import { PerformActionUsage } from '../../../src/model/sysml2/actions/PerformActionUsage';
import { SendActionUsage } from '../../../src/model/sysml2/actions/SendActionUsage';
import { AcceptActionUsage } from '../../../src/model/sysml2/actions/AcceptActionUsage';
import { AssignmentActionUsage } from '../../../src/model/sysml2/actions/AssignmentActionUsage';
import { TerminateActionUsage } from '../../../src/model/sysml2/actions/TerminateActionUsage';
import { IfActionUsage } from '../../../src/model/sysml2/actions/IfActionUsage';
import { LoopActionUsage } from '../../../src/model/sysml2/actions/LoopActionUsage';
import { ActionValidator } from '../../../src/model/sysml2/validator/ActionValidator';
import { ValidationError } from '../../../src/model/sysml2/validator';
import { v4 as uuid } from 'uuid';

// モックレジストリ - アクション要素のインメモリストレージ
class MockRegistry {
  private actions: Map<string, ActionUsage> = new Map();
  private parameters: Map<string, any> = new Map();
  
  // アクションを登録
  registerAction(action: ActionUsage): void {
    this.actions.set(action.id, action);
  }
  
  // パラメータを登録
  registerParameter(id: string, param: any): void {
    this.parameters.set(id, param);
  }
  
  // アクションを取得
  getAction(id: string): ActionUsage | undefined {
    return this.actions.get(id);
  }
  
  // パラメータを取得
  getParameter(id: string): any | undefined {
    return this.parameters.get(id);
  }
  
  // 全アクションを取得
  getAllActions(): ActionUsage[] {
    return [...this.actions.values()];
  }
  
  // レジストリをクリア
  clear(): void {
    this.actions.clear();
    this.parameters.clear();
  }
}

describe('アクション統合テスト', () => {
  let registry: MockRegistry;
  
  beforeEach(() => {
    registry = new MockRegistry();
  });
  
  // 簡易的なアクション階層を作成するヘルパー関数
  function createSimpleActionHierarchy(): { mainAction: IfActionUsage, rootActions: ActionUsage[] } {
    // パラメータ
    const paramId1 = uuid();
    const paramId2 = uuid();
    registry.registerParameter(paramId1, { id: paramId1, name: 'input', type: 'String' });
    registry.registerParameter(paramId2, { id: paramId2, name: 'output', type: 'Boolean' });
    
    // アクション定義
    const processActionDef = new ActionDefinition({
      id: uuid(),
      name: 'ProcessAction',
      parameters: [paramId1, paramId2]
    });
    
    // 分岐内で使用するアクション
    const performAction = new PerformActionUsage({
      id: uuid(),
      name: 'ExecuteProcess',
      actionDefinition: processActionDef.id,
      parameters: [paramId1, paramId2]
    });
    registry.registerAction(performAction);
    
    const sendAction = new SendActionUsage({
      id: uuid(),
      name: 'SendResult',
      payload: paramId2,
      receiver: 'system'
    });
    registry.registerAction(sendAction);
    
    const terminateAction = new TerminateActionUsage({
      id: uuid(),
      name: 'EndProcess',
      scope: 'self'
    });
    registry.registerAction(terminateAction);
    
    // メインのIF分岐アクション
    const mainAction = new IfActionUsage({
      id: uuid(),
      name: 'MainDecision',
      branches: [
        {
          id: uuid(),
          condition: 'input.length > 0',
          actions: [performAction.id, sendAction.id]
        },
        {
          id: uuid(),
          actions: [terminateAction.id],
          isElse: true
        }
      ]
    });
    registry.registerAction(mainAction);
    
    // 全ルートアクション
    const rootActions = [mainAction];
    
    return { mainAction, rootActions };
  }
  
  it('基本的なアクション階層の検証が成功する', () => {
    const { rootActions } = createSimpleActionHierarchy();
    
    expect(() => {
      ActionValidator.validateActionHierarchy(
        rootActions,
        (id) => registry.getParameter(id),
        (id) => registry.getAction(id)
      );
    }).not.toThrow();
  });
  
  it('複雑なアクション階層の検証が成功する', () => {
    // パラメータ
    const countParam = uuid();
    registry.registerParameter(countParam, { id: countParam, name: 'count', type: 'Integer' });
    
    // ループ内のアクション
    const assignmentAction = new AssignmentActionUsage({
      id: uuid(),
      name: 'IncrementCount',
      target: countParam,
      expression: 'count + 1'
    });
    registry.registerAction(assignmentAction);
    
    const acceptAction = new AcceptActionUsage({
      id: uuid(),
      name: 'WaitForEvent',
      payloadType: 'Event',
      receiver: 'self',
      timeout: 1000
    });
    registry.registerAction(acceptAction);
    
    // ループアクション
    const loopAction = new LoopActionUsage({
      id: uuid(),
      name: 'ProcessLoop',
      loopType: 'while',
      condition: 'count < 10',
      bodyActions: [assignmentAction.id, acceptAction.id]
    });
    registry.registerAction(loopAction);
    
    // { mainAction, rootActions } で作成した階層に追加
    const { mainAction, rootActions } = createSimpleActionHierarchy();
    
    // メインアクションの分岐内にループを追加
    const branch = mainAction.branches[0];
    branch.actions.push(loopAction.id);
    
    // ループの後続アクションとしてメインIF分岐の2つめのアクションを設定
    const secondActionId = branch.actions[1]; // sendAction
    loopAction.addSuccession(secondActionId);
    
    expect(() => {
      ActionValidator.validateActionHierarchy(
        rootActions,
        (id) => registry.getParameter(id),
        (id) => registry.getAction(id)
      );
    }).not.toThrow();
  });
  
  it('パラメータがないと検証でエラーになる', () => {
    const { rootActions } = createSimpleActionHierarchy();
    
    // パラメータを空にする
    registry.clear();
    // アクションだけ再登録
    rootActions.forEach(action => registry.registerAction(action));
    
    expect(() => {
      ActionValidator.validateActionHierarchy(
        rootActions,
        (id) => registry.getParameter(id),
        (id) => registry.getAction(id)
      );
    }).toThrow(ValidationError);
  });
  
  it('参照先アクションがないと検証でエラーになる', () => {
    const { rootActions } = createSimpleActionHierarchy();
    
    // 特定のアクションを削除
    const mainAction = rootActions[0] as IfActionUsage;
    const missingActionId = mainAction.branches[0].actions[0];
    registry.clear();
    
    // メインアクションだけ再登録（参照されるアクションは登録しない）
    registry.registerAction(mainAction);
    
    expect(() => {
      ActionValidator.validateActionHierarchy(
        rootActions,
        (id) => registry.getParameter(id),
        (id) => registry.getAction(id)
      );
    }).toThrow(ValidationError);
    
    expect(() => {
      ActionValidator.validateActionHierarchy(
        rootActions,
        (id) => registry.getParameter(id),
        (id) => registry.getAction(id)
      );
    }).toThrow(new RegExp(`action-1.*が見つかりません`));
  });
  
  it('重複するガード条件があると検証でエラーになる', () => {
    const { mainAction, rootActions } = createSimpleActionHierarchy();
    
    // 同一条件の分岐を追加
    mainAction.addBranch({
      condition: 'input.length > 0', // 既存の分岐と同じ条件
      actions: [uuid()],
      isElse: false
    });
    
    expect(() => {
      ActionValidator.validateActionHierarchy(
        rootActions,
        (id) => registry.getParameter(id),
        (id) => registry.getAction(id)
      );
    }).toThrow(ValidationError);
    
    expect(() => {
      ActionValidator.validateActionHierarchy(
        rootActions,
        (id) => registry.getParameter(id),
        (id) => registry.getAction(id)
      );
    }).toThrow(/重複するガード条件/);
  });
  
  it('JSONシリアライズとデシリアライズでアクション階層が保持される', () => {
    const { mainAction, rootActions } = createSimpleActionHierarchy();
    
    // JSONに変換
    const json = mainAction.toJSON();
    
    // JSONから復元
    const restored = IfActionUsage.fromJSON(json);
    
    // 基本プロパティ
    expect(restored.id).toBe(mainAction.id);
    expect(restored.name).toBe(mainAction.name);
    
    // 分岐の数
    expect(restored.branches.length).toBe(mainAction.branches.length);
    
    // 各分岐の内容
    for (let i = 0; i < mainAction.branches.length; i++) {
      const originalBranch = mainAction.branches[i];
      const restoredBranch = restored.branches.find(b => b.id === originalBranch.id);
      
      expect(restoredBranch).toBeDefined();
      expect(restoredBranch?.condition).toBe(originalBranch.condition);
      expect(restoredBranch?.isElse).toBe(originalBranch.isElse);
      expect(restoredBranch?.actions).toEqual(originalBranch.actions);
    }
    
    // 復元したアクションを使った検証が成功する
    registry.registerAction(restored);
    
    expect(() => {
      ActionValidator.validateAction(
        restored,
        (id) => registry.getParameter(id),
        (id) => registry.getAction(id)
      );
    }).not.toThrow();
  });
  
  it('各アクション種別が正しくシリアライズ・デシリアライズされる', () => {
    // 各種アクションのインスタンスを作成
    const actionTypes = [
      new PerformActionUsage({
        id: uuid(),
        name: 'TestPerform',
        target: 'target-1',
        isParallel: true
      }),
      new SendActionUsage({
        id: uuid(),
        name: 'TestSend',
        payload: 'payload-1',
        receiver: 'receiver-1'
      }),
      new AcceptActionUsage({
        id: uuid(),
        name: 'TestAccept',
        payloadType: 'Event',
        receiver: 'self',
        isTriggered: true
      }),
      new AssignmentActionUsage({
        id: uuid(),
        name: 'TestAssignment',
        target: 'var-1',
        value: '42'
      }),
      new TerminateActionUsage({
        id: uuid(),
        name: 'TestTerminate',
        scope: 'all'
      }),
      new IfActionUsage({
        id: uuid(),
        name: 'TestIf',
        branches: [
          {
            id: uuid(),
            condition: 'x > 0',
            actions: ['action-1']
          }
        ]
      }),
      new LoopActionUsage({
        id: uuid(),
        name: 'TestLoop',
        loopType: 'forEach',
        collection: 'items',
        iteratorName: 'item',
        bodyActions: ['action-2']
      })
    ];
    
    // 各アクションタイプを登録
    actionTypes.forEach(action => registry.registerAction(action));
    
    // 各アクションタイプでシリアライズとデシリアライズをテスト
    for (const original of actionTypes) {
      // JSONに変換
      const json = original.toJSON();
      
      // フィールドが保持されていることを確認
      expect(json.__type).toBe(original.__type);
      expect(json.id).toBe(original.id);
      expect(json.name).toBe(original.name);
      
      // JSONから復元
      let restored: ActionUsage;
      
      switch (original.__type) {
        case 'PerformActionUsage':
          restored = PerformActionUsage.fromJSON(json as any);
          break;
        case 'SendActionUsage':
          restored = SendActionUsage.fromJSON(json as any);
          break;
        case 'AcceptActionUsage':
          restored = AcceptActionUsage.fromJSON(json as any);
          break;
        case 'AssignmentActionUsage':
          restored = AssignmentActionUsage.fromJSON(json as any);
          break;
        case 'TerminateActionUsage':
          restored = TerminateActionUsage.fromJSON(json as any);
          break;
        case 'IfActionUsage':
          restored = IfActionUsage.fromJSON(json as any);
          break;
        case 'LoopActionUsage':
          restored = LoopActionUsage.fromJSON(json as any);
          break;
        default:
          restored = ActionUsage.fromJSON(json);
      }
      
      // 復元したオブジェクトの検証
      expect(restored.id).toBe(original.id);
      expect(restored.name).toBe(original.name);
      expect(restored.__type).toBe(original.__type);
      
      // ActionValidatorによる検証
      registry.registerAction(restored);
      
      expect(() => {
        ActionValidator.validateAction(
          restored,
          (id) => registry.getParameter(id),
          (id) => registry.getAction(id)
        );
      }).not.toThrow();
    }
  });
});