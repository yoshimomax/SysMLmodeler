/**
 * SysML v2 InterfaceUsage クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §8.4.2に準拠
 * 
 * InterfaceUsageは、InterfaceDefinitionのインスタンスを表し、
 * 具体的なシステム要素間の相互作用を実現します。
 */

import { v4 as uuid } from 'uuid';
import { Usage } from './Usage';
import { Feature } from '../kerml/Feature';
import { SysML2_InterfaceUsage } from './interfaces';

/**
 * InterfaceUsage クラス
 * SysML v2のインターフェース使用を表現するクラス
 */
export class InterfaceUsage extends Usage {
  /** 参照するインターフェース定義のID */
  interfaceDefinition?: string;
  
  /** インターフェース特性のID配列 */
  interfaceFeatureUsages: string[] = [];
  
  /** エンドポイント方向（定義から継承するか上書き） */
  direction?: 'in' | 'out' | 'inout';
  
  /** コンジュゲート（共役）インターフェースかどうか */
  isConjugated: boolean = false;
  
  /** 所有するポートのID（このインターフェースを提供するポート） */
  ownerPortId?: string;
  
  /** エンドポイント特性（終端）のID配列 */
  endFeatures?: string[];
  
  /**
   * InterfaceUsage コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    description?: string;
    isVariation?: boolean;
    ownerId?: string;
    interfaceDefinition?: string;
    direction?: 'in' | 'out' | 'inout';
    isConjugated?: boolean;
    ownerPortId?: string;
    interfaceFeatureUsages?: string[];
    endFeatures?: string[];
    nestedUsages?: Feature[];
  } = {}) {
    super({
      id: options.id || uuid(),
      name: options.name || 'unnamed_interface_usage',
      description: options.description,
      isVariation: options.isVariation,
      ownerId: options.ownerId,
      definitionId: options.interfaceDefinition,
      nestedUsages: options.nestedUsages
    });
    
    this.interfaceDefinition = options.interfaceDefinition;
    this.direction = options.direction;
    this.isConjugated = options.isConjugated || false;
    this.ownerPortId = options.ownerPortId;
    this.interfaceFeatureUsages = options.interfaceFeatureUsages || [];
    this.endFeatures = options.endFeatures;
  }
  
  /**
   * インターフェース特性使用を追加する
   * @param featureUsageId 追加する特性使用のID
   */
  addInterfaceFeatureUsage(featureUsageId: string): void {
    if (!this.interfaceFeatureUsages.includes(featureUsageId)) {
      this.interfaceFeatureUsages.push(featureUsageId);
    }
  }
  
  /**
   * インターフェース特性使用を削除する
   * @param featureUsageId 削除する特性使用のID
   * @returns 削除に成功した場合はtrue、そうでなければfalse
   */
  removeInterfaceFeatureUsage(featureUsageId: string): boolean {
    const initialLength = this.interfaceFeatureUsages.length;
    this.interfaceFeatureUsages = this.interfaceFeatureUsages.filter(id => id !== featureUsageId);
    return this.interfaceFeatureUsages.length !== initialLength;
  }
  
  /**
   * インターフェース定義を参照付けする
   * @param interfaceDefinitionId 参照するインターフェース定義のID
   */
  setInterfaceDefinition(interfaceDefId: string): void {
    this.interfaceDefinition = interfaceDefId;
    this.definitionId = interfaceDefId; // Usage基底クラスのdefinitionIdも更新
  }
  
  /**
   * エンドポイント特性を追加する
   * @param featureId 追加するエンドポイント特性のID
   */
  addEndFeature(featureId: string): void {
    if (!this.endFeatures) {
      this.endFeatures = [];
    }
    if (!this.endFeatures.includes(featureId)) {
      this.endFeatures.push(featureId);
    }
  }
  
  /**
   * エンドポイント特性を削除する
   * @param featureId 削除するエンドポイント特性のID
   * @returns 削除に成功した場合はtrue、存在しない場合はfalse
   */
  removeEndFeature(featureId: string): boolean {
    if (!this.endFeatures) return false;
    const initialLength = this.endFeatures.length;
    this.endFeatures = this.endFeatures.filter(id => id !== featureId);
    return this.endFeatures.length !== initialLength;
  }
  
  /**
   * 共役インターフェース使用を生成する
   * インとアウトが逆になり、他の特性は同じ
   * @returns 共役インターフェース使用のインスタンス
   */
  createConjugate(): InterfaceUsage {
    // 方向を反転
    let conjugateDirection: 'in' | 'out' | 'inout' | undefined = this.direction;
    if (this.direction === 'in') {
      conjugateDirection = 'out';
    } else if (this.direction === 'out') {
      conjugateDirection = 'in';
    }
    
    return new InterfaceUsage({
      name: `${this.name}_conjugate`,
      description: `${this.name}の共役インターフェース使用`,
      isVariation: this.isVariation,
      interfaceDefinition: this.interfaceDefinition,
      direction: conjugateDirection,
      isConjugated: true,
      interfaceFeatureUsages: [...this.interfaceFeatureUsages],
      endFeatures: this.endFeatures ? [...this.endFeatures] : undefined
    });
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_InterfaceUsage形式のJSONオブジェクト
   */
  override toJSON(): SysML2_InterfaceUsage {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'InterfaceUsage',
      interfaceDefinition: this.interfaceDefinition,
      direction: this.direction,
      isConjugated: this.isConjugated,
      ownerPortId: this.ownerPortId,
      interfaceFeatureUsages: this.interfaceFeatureUsages,
      endFeatures: this.endFeatures
    };
  }
  
  /**
   * JSONオブジェクトからInterfaceUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns InterfaceUsageインスタンス
   */
  static fromJSON(json: SysML2_InterfaceUsage): InterfaceUsage {
    return new InterfaceUsage({
      id: json.id,
      name: json.name,
      description: json.description,
      isVariation: json.isVariation,
      ownerId: json.ownerId,
      interfaceDefinition: json.interfaceDefinition,
      direction: json.direction,
      isConjugated: json.isConjugated,
      ownerPortId: json.ownerPortId,
      interfaceFeatureUsages: json.interfaceFeatureUsages,
      endFeatures: json.endFeatures,
      nestedUsages: [] // JSONから読み込む際は実際のFeatureインスタンスへの変換が必要
    });
  }
}