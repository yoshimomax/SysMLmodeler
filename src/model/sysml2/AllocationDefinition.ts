import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { Definition } from './Definition';
import { SysML2_AllocationDefinition } from './interfaces';

/**
 * SysML v2のAllocationDefinitionクラス
 * システム要素間の割り当て関係を定義する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.10に準拠
 */
export class AllocationDefinition extends Definition {
  /** このAllocationDefinitionを使用するAllocationUsageのIDリスト */
  allocationUsages: string[];
  
  /** 割り当て元の型ID */
  sourceTypeId?: string;
  
  /** 割り当て先の型ID */
  targetTypeId?: string;
  
  /**
   * AllocationDefinition コンストラクタ
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
    allocationUsages?: string[];
    sourceTypeId?: string;
    targetTypeId?: string;
  }) {
    super(params);
    
    this.allocationUsages = params.allocationUsages || [];
    this.sourceTypeId = params.sourceTypeId;
    this.targetTypeId = params.targetTypeId;
  }
  
  /**
   * AllocationUsageへの参照を追加する
   * @param allocationUsageId 追加するAllocationUsageのID
   */
  addAllocationUsageReference(allocationUsageId: string): void {
    if (!this.allocationUsages.includes(allocationUsageId)) {
      this.allocationUsages.push(allocationUsageId);
    }
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_AllocationDefinition形式のJSONオブジェクト
   */
  toJSON(): SysML2_AllocationDefinition {
    return {
      ...super.toJSON(),
      __type: 'AllocationDefinition',
      allocationUsages: this.allocationUsages,
      sourceType: this.sourceTypeId,
      targetType: this.targetTypeId
    };
  }
  
  /**
   * JSONオブジェクトからAllocationDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns AllocationDefinitionインスタンス
   */
  static fromJSON(json: SysML2_AllocationDefinition): AllocationDefinition {
    return new AllocationDefinition({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      ownedFeatures: json.ownedFeatures,
      allocationUsages: json.allocationUsages,
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
      stereotype: this.stereotype || 'allocation_def',
      isAbstract: this.isAbstract,
      sourceTypeId: this.sourceTypeId,
      targetTypeId: this.targetTypeId
    };
  }
}