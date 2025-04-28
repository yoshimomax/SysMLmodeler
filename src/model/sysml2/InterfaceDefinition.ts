/**
 * SysML v2 InterfaceDefinition クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §8.4.1に準拠
 * 
 * InterfaceDefinitionは、システム要素間のインターフェースを定義するクラスです。
 * インターフェースは、要素間の相互作用の仕様を提供します。
 */

import { v4 as uuid } from 'uuid';
import { Definition } from './Definition';
import { Feature } from '../kerml/Feature';
import { SysML2_InterfaceDefinition } from './interfaces';

/**
 * InterfaceDefinition クラス
 * SysML v2のインターフェース定義を表現するクラス
 */
export class InterfaceDefinition extends Definition {
  /** インターフェース特性のID配列 */
  interfaceFeatures: string[] = [];
  
  /** このインターフェースを参照するUsageのID配列 */
  interfaceUsages: string[] = [];
  
  /** エンドポイント方向性（省略時は双方向） */
  direction?: 'in' | 'out' | 'inout';
  
  /** コンジュゲート（共役）インターフェースかどうか */
  isConjugated: boolean = false;
  
  /**
   * InterfaceDefinition コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    description?: string;
    isAbstract?: boolean;
    isVariation?: boolean;
    ownerId?: string;
    direction?: 'in' | 'out' | 'inout';
    isConjugated?: boolean;
    interfaceFeatures?: string[];
    interfaceUsages?: string[];
    ownedFeatures?: Feature[];
    stereotype?: string;
  } = {}) {
    super({
      id: options.id || uuid(),
      name: options.name || 'unnamed_interface',
      isAbstract: options.isAbstract,
      isVariation: options.isVariation,
      ownerId: options.ownerId,
      ownedFeatures: options.ownedFeatures,
      stereotype: options.stereotype,
      usageReferences: options.interfaceUsages
    });
    
    this.description = options.description;
    this.direction = options.direction;
    this.isConjugated = options.isConjugated || false;
    this.interfaceFeatures = options.interfaceFeatures || [];
    this.interfaceUsages = options.interfaceUsages || [];
  }
  
  /**
   * インターフェース特性を追加する
   * @param featureId 追加する特性のID
   */
  addInterfaceFeature(featureId: string): void {
    if (!this.interfaceFeatures.includes(featureId)) {
      this.interfaceFeatures.push(featureId);
    }
  }
  
  /**
   * インターフェース特性を削除する
   * @param featureId 削除する特性のID
   * @returns 削除に成功した場合はtrue、そうでなければfalse
   */
  removeInterfaceFeature(featureId: string): boolean {
    const initialLength = this.interfaceFeatures.length;
    this.interfaceFeatures = this.interfaceFeatures.filter(id => id !== featureId);
    return this.interfaceFeatures.length !== initialLength;
  }
  
  /**
   * インターフェースUsage参照を追加する
   * @param usageId 追加するUsageのID
   */
  addInterfaceUsage(usageId: string): void {
    if (!this.interfaceUsages.includes(usageId)) {
      this.interfaceUsages.push(usageId);
    }
  }
  
  /**
   * インターフェースUsage参照を削除する
   * @param usageId 削除するUsageのID
   * @returns 削除に成功した場合はtrue、そうでなければfalse
   */
  removeInterfaceUsage(usageId: string): boolean {
    const initialLength = this.interfaceUsages.length;
    this.interfaceUsages = this.interfaceUsages.filter(id => id !== usageId);
    return this.interfaceUsages.length !== initialLength;
  }
  
  /**
   * 共役インターフェースを生成する
   * インとアウトが逆になり、他の特性は同じ
   * @returns 共役インターフェースのインスタンス
   */
  createConjugate(): InterfaceDefinition {
    // 方向を反転
    let conjugateDirection: 'in' | 'out' | 'inout' | undefined = this.direction;
    if (this.direction === 'in') {
      conjugateDirection = 'out';
    } else if (this.direction === 'out') {
      conjugateDirection = 'in';
    }
    
    return new InterfaceDefinition({
      name: `${this.name}_conjugate`,
      description: `${this.name}の共役インターフェース`,
      isAbstract: this.isAbstract,
      isVariation: this.isVariation,
      direction: conjugateDirection,
      isConjugated: true,
      interfaceFeatures: [...this.interfaceFeatures]
    });
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_InterfaceDefinition形式のJSONオブジェクト
   */
  override toJSON(): SysML2_InterfaceDefinition {
    return {
      ...super.toJSON(),
      __type: 'InterfaceDefinition',
      direction: this.direction,
      isConjugated: this.isConjugated,
      interfaceFeatures: this.interfaceFeatures,
      interfaceUsages: this.interfaceUsages
    };
  }
  
  /**
   * JSONオブジェクトからInterfaceDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns InterfaceDefinitionインスタンス
   */
  static fromJSON(json: SysML2_InterfaceDefinition): InterfaceDefinition {
    return new InterfaceDefinition({
      id: json.id,
      name: json.name,
      description: json.description,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      ownerId: json.ownerId,
      direction: json.direction,
      isConjugated: json.isConjugated,
      interfaceFeatures: json.interfaceFeatures,
      interfaceUsages: json.interfaceUsages,
      ownedFeatures: [] // JSONから読み込む際は実際のFeatureインスタンスへの変換が必要
    });
  }
}