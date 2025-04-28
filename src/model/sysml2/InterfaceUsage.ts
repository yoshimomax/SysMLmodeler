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
  interfaceDefinitionId?: string;
  
  /** インターフェース特性のID配列 */
  interfaceFeatureUsages: string[] = [];
  
  /** エンドポイント方向（定義から継承するか上書き） */
  direction?: 'in' | 'out' | 'inout';
  
  /** コンジュゲート（共役）インターフェースかどうか */
  isConjugated: boolean = false;
  
  /** 所有するポートのID（このインターフェースを提供するポート） */
  ownerPortId?: string;
  
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
    interfaceDefinitionId?: string;
    direction?: 'in' | 'out' | 'inout';
    isConjugated?: boolean;
    ownerPortId?: string;
    interfaceFeatureUsages?: string[];
    nestedUsages?: Feature[];
  } = {}) {
    super({
      id: options.id || uuid(),
      name: options.name || 'unnamed_interface_usage',
      description: options.description,
      isVariation: options.isVariation,
      ownerId: options.ownerId,
      definitionId: options.interfaceDefinitionId,
      nestedUsages: options.nestedUsages
    });
    
    this.interfaceDefinitionId = options.interfaceDefinitionId;
    this.direction = options.direction;
    this.isConjugated = options.isConjugated || false;
    this.ownerPortId = options.ownerPortId;
    this.interfaceFeatureUsages = options.interfaceFeatureUsages || [];
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
  setInterfaceDefinition(interfaceDefinitionId: string): void {
    this.interfaceDefinitionId = interfaceDefinitionId;
    this.definitionId = interfaceDefinitionId; // Usage基底クラスのdefinitionIdも更新
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
      interfaceDefinitionId: this.interfaceDefinitionId,
      direction: conjugateDirection,
      isConjugated: true,
      interfaceFeatureUsages: [...this.interfaceFeatureUsages]
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
      interfaceDefinitionId: this.interfaceDefinitionId,
      direction: this.direction,
      isConjugated: this.isConjugated,
      ownerPortId: this.ownerPortId,
      interfaceFeatureUsages: this.interfaceFeatureUsages
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
      interfaceDefinitionId: json.interfaceDefinitionId,
      direction: json.direction,
      isConjugated: json.isConjugated,
      ownerPortId: json.ownerPortId,
      interfaceFeatureUsages: json.interfaceFeatureUsages,
      nestedUsages: [] // JSONから読み込む際は実際のFeatureインスタンスへの変換が必要
    });
  }
}