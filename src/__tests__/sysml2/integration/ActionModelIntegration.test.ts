/**
 * ActionDefinition/ActionUsage クラスと既存モデルの統合テスト
 * 
 * このテストは、SysML v2 Beta3仕様に準拠して実装したアクション関連クラスが
 * 既存のモデル要素と適切に連携できることを検証します。
 */

import { v4 as uuid } from 'uuid';

// SysML v2 定義クラス
import { BlockDefinition } from '../../../src/model/sysml2/BlockDefinition';
import { PartDefinition } from '../../../src/model/sysml2/PartDefinition';
import { AttributeDefinition } from '../../../src/model/sysml2/AttributeDefinition';
import { PortDefinition } from '../../../src/model/sysml2/PortDefinition';

// アクション関連クラス
import { ActionDefinition } from '../../../src/model/sysml2/ActionDefinition';
import { ActionUsage } from '../../../src/model/sysml2/ActionUsage';
import { PerformActionUsage } from '../../../src/model/sysml2/actions/PerformActionUsage';
import { IfActionUsage } from '../../../src/model/sysml2/actions/IfActionUsage';
import { LoopActionUsage } from '../../../src/model/sysml2/actions/LoopActionUsage';

// バリデータ
import { ActionValidator } from '../../../src/model/sysml2/validator/ActionValidator';

describe('Action Model Integration Tests', () => {
  describe('アクションとブロック/パートの統合', () => {
    /**
     * テスト用のモデル要素を作成
     * - パート定義：センサーシステム
     * - アクション定義：データ処理アクション
     * - アクション使用：データ収集・処理・表示のフロー
     */
    let sensorSystem: PartDefinition;
    let dataProcessAction: ActionDefinition;
    let dataCollectAction: ActionUsage;
    let displayAction: ActionUsage;
    let decisionAction: IfActionUsage;
    
    beforeEach(() => {
      // センサーシステムの作成（パート定義）
      sensorSystem = new PartDefinition({
        id: uuid(),
        name: 'SensorSystem',
        attributes: [
          new AttributeDefinition({
            id: uuid(),
            name: 'sensorType',
            typeName: 'String'
          }),
          new AttributeDefinition({
            id: uuid(),
            name: 'samplingRate',
            typeName: 'Integer'
          })
        ],
        ports: [
          new PortDefinition({
            id: uuid(),
            name: 'dataInput',
            typeName: 'DataFlow',
            direction: 'in'
          }),
          new PortDefinition({
            id: uuid(),
            name: 'dataOutput',
            typeName: 'DataFlow',
            direction: 'out'
          })
        ]
      });
      
      // データ処理アクション定義
      dataProcessAction = new ActionDefinition({
        id: uuid(),
        name: 'ProcessData',
        parameters: [
          uuid(), // input パラメータID
          uuid()  // output パラメータID
        ]
      });
      
      // データ収集アクション使用
      dataCollectAction = new ActionUsage({
        id: uuid(),
        name: 'CollectData'
      });
      
      // 表示アクション使用
      displayAction = new ActionUsage({
        id: uuid(),
        name: 'DisplayResults'
      });
      
      // 条件分岐アクション
      decisionAction = new IfActionUsage({
        id: uuid(),
        name: 'EvaluateData',
        branches: [
          {
            id: uuid(),
            condition: 'data.quality > 0.8',
            actions: [displayAction.id],
            isElse: false
          },
          {
            id: uuid(),
            actions: [dataCollectAction.id], // 低品質なら再収集
            isElse: true
          }
        ]
      });
      
      // アクション間の関係を設定
      dataCollectAction.addSuccession(decisionAction.id);
    });
    
    test('パート定義にアクション定義を関連付ける', () => {
      // センサーシステムにデータ処理アクションを関連付け
      const actionFeatureId = dataProcessAction.id;
      sensorSystem.addFeature(actionFeatureId);
      
      // 検証
      expect(sensorSystem.ownedFeatures).toContain(actionFeatureId);
      
      // 双方向関連付けの確認も可能（実際の実装に応じて）
      // expect(dataProcessAction.ownerId).toBe(sensorSystem.id);
    });
    
    test('パート定義とアクション使用の関連', () => {
      // アクション使用を特定のパートの機能として関連付ける
      const actionUsageFeatureId = dataCollectAction.id;
      sensorSystem.addFeature(actionUsageFeatureId);
      
      // パート定義に対する動作検証
      expect(sensorSystem.ownedFeatures).toContain(actionUsageFeatureId);
      
      // 意味的整合性検証（オプショナル）
      // 本来のSysML v2では型の互換性などがチェックされる
    });
    
    test('シリアライズ・デシリアライズの整合性', () => {
      // シリアライズ
      const systemJson = sensorSystem.toJSON();
      const actionDefJson = dataProcessAction.toJSON();
      const actionUsageJson = dataCollectAction.toJSON();
      const decisionJson = decisionAction.toJSON();
      
      // デシリアライズ
      const restoredSystem = PartDefinition.fromJSON(systemJson);
      const restoredActionDef = ActionDefinition.fromJSON(actionDefJson);
      const restoredActionUsage = ActionUsage.fromJSON(actionUsageJson);
      const restoredDecision = IfActionUsage.fromJSON(decisionJson);
      
      // 検証 - パート定義
      expect(restoredSystem.id).toBe(sensorSystem.id);
      expect(restoredSystem.name).toBe(sensorSystem.name);
      expect(restoredSystem.attributes.length).toBe(sensorSystem.attributes.length);
      expect(restoredSystem.ports.length).toBe(sensorSystem.ports.length);
      
      // 検証 - アクション定義
      expect(restoredActionDef.id).toBe(dataProcessAction.id);
      expect(restoredActionDef.name).toBe(dataProcessAction.name);
      expect(restoredActionDef.parameters).toEqual(dataProcessAction.parameters);
      
      // 検証 - アクション使用
      expect(restoredActionUsage.id).toBe(dataCollectAction.id);
      expect(restoredActionUsage.name).toBe(dataCollectAction.name);
      expect(restoredActionUsage.successions).toEqual(dataCollectAction.successions);
      
      // 検証 - 分岐アクション
      expect(restoredDecision.id).toBe(decisionAction.id);
      expect(restoredDecision.name).toBe(decisionAction.name);
      expect(restoredDecision.branches.length).toBe(decisionAction.branches.length);
      
      // 重要な部分 - 分岐の条件と参照する後続アクションの整合性
      const origBranch = decisionAction.branches[0];
      const restoredBranch = restoredDecision.branches.find(b => b.id === origBranch.id);
      expect(restoredBranch).toBeDefined();
      expect(restoredBranch?.condition).toBe(origBranch.condition);
      expect(restoredBranch?.actions).toEqual(origBranch.actions);
    });
  });
  
  describe('アクション階層の検証', () => {
    // モックのレジストリ
    const modelRegistry = {
      actions: new Map<string, ActionUsage>(),
      params: new Map<string, any>(),
      
      getAction(id: string): ActionUsage | undefined {
        return this.actions.get(id);
      },
      
      getParameter(id: string): any | undefined {
        return this.params.get(id);
      },
      
      registerAction(action: ActionUsage): void {
        this.actions.set(action.id, action);
      },
      
      registerParameter(id: string, param: any): void {
        this.params.set(id, param);
      },
      
      clear(): void {
        this.actions.clear();
        this.params.clear();
      }
    };
    
    beforeEach(() => {
      modelRegistry.clear();
    });
    
    test('アクション階層と行動フローの検証', () => {
      // パラメータ
      const inputParam = { id: uuid(), name: 'input', type: 'DataPacket' };
      const outputParam = { id: uuid(), name: 'output', type: 'ProcessedData' };
      modelRegistry.registerParameter(inputParam.id, inputParam);
      modelRegistry.registerParameter(outputParam.id, outputParam);
      
      // 階層的なアクション構造を作成
      const collectAction = new ActionUsage({
        id: uuid(),
        name: 'CollectData',
        parameters: [inputParam.id]
      });
      
      const processAction = new ActionUsage({
        id: uuid(),
        name: 'ProcessData',
        parameters: [inputParam.id, outputParam.id]
      });
      
      const displayAction = new ActionUsage({
        id: uuid(),
        name: 'DisplayResults',
        parameters: [outputParam.id]
      });
      
      // アクション間の後続関係を設定
      collectAction.addSuccession(processAction.id);
      processAction.addSuccession(displayAction.id);
      
      // レジストリに登録
      modelRegistry.registerAction(collectAction);
      modelRegistry.registerAction(processAction);
      modelRegistry.registerAction(displayAction);
      
      // アクション階層の検証
      expect(() => {
        ActionValidator.validateActionHierarchy(
          [collectAction], // ルートアクション
          id => modelRegistry.getParameter(id),
          id => modelRegistry.getAction(id)
        );
      }).not.toThrow();
      
      // 後続関係の検証
      expect(collectAction.successions).toContain(processAction.id);
      expect(processAction.successions).toContain(displayAction.id);
    });
    
    test('ActionValidator でアクション間の参照の問題を検出できる', () => {
      // 存在しないアクションへの参照がある場合
      const invalidAction = new ActionUsage({
        id: uuid(),
        name: 'InvalidAction',
        successions: [uuid()] // 存在しないIDを指定
      });
      
      modelRegistry.registerAction(invalidAction);
      
      // 検証でエラーになることを確認
      expect(() => {
        ActionValidator.validateActionHierarchy(
          [invalidAction],
          id => modelRegistry.getParameter(id),
          id => modelRegistry.getAction(id)
        );
      }).toThrow(/(後続アクション|存在しない|見つかりません)/);
    });
    
    test('Loop/Perform アクション間の連携', () => {
      // Body ActionとなるActionUsageを作成
      const bodyAction1 = new ActionUsage({
        id: uuid(),
        name: 'Step1'
      });
      
      const bodyAction2 = new ActionUsage({
        id: uuid(),
        name: 'Step2'
      });
      
      // Perform Actionを作成
      const performAction = new PerformActionUsage({
        id: uuid(),
        name: 'ExecuteTask',
        target: bodyAction1.id
      });
      
      // Loop Actionを作成
      const loopAction = new LoopActionUsage({
        id: uuid(),
        name: 'RepeatProcess',
        loopType: 'while',
        condition: 'counter < 10',
        bodyActions: [performAction.id, bodyAction2.id]
      });
      
      // レジストリに登録
      modelRegistry.registerAction(bodyAction1);
      modelRegistry.registerAction(bodyAction2);
      modelRegistry.registerAction(performAction);
      modelRegistry.registerAction(loopAction);
      
      // ループアクションの検証
      expect(() => {
        ActionValidator.validateAction(
          loopAction,
          id => modelRegistry.getParameter(id),
          id => modelRegistry.getAction(id)
        );
      }).not.toThrow();
      
      // Perform Actionの検証
      expect(() => {
        ActionValidator.validateAction(
          performAction,
          id => modelRegistry.getParameter(id),
          id => modelRegistry.getAction(id)
        );
      }).not.toThrow();
    });
  });
  
  describe('SysML v1とv2の互換性', () => {
    test('BlockDefinitionとPartDefinitionの互換性', () => {
      // BlockDefinitionを使ったレガシーコード
      const legacyBlock = new BlockDefinition({
        name: 'LegacyBlock',
        stereotype: 'block'
      });
      
      // PartDefinitionを使った新しいコード
      const modernPart = new PartDefinition({
        name: 'ModernPart'
      });
      
      // BlockDefinitionの__type属性が存在することを確認
      const blockJson = legacyBlock.toJSON();
      expect(blockJson.__type).toBeDefined();
      
      // PartDefinitionのJSON形式がBlockDefinitionと同様であることを確認
      const partJson = modernPart.toJSON();
      expect(partJson.__type).toBeDefined();
      
      // モデル変換の互換性検証
      const blockType = blockJson.__type;
      const partType = partJson.__type;
      
      // SysML v2ではステレオタイプではなく直接型情報を使用
      expect(blockJson.stereotype).toBeDefined(); // 後方互換性のため存在
      expect(partJson.stereotype).toBeUndefined(); // SysML v2では使用しない
    });
    
    test('アクションがSysML v2のPartDefinitionと連携できる', () => {
      // SysML v2のPartDefinition
      const sensorPart = new PartDefinition({
        id: uuid(),
        name: 'SensorComponent'
      });
      
      // アクション定義
      const senseAction = new ActionDefinition({
        id: uuid(),
        name: 'SenseEnvironment'
      });
      
      // アクション使用
      const senseUsage = new ActionUsage({
        id: uuid(),
        name: 'SensingProcess',
        actionDefinition: senseAction.id
      });
      
      // パート定義にアクションを関連付け
      sensorPart.addFeature(senseAction.id); // 定義を追加
      sensorPart.addFeature(senseUsage.id);  // 使用も追加
      
      // 検証
      expect(sensorPart.ownedFeatures).toContain(senseAction.id);
      expect(sensorPart.ownedFeatures).toContain(senseUsage.id);
      
      // JSON変換
      const partJson = sensorPart.toJSON();
      expect(partJson.ownedFeatures).toContain(senseAction.id);
      expect(partJson.ownedFeatures).toContain(senseUsage.id);
    });
  });
});