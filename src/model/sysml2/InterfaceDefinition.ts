/**
 * SysML v2 InterfaceDefinition クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §8.5.1に準拠
 * 
 * InterfaceDefinitionは、要素間のインターフェースとなる定義を表現するクラスです。
 */

import { v4 as uuid } from 'uuid';
import { Definition } from '../kerml/Definition';
import { Feature } from '../kerml/Feature';

/**
 * InterfaceDefinition クラス
 * SysML v2のインターフェース定義を表現するクラス
 */
export class InterfaceDefinition extends Definition {
  /** 端点特性のID配列 */
  endFeatures: string[] = [];
  
  /** インターフェース使用のID配列 */
  interfaceUsages: string[] = [];
  
  /** ステレオタイプ（種類） */
  stereotype?: string;
  
  /**
   * InterfaceDefinition コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    description?: string;
    isAbstract?: boolean;
    stereotype?: string;
    ownerId?: string;
    ownedFeatures?: Feature[];
    endFeatures?: string[];
    interfaceUsages?: string[];
    usageReferences?: string[];
  } = {}) {
    super({
      id: options.id,
      name: options.name,
      description: options.description,
      isAbstract: options.isAbstract,
      ownedFeatures: options.ownedFeatures,
      usageReferences: options.usageReferences
    });
    
    this.stereotype = options.stereotype;
    
    if (options.endFeatures) {
      this.endFeatures = [...options.endFeatures];
    }
    
    if (options.interfaceUsages) {
      this.interfaceUsages = [...options.interfaceUsages];
    }
  }
  
  /**
   * 端点特性を追加する
   * @param endFeatureId 追加する端点特性のID
   */
  addEndFeature(endFeatureId: string): void {
    if (!this.endFeatures.includes(endFeatureId)) {
      this.endFeatures.push(endFeatureId);
    }
  }
  
  /**
   * 端点特性を削除する
   * @param endFeatureId 削除する端点特性のID
   */
  removeEndFeature(endFeatureId: string): void {
    this.endFeatures = this.endFeatures.filter(id => id !== endFeatureId);
  }
  
  /**
   * インターフェース使用を追加する
   * @param interfaceUsageId 追加するインターフェース使用のID
   */
  addInterfaceUsage(interfaceUsageId: string): void {
    if (!this.interfaceUsages.includes(interfaceUsageId)) {
      this.interfaceUsages.push(interfaceUsageId);
    }
  }
  
  /**
   * インターフェース使用を削除する
   * @param interfaceUsageId 削除するインターフェース使用のID
   */
  removeInterfaceUsage(interfaceUsageId: string): void {
    this.interfaceUsages = this.interfaceUsages.filter(id => id !== interfaceUsageId);
  }
  
  /**
   * JSONシリアライズ用のメソッド
   * @returns JSON形式のオブジェクト
   */
  override toJSON(): any {
    const baseJson = super.toJSON();
    
    return {
      ...baseJson,
      stereotype: this.stereotype,
      endFeatures: [...this.endFeatures],
      interfaceUsages: [...this.interfaceUsages],
      __type: 'InterfaceDefinition'
    };
  }
  
  /**
   * JSONデータからInterfaceDefinitionインスタンスを作成する
   * @param json JSON形式のデータ
   * @returns 新しいInterfaceDefinitionインスタンス
   */
  static fromJSON(json: any): InterfaceDefinition {
    if (!json || typeof json !== 'object') {
      throw new Error('有効なJSONオブジェクトではありません');
    }
    
    return new InterfaceDefinition({
      id: json.id || uuid(),
      name: json.name,
      description: json.description,
      isAbstract: json.isAbstract,
      stereotype: json.stereotype,
      endFeatures: json.endFeatures,
      interfaceUsages: json.interfaceUsages,
      usageReferences: json.usageReferences
    });
  }
}