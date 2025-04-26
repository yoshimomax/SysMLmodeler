import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { Definition } from './Definition';
import { SysML2_PartDefinition } from './interfaces';
import { validatePartDefinition, ValidationError } from './validator';

/**
 * SysML v2のPartDefinitionクラス
 * システム構造部品の定義を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.7に準拠
 */
export class PartDefinition extends Definition {
  /** 人間表現かどうか */
  isHuman: boolean;
  
  /** このPartDefinitionを使用するPartUsageのIDリスト */
  partUsages: string[];
  
  /** 所有するインターフェース定義のIDリスト */
  interfaceDefinitions: string[];
  
  /** 所有する接続定義のIDリスト */
  connectionDefinitions: string[];
  
  /** 所有するフロー定義のIDリスト */
  flowDefinitions: string[];
  
  /** 所有する状態定義のIDリスト */
  stateDefinitions: string[];
  
  /** 所有する制約定義のIDリスト */
  constraintDefinitions: string[];
  
  /** 所有する要求定義のIDリスト */
  requirementDefinitions: string[];
  
  /** 所有する計算定義のIDリスト */
  calculationDefinitions: string[];
  
  /** 所有するメタデータ定義のIDリスト */
  metadataDefinitions: string[];
  
  /** ポートのIDリスト */
  ports: string[];
  
  /**
   * PartDefinition コンストラクタ
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
    isHuman?: boolean;
    partUsages?: string[];
    interfaceDefinitions?: string[];
    connectionDefinitions?: string[];
    flowDefinitions?: string[];
    stateDefinitions?: string[];
    constraintDefinitions?: string[];
    requirementDefinitions?: string[];
    calculationDefinitions?: string[];
    metadataDefinitions?: string[];
    ports?: string[];
  }) {
    super(params);
    
    this.isHuman = params.isHuman ?? false;
    this.partUsages = params.partUsages || [];
    this.interfaceDefinitions = params.interfaceDefinitions || [];
    this.connectionDefinitions = params.connectionDefinitions || [];
    this.flowDefinitions = params.flowDefinitions || [];
    this.stateDefinitions = params.stateDefinitions || [];
    this.constraintDefinitions = params.constraintDefinitions || [];
    this.requirementDefinitions = params.requirementDefinitions || [];
    this.calculationDefinitions = params.calculationDefinitions || [];
    this.metadataDefinitions = params.metadataDefinitions || [];
    this.ports = params.ports || [];
  }
  
  /**
   * PartUsageへの参照を追加する
   * @param partUsageId 追加するPartUsageのID
   */
  addPartUsageReference(partUsageId: string): void {
    if (!this.partUsages.includes(partUsageId)) {
      this.partUsages.push(partUsageId);
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
   * KerML制約およびSysML v2の制約を検証する
   * PartDefinition固有の制約を追加でチェック
   * @throws ValidationError 制約違反がある場合
   */
  validate(): void {
    // 基底クラス（Definition）の検証
    super.validate();
    
    // PartDefinition固有の制約を検証
    validatePartDefinition(this);
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_PartDefinition形式のJSONオブジェクト
   */
  toJSON(): SysML2_PartDefinition {
    return {
      ...super.toJSON(),
      __type: 'PartDefinition',
      isHuman: this.isHuman,
      partUsages: this.partUsages,
      interfaceDefinitions: this.interfaceDefinitions,
      connectionDefinitions: this.connectionDefinitions,
      flowDefinitions: this.flowDefinitions,
      stateDefinitions: this.stateDefinitions,
      constraintDefinitions: this.constraintDefinitions,
      requirementDefinitions: this.requirementDefinitions,
      calculationDefinitions: this.calculationDefinitions,
      metadataDefinitions: this.metadataDefinitions,
      ports: this.ports
    };
  }
  
  /**
   * JSONオブジェクトからPartDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns PartDefinitionインスタンス
   */
  static fromJSON(json: SysML2_PartDefinition): PartDefinition {
    return new PartDefinition({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      ownedFeatures: json.ownedFeatures,
      isHuman: json.isHuman,
      partUsages: json.partUsages,
      interfaceDefinitions: json.interfaceDefinitions,
      connectionDefinitions: json.connectionDefinitions,
      flowDefinitions: json.flowDefinitions,
      stateDefinitions: json.stateDefinitions,
      constraintDefinitions: json.constraintDefinitions,
      requirementDefinitions: json.requirementDefinitions,
      calculationDefinitions: json.calculationDefinitions,
      metadataDefinitions: json.metadataDefinitions,
      ports: json.ports
    });
  }
  
  /**
   * オブジェクトをプレーンなJavaScriptオブジェクトに変換する（UI表示用）
   * @returns プレーンなJavaScriptオブジェクト
   */
  toObject() {
    return {
      ...super.toObject(),
      stereotype: this.stereotype || 'part_def',
      isHuman: this.isHuman,
      ports: this.ports
    };
  }
}