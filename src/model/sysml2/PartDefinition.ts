/**
 * SysML v2 PartDefinition クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §8.3.1に準拠
 * 
 * PartDefinitionは、システム内の構造要素の種類を定義するためのクラスです。
 * 旧SysML v1のBlockに相当します。
 */

import { v4 as uuid } from 'uuid';
import { Definition } from '../kerml/Definition';
import { Feature } from '../kerml/Feature';

/**
 * PartDefinition クラス
 * SysML v2の部品定義を表現するクラス
 */
export class PartDefinition extends Definition {
  /** シングルトンかどうか */
  isSingleton: boolean = false;
  
  /** バリエーションかどうか */
  isVariation: boolean = false;
  
  /**
   * PartDefinition コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    description?: string;
    isAbstract?: boolean;
    isSingleton?: boolean;
    isVariation?: boolean;
    ownerId?: string;
    ownedFeatures?: Feature[];
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
    
    this.isSingleton = options.isSingleton ?? false;
    this.isVariation = options.isVariation ?? false;
  }
  
  /**
   * JSONシリアライズ用のメソッド
   * @returns JSON形式のオブジェクト
   */
  override toJSON(): any {
    const baseJson = super.toJSON();
    
    return {
      ...baseJson,
      isSingleton: this.isSingleton,
      isVariation: this.isVariation,
      __type: 'PartDefinition'
    };
  }
  
  /**
   * JSONデータからPartDefinitionインスタンスを作成する
   * @param json JSON形式のデータ
   * @returns 新しいPartDefinitionインスタンス
   */
  static fromJSON(json: any): PartDefinition {
    if (!json || typeof json !== 'object') {
      throw new Error('有効なJSONオブジェクトではありません');
    }
    
    return new PartDefinition({
      id: json.id || uuid(),
      name: json.name,
      description: json.description,
      isAbstract: json.isAbstract,
      isSingleton: json.isSingleton,
      isVariation: json.isVariation,
      usageReferences: json.usageReferences
    });
  }
}