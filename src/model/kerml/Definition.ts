/**
 * KerML Definition クラス
 * SysML v2 言語仕様のKerML基本型を表現する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.5に準拠
 * 
 * Definitionは、KerMLのClassifierの一種で、システム要素の型を定義します。
 */

import { v4 as uuid } from 'uuid';
import { Classifier } from './Classifier';
import { Feature } from './Feature';

export class Definition extends Classifier {
  /** この定義に属する特性のIDリスト */
  ownedFeatures: string[] = [];
  
  /** このDefinitionに基づく使用要素への参照（オプション） */
  usageReferences: string[] = [];
  
  /**
   * Definition コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    ownerId?: string;
    isAbstract?: boolean;
    isVariation?: boolean;
    usageReferences?: string[];
  }) {
    // Classifier基底クラスのコンストラクタを呼び出し
    super({
      id: options.id,
      name: options.name,
      ownerId: options.ownerId,
      isAbstract: options.isAbstract,
      isVariation: options.isVariation
    });
    
    // 使用参照の初期化
    this.usageReferences = options.usageReferences || [];
  }
  
  /**
   * 特性を追加する
   * @param feature 追加する特性またはそのID
   */
  addFeature(feature: Feature | string): void {
    const featureId = typeof feature === 'string' ? feature : feature.id;
    if (!this.ownedFeatures.includes(featureId)) {
      this.ownedFeatures.push(featureId);
    }
  }
  
  /**
   * 特性を削除する
   * @param feature 削除する特性またはそのID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeFeature(feature: Feature | string): boolean {
    const featureId = typeof feature === 'string' ? feature : feature.id;
    const initialLength = this.ownedFeatures.length;
    this.ownedFeatures = this.ownedFeatures.filter(id => id !== featureId);
    return this.ownedFeatures.length !== initialLength;
  }
  
  /**
   * 使用参照を追加する
   * @param usageId 追加する使用要素のID
   */
  addUsageReference(usageId: string): void {
    if (!this.usageReferences.includes(usageId)) {
      this.usageReferences.push(usageId);
    }
  }
  
  /**
   * 使用参照を削除する
   * @param usageId 削除する使用要素のID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeUsageReference(usageId: string): boolean {
    const initialLength = this.usageReferences.length;
    this.usageReferences = this.usageReferences.filter(id => id !== usageId);
    return this.usageReferences.length !== initialLength;
  }
  
  /**
   * KerML制約を検証する
   * SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.5に準拠
   * @throws Error 制約違反がある場合
   */
  validate(): void {
    // 親クラス（Classifier）の制約を検証
    super.validate();
    
    // Definition固有の制約を検証
    // 実装が必要な場合に追加
  }
  
  /**
   * 定義の情報をオブジェクトとして返す
   */
  override toObject() {
    const baseObject = super.toObject();
    return {
      ...baseObject,
      ownedFeatures: [...this.ownedFeatures],
      usageReferences: [...this.usageReferences]
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
    
    // Definitionインスタンスを作成
    const definition = new Definition({
      id: json.id || uuid(),
      name: json.name,
      ownerId: json.ownerId,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      usageReferences: Array.isArray(json.usageReferences) ? [...json.usageReferences] : []
    });
    
    // 特性を復元
    if (Array.isArray(json.ownedFeatures)) {
      definition.ownedFeatures = [...json.ownedFeatures];
    }
    
    return definition;
  }
  
  /**
   * JSONシリアライズ用のメソッド
   * @returns JSON形式のオブジェクト
   */
  toJSON(): any {
    const obj = this.toObject();
    return {
      ...obj,
      __type: 'Definition'
    };
  }
}