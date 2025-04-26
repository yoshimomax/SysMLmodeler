/**
 * KerML Classifier クラス
 * SysML v2 言語仕様のKerML基本型を表現する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.3に準拠
 * 
 * Classifierは、KerMLの型システムの基本クラスの一つで、
 * 要素の分類と特性付けに使用されます。
 */

import { v4 as uuid } from 'uuid';
import { Type } from './Type';

export class Classifier extends Type {
  /** 
   * この分類器が抽象型かどうか
   * 抽象型は直接インスタンス化できません
   */
  isAbstract: boolean = false;
  
  /**
   * この分類器が変種型かどうか
   * 変種型は要素を物理的・状態的に区別するために使用されます
   */
  isVariation: boolean = false;
  
  /**
   * Classifier コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    ownerId?: string;
    isAbstract?: boolean;
    isVariation?: boolean;
  }) {
    // Type基底クラスのコンストラクタを呼び出し
    super({
      id: options.id,
      name: options.name,
      ownerId: options.ownerId
    });
    
    // 抽象型フラグの初期化
    if (options.isAbstract !== undefined) {
      this.isAbstract = options.isAbstract;
    }
    
    // 変種型フラグの初期化
    if (options.isVariation !== undefined) {
      this.isVariation = options.isVariation;
    }
  }
  
  /**
   * KerML制約を検証する
   * SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.3に準拠
   * @throws Error 制約違反がある場合
   */
  validate(): void {
    // 親クラス（Type）の制約を検証
    super.validate();
    
    // Classifier固有の制約を検証
    // 実装が必要な場合に追加
  }
  
  /**
   * 分類器の情報をオブジェクトとして返す
   */
  override toObject() {
    const baseObject = super.toObject();
    return {
      ...baseObject,
      isAbstract: this.isAbstract,
      isVariation: this.isVariation
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
    
    // Classifierインスタンスを作成
    const classifier = new Classifier({
      id: json.id || uuid(),
      name: json.name,
      ownerId: json.ownerId,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation
    });
    
    return classifier;
  }
  
  /**
   * JSONシリアライズ用のメソッド
   * @returns JSON形式のオブジェクト
   */
  toJSON(): any {
    const obj = this.toObject();
    return {
      ...obj,
      __type: 'Classifier'
    };
  }
}