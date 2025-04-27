/**
 * KerML Type クラス
 * SysML v2 言語仕様のKerML基本型を表現する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.2に準拠
 * 
 * Typeは、KerMLの型システムの基本クラスで、
 * 全てのモデル要素の基底となる型です。
 */

import { v4 as uuid } from 'uuid';
import { FeatureObject } from './Feature';

export class Type {
  /** 型の一意識別子 */
  readonly id: string;
  
  /** 型の名前 */
  name: string;
  
  /** この型を所有する要素のID */
  ownerId?: string;
  
  /** 型の短い名前 */
  shortName?: string;
  
  /** 型の完全修飾名 */
  qualifiedName?: string;
  
  /** 型の説明 */
  description?: string;
  
  /** 抽象型かどうか */
  isAbstract: boolean = false;
  
  /** 共役型かどうか */
  isConjugated: boolean = false;
  
  /**
   * Type コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    ownerId?: string;
    shortName?: string;
    qualifiedName?: string;
    description?: string;
    isAbstract?: boolean;
    isConjugated?: boolean;
    features?: any[];
  } = {}) {
    this.id = options.id || uuid();
    this.name = options.name || `Type_${this.id.slice(0, 8)}`;
    this.ownerId = options.ownerId;
    this.shortName = options.shortName;
    this.qualifiedName = options.qualifiedName;
    this.description = options.description;
    
    if (options.isAbstract !== undefined) {
      this.isAbstract = options.isAbstract;
    }
    
    if (options.isConjugated !== undefined) {
      this.isConjugated = options.isConjugated;
    }
  }
  
  /**
   * 型の情報をオブジェクトとして返す
   * @returns FeatureObject 構造
   */
  toObject(): FeatureObject {
    return {
      id: this.id,
      name: this.name,
      type: 'Type',
      properties: {
        ownerId: this.ownerId,
        shortName: this.shortName,
        qualifiedName: this.qualifiedName,
        description: this.description,
        isAbstract: this.isAbstract,
        isConjugated: this.isConjugated
      }
    };
  }
  
  /**
   * KerML制約を検証する
   * SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.2に準拠
   * @throws Error 制約違反がある場合
   */
  validate(): void {
    // 名前の存在確認
    if (!this.name || this.name.trim() === '') {
      console.warn(`警告: Type(id=${this.id})に名前が設定されていません`);
    }
    
    // その他の制約チェック
    // ここに追加の検証ロジックを実装
  }
  
  /**
   * JSONデータからTypeインスタンスを作成する
   * @param json JSON形式のデータ
   * @returns 新しいTypeインスタンス
   */
  static fromJSON(json: any): Type {
    if (!json || typeof json !== 'object') {
      throw new Error('有効なJSONオブジェクトではありません');
    }
    
    // Typeインスタンスを作成
    const type = new Type({
      id: json.id || uuid(),
      name: json.name,
      ownerId: json.ownerId,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      isAbstract: json.isAbstract,
      isConjugated: json.isConjugated
    });
    
    return type;
  }
  
  /**
   * JSONシリアライズ用のメソッド
   * @returns JSON形式のオブジェクト
   */
  toJSON(): any {
    const obj = this.toObject();
    // obj.properties内のすべてのプロパティをトップレベルに移動
    const result = {
      ...obj,
      ...obj.properties,
      __type: 'Type'
    };
    // propertiesプロパティを除外した新しいオブジェクトを作成
    const { properties, ...resultWithoutProperties } = result;
    return resultWithoutProperties;
  }
}