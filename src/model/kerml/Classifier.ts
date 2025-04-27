/**
 * KerML Classifier クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.5に準拠
 * 
 * KerMLのClassifierは、分類可能な要素を表現する基本クラスです。
 * SysMLのすべてのDefinitionクラスの基底クラスとなります。
 */

import { v4 as uuid } from 'uuid';
import { Type } from './Type';
import { Feature } from './Feature';

/**
 * Classifier クラス
 * KerMLの分類子を表現するクラス、すべてのSysML v2 Definitionの親クラス
 */
export class Classifier extends Type {
  /** 所有するフィーチャーの配列 */
  ownedFeatures: Feature[] = [];
  
  /**
   * Classifier コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    description?: string;
    isAbstract?: boolean;
    isConjugated?: boolean;
    ownedFeatures?: Feature[];
  } = {}) {
    super({
      id: options.id,
      name: options.name,
      description: options.description,
      isAbstract: options.isAbstract,
      isConjugated: options.isConjugated
    });
    
    if (options.ownedFeatures) {
      this.ownedFeatures = [...options.ownedFeatures];
      this.ownedFeatures.forEach(feature => {
        feature.ownerId = this.id;
      });
    }
  }
  
  /**
   * フィーチャーを追加する
   * @param feature 追加するフィーチャー
   */
  addFeature(feature: Feature): void {
    this.ownedFeatures.push(feature);
    feature.ownerId = this.id;
  }
  
  /**
   * フィーチャーを削除する
   * @param featureId 削除するフィーチャーのID
   */
  removeFeature(featureId: string): void {
    this.ownedFeatures = this.ownedFeatures.filter(f => f.id !== featureId);
  }
  
  /**
   * JSONシリアライズ用のメソッド
   * @returns JSON形式のオブジェクト
   */
  override toJSON(): any {
    const baseJson = super.toJSON();
    const ownedFeatureIds = this.ownedFeatures.map(feature => feature.id);
    
    return {
      ...baseJson,
      ownedFeatureIds,
      __type: 'Classifier'
    };
  }
  
  /**
   * JSONデータからClassifierインスタンスを作成する
   * @param json JSON形式のデータ
   * @returns 新しいClassifierインスタンス
   */
  static fromJSON(json: any): Classifier {
    if (!json || typeof json !== 'object') {
      throw new Error('有効なJSONオブジェクトではありません');
    }
    
    return new Classifier({
      id: json.id || uuid(),
      name: json.name,
      description: json.description,
      isAbstract: json.isAbstract,
      isConjugated: json.isConjugated
    });
  }
}