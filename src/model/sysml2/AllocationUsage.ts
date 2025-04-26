import { v4 as uuidv4 } from 'uuid';
import { Usage } from './Usage';
import { SysML2_AllocationUsage } from './interfaces';

/**
 * SysML v2のAllocationUsageクラス
 * システム要素間の割り当て関係の使用を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.10に準拠
 */
export class AllocationUsage extends Usage {
  /** 参照するAllocationDefinitionのID */
  allocationDefinitionId?: string;
  
  /** 割り当て元の型ID */
  sourceTypeId?: string;
  
  /** 割り当て先の型ID */
  targetTypeId?: string;
  
  /**
   * AllocationUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    allocationDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    sourceTypeId?: string;
    targetTypeId?: string;
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.allocationDefinitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages
    });
    
    this.allocationDefinitionId = params.allocationDefinitionId || params.definitionId;
    this.sourceTypeId = params.sourceTypeId;
    this.targetTypeId = params.targetTypeId;
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_AllocationUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_AllocationUsage {
    return {
      ...super.toJSON(),
      __type: 'AllocationUsage',
      allocationDefinition: this.allocationDefinitionId,
      sourceType: this.sourceTypeId,
      targetType: this.targetTypeId
    };
  }
  
  /**
   * JSONオブジェクトからAllocationUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns AllocationUsageインスタンス
   */
  static fromJSON(json: SysML2_AllocationUsage): AllocationUsage {
    return new AllocationUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      allocationDefinitionId: json.allocationDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
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
      stereotype: this.stereotype || 'allocation',
      definitionId: this.allocationDefinitionId,
      sourceTypeId: this.sourceTypeId,
      targetTypeId: this.targetTypeId
    };
  }
}