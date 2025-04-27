/**
 * KerML Type クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.4に準拠
 * 
 * KerMLの型は、要素を分類するための基礎となる概念です。
 * すべてのSysML v2/KerMLモデル要素の基底クラスです。
 */

import { v4 as uuid } from 'uuid';

/**
 * Type クラス
 * すべてのモデル要素の基底クラス
 */
export class Type {
  /** 要素の一意識別子 */
  readonly id: string;
  
  /** 要素の名前 */
  name: string;
  
  /** 要素の説明 */
  description?: string;
  
  /** 抽象要素かどうか */
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
    description?: string;
    isAbstract?: boolean;
    isConjugated?: boolean;
  } = {}) {
    this.id = options.id || uuid();
    this.name = options.name || 'unnamed';
    this.description = options.description;
    this.isAbstract = options.isAbstract || false;
    this.isConjugated = options.isConjugated || false;
  }
  
  /**
   * このTypeを検証する
   * オーバーライド可能なバリデーションロジック
   */
  validate(): void {
    // 基底クラスでは特に検証ロジックなし
    // サブクラスでオーバーライドして拡張可能
  }
  
  /**
   * オブジェクトを文字列表現に変換
   * @returns 読みやすい文字列形式
   */
  toString(): string {
    return `${this.name} (${this.id.substring(0, 8)}...)`;
  }
  
  /**
   * オブジェクトをJSON形式に変換
   * @returns JSONシリアライズ可能なオブジェクト
   */
  toJSON(): any {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      isAbstract: this.isAbstract,
      isConjugated: this.isConjugated,
      __type: 'Type'
    };
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
    
    return new Type({
      id: json.id || uuid(),
      name: json.name,
      description: json.description,
      isAbstract: json.isAbstract,
      isConjugated: json.isConjugated
    });
  }
}