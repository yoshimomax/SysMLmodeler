import { v4 as uuidv4 } from 'uuid';
import { Usage } from './Usage';
import { SysML2_FlowUsage } from './interfaces';

/**
 * SysML v2のFlowUsageクラス
 * システム要素間のフロー（物理的、論理的、情報的）の使用を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.11に準拠
 */
export class FlowUsage extends Usage {
  /** 参照するFlowDefinitionのID */
  flowDefinitionId?: string;
  
  /** フロープロパティのIDリスト */
  flowProperties: string[];
  
  /** フロー元の型ID */
  sourceTypeId?: string;
  
  /** フロー先の型ID */
  targetTypeId?: string;
  
  /**
   * FlowUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    flowDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    flowProperties?: string[];
    sourceTypeId?: string;
    targetTypeId?: string;
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.flowDefinitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages
    });
    
    this.flowDefinitionId = params.flowDefinitionId || params.definitionId;
    this.flowProperties = params.flowProperties || [];
    this.sourceTypeId = params.sourceTypeId;
    this.targetTypeId = params.targetTypeId;
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
   * @returns SysML2_FlowUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_FlowUsage {
    return {
      ...super.toJSON(),
      __type: 'FlowUsage',
      flowDefinition: this.flowDefinitionId,
      flowProperties: this.flowProperties,
      sourceType: this.sourceTypeId,
      targetType: this.targetTypeId
    };
  }
  
  /**
   * JSONオブジェクトからFlowUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns FlowUsageインスタンス
   */
  static fromJSON(json: SysML2_FlowUsage): FlowUsage {
    return new FlowUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      flowDefinitionId: json.flowDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
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
      stereotype: this.stereotype || 'flow',
      definitionId: this.flowDefinitionId,
      flowProperties: this.flowProperties,
      sourceTypeId: this.sourceTypeId,
      targetTypeId: this.targetTypeId
    };
  }
}