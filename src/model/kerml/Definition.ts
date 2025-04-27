/**
 * KerML Definition クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.5.2に準拠
 * 
 * KerMLのDefinitionは、特性の完全な定義を提供するClassifierのサブクラスです。
 * すべてのSysML v2 Definitionクラスの基底クラスとして使用します。
 */

import { v4 as uuid } from 'uuid';
import { Classifier } from './Classifier';
import { Feature } from './Feature';

/**
 * Definition クラス
 * KerMLの定義を表現するクラス、すべてのSysML v2特定Definitionの親クラス
 */
export class Definition extends Classifier {
  /** 使用参照（Usageの参照）の配列 */
  usageReferences: string[] = [];
  
  /**
   * Definition コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    description?: string;
    isAbstract?: boolean;
    isConjugated?: boolean;
    ownedFeatures?: Feature[];
    usageReferences?: string[];
  } = {}) {
    super({
      id: options.id,
      name: options.name,
      description: options.description,
      isAbstract: options.isAbstract,
      isConjugated: options.isConjugated,
      ownedFeatures: options.ownedFeatures
    });
    
    if (options.usageReferences) {
      this.usageReferences = [...options.usageReferences];
    }
  }
  
  /**
   * 使用参照を追加する
   * @param usageId 追加する使用参照のID
   */
  addUsageReference(usageId: string): void {
    if (!this.usageReferences.includes(usageId)) {
      this.usageReferences.push(usageId);
    }
  }
  
  /**
   * 使用参照を削除する
   * @param usageId 削除する使用参照のID
   */
  removeUsageReference(usageId: string): void {
    this.usageReferences = this.usageReferences.filter(id => id !== usageId);
  }
  
  /**
   * JSONシリアライズ用のメソッド
   * @returns JSON形式のオブジェクト
   */
  override toJSON(): any {
    const baseJson = super.toJSON();
    
    return {
      ...baseJson,
      usageReferences: [...this.usageReferences],
      __type: 'Definition'
    };
  }
  
  /**
   * JSONデータからDefinitionインスタンスを作成する
   * @param json JSON形式のデータ
   * @returns 新しいDefinitionインスタンス
   */
  static fromJSON(json: any): Definition {
    if (!json || typeof json !== 'object') {
      throw new Error('有効なJSONオブジェクトではありません');
    }
    
    return new Definition({
      id: json.id || uuid(),
      name: json.name,
      description: json.description,
      isAbstract: json.isAbstract,
      isConjugated: json.isConjugated,
      usageReferences: json.usageReferences
    });
  }
}