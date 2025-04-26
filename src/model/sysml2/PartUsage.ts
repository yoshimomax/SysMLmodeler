import { v4 as uuidv4 } from 'uuid';
import { Usage } from './Usage';
import { SysML2_PartUsage } from './interfaces';

/**
 * SysML v2のPartUsageクラス
 * システム構造部品の使用を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.7に準拠
 */
export class PartUsage extends Usage {
  /** 人間表現かどうか */
  isHuman: boolean;
  
  /** 参照するPartDefinitionのID */
  partDefinitionId?: string;
  
  /** ネストされたPart使用のIDリスト */
  nestedParts: string[];
  
  /** ネストされたInterface使用のIDリスト */
  nestedInterfaces: string[];
  
  /** ネストされたConnection使用のIDリスト */
  nestedConnections: string[];
  
  /** ネストされたFlow使用のIDリスト */
  nestedFlows: string[];
  
  /** ネストされたState使用のIDリスト */
  nestedStates: string[];
  
  /** ネストされたConstraint使用のIDリスト */
  nestedConstraints: string[];
  
  /** ネストされたRequirement使用のIDリスト */
  nestedRequirements: string[];
  
  /** ネストされたCalculation使用のIDリスト */
  nestedCalculations: string[];
  
  /** ネストされたMetadata使用のIDリスト */
  nestedMetadata: string[];
  
  /** ポートのIDリスト */
  ports: string[];
  
  /**
   * PartUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    partDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    isHuman?: boolean;
    nestedParts?: string[];
    nestedInterfaces?: string[];
    nestedConnections?: string[];
    nestedFlows?: string[];
    nestedStates?: string[];
    nestedConstraints?: string[];
    nestedRequirements?: string[];
    nestedCalculations?: string[];
    nestedMetadata?: string[];
    ports?: string[];
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.partDefinitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages
    });
    
    // Part特有のプロパティを初期化
    this.isHuman = params.isHuman ?? false;
    this.partDefinitionId = params.partDefinitionId || params.definitionId;
    this.nestedParts = params.nestedParts || [];
    this.nestedInterfaces = params.nestedInterfaces || [];
    this.nestedConnections = params.nestedConnections || [];
    this.nestedFlows = params.nestedFlows || [];
    this.nestedStates = params.nestedStates || [];
    this.nestedConstraints = params.nestedConstraints || [];
    this.nestedRequirements = params.nestedRequirements || [];
    this.nestedCalculations = params.nestedCalculations || [];
    this.nestedMetadata = params.nestedMetadata || [];
    this.ports = params.ports || [];
  }
  
  /**
   * ネストされたPart使用を追加する
   * @param partUsageId 追加するPart使用のID
   */
  addNestedPart(partUsageId: string): void {
    if (!this.nestedParts.includes(partUsageId)) {
      this.nestedParts.push(partUsageId);
      // スーパークラスのnestedUsagesにも追加
      if (!this.nestedUsages.includes(partUsageId)) {
        this.nestedUsages.push(partUsageId);
      }
    }
  }
  
  /**
   * ポートを追加する
   * @param portId 追加するポートのID
   */
  addPort(portId: string): void {
    if (!this.ports.includes(portId)) {
      this.ports.push(portId);
    }
  }
  
  /**
   * ポートを削除する
   * @param portId 削除するポートのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removePort(portId: string): boolean {
    const index = this.ports.indexOf(portId);
    if (index !== -1) {
      this.ports.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_PartUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_PartUsage {
    return {
      ...super.toJSON(),
      __type: 'PartUsage',
      isHuman: this.isHuman,
      partDefinition: this.partDefinitionId,
      nestedParts: this.nestedParts,
      nestedInterfaces: this.nestedInterfaces,
      nestedConnections: this.nestedConnections,
      nestedFlows: this.nestedFlows,
      nestedStates: this.nestedStates,
      nestedConstraints: this.nestedConstraints,
      nestedRequirements: this.nestedRequirements,
      nestedCalculations: this.nestedCalculations,
      nestedMetadata: this.nestedMetadata,
      ports: this.ports
    };
  }
  
  /**
   * JSONオブジェクトからPartUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns PartUsageインスタンス
   */
  static fromJSON(json: SysML2_PartUsage): PartUsage {
    return new PartUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      partDefinitionId: json.partDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
      isHuman: json.isHuman,
      nestedParts: json.nestedParts,
      nestedInterfaces: json.nestedInterfaces,
      nestedConnections: json.nestedConnections,
      nestedFlows: json.nestedFlows,
      nestedStates: json.nestedStates,
      nestedConstraints: json.nestedConstraints,
      nestedRequirements: json.nestedRequirements,
      nestedCalculations: json.nestedCalculations,
      nestedMetadata: json.nestedMetadata,
      ports: json.ports
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
      stereotype: this.stereotype || 'part',
      definitionId: this.partDefinitionId,
      isHuman: this.isHuman,
      ports: this.ports,
      nestedParts: this.nestedParts
    };
  }
}