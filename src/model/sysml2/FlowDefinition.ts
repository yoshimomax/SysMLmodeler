import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { Definition } from './Definition';
import { SysML2_FlowDefinition } from './interfaces';

/**
 * SysML v2のFlowDefinitionクラス
 * システム要素間のフロー（物理的、論理的、情報的）を定義する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.11に準拠
 */
export class FlowDefinition extends Definition {
  /** このFlowDefinitionを使用するFlowUsageのIDリスト */
  flowUsages: string[];
  
  /** フロープロパティのIDリスト */
  flowProperties: string[];
  
  /** フロー元の型ID */
  sourceTypeId?: string;
  
  /** フロー先の型ID */
  targetTypeId?: string;
  
  /**
   * FlowDefinition コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    isAbstract?: boolean;
    isVariation?: boolean;
    stereotype?: string;
    ownedFeatures?: string[] | Feature[];
    flowUsages?: string[];
    flowProperties?: string[];
    sourceTypeId?: string;
    targetTypeId?: string;
  }) {
    super(params);
    
    this.flowUsages = params.flowUsages || [];
    this.flowProperties = params.flowProperties || [];
    this.sourceTypeId = params.sourceTypeId;
    this.targetTypeId = params.targetTypeId;
  }
  
  /**
   * FlowUsageへの参照を追加する
   * @param flowUsageId 追加するFlowUsageのID
   */
  addFlowUsageReference(flowUsageId: string): void {
    if (!this.flowUsages.includes(flowUsageId)) {
      this.flowUsages.push(flowUsageId);
    }
  }
  
  /**
   * フロープロパティを追加する
   * @param propertyId 追加するプロパティのID
   */
  addFlowProperty(propertyId: string): void {
    if (!this.flowProperties.includes(propertyId)) {
      this.flowProperties.push(propertyId);
    }
  }
  
  /**
   * フロープロパティを削除する
   * @param propertyId 削除するプロパティのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeFlowProperty(propertyId: string): boolean {
    const index = this.flowProperties.indexOf(propertyId);
    if (index !== -1) {
      this.flowProperties.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_FlowDefinition形式のJSONオブジェクト
   */
  toJSON(): SysML2_FlowDefinition {
    return {
      ...super.toJSON(),
      __type: 'FlowDefinition',
      flowUsages: this.flowUsages,
      flowProperties: this.flowProperties,
      sourceType: this.sourceTypeId,
      targetType: this.targetTypeId
    };
  }
  
  /**
   * JSONオブジェクトからFlowDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns FlowDefinitionインスタンス
   */
  static fromJSON(json: SysML2_FlowDefinition): FlowDefinition {
    return new FlowDefinition({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      ownedFeatures: json.ownedFeatures,
      flowUsages: json.flowUsages,
      flowProperties: json.flowProperties,
      sourceTypeId: json.sourceType,
      targetTypeId: json.targetType
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
      stereotype: this.stereotype || 'flow_def',
      isAbstract: this.isAbstract,
      flowProperties: this.flowProperties,
      sourceTypeId: this.sourceTypeId,
      targetTypeId: this.targetTypeId
    };
  }
}