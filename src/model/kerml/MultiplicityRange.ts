import { v4 as uuidv4 } from 'uuid';
import { KerML_MultiplicityRange } from './interfaces';

/**
 * KerML MultiplicityRange クラス
 * KerML メタモデルの多重度範囲概念を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class MultiplicityRange {
  /** 一意識別子 */
  readonly id: string;
  
  /** 所有者要素ID */
  ownerId?: string;
  
  /** 要素名 */
  name?: string;
  
  /** 説明 */
  description?: string;
  
  /** 下限値 */
  lowerBound: number;
  
  /** 上限値（-1 は無限大を表す） */
  upperBound: number;
  
  /** 境界の型UUID */
  boundingTypeId?: string;
  
  /** 多重度の表示文字列（内部表現ではなく表示用） */
  private _multiplicityString?: string;
  
  /**
   * MultiplicityRange コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    ownerId?: string;
    name?: string;
    description?: string;
    lowerBound?: number;
    upperBound?: number;
    boundingTypeId?: string;
  } = {}) {
    this.id = options.id || uuidv4();
    this.ownerId = options.ownerId;
    this.name = options.name;
    this.description = options.description;
    
    this.lowerBound = options.lowerBound !== undefined ? options.lowerBound : 0;
    this.upperBound = options.upperBound !== undefined ? options.upperBound : 1;
    this.boundingTypeId = options.boundingTypeId;
    
    // 表示文字列を更新
    this.updateMultiplicityString();
  }
  
  /**
   * 多重度の範囲を更新
   * @param lowerBound 新しい下限値
   * @param upperBound 新しい上限値
   */
  updateRange(lowerBound: number, upperBound: number): void {
    this.lowerBound = lowerBound;
    this.upperBound = upperBound;
    this.updateMultiplicityString();
  }
  
  /**
   * 多重度の表示文字列を更新
   */
  private updateMultiplicityString(): void {
    if (this.lowerBound === this.upperBound) {
      // 下限と上限が同じ場合は単一の値を表示
      this._multiplicityString = `${this.lowerBound}`;
    } else if (this.upperBound === -1) {
      // 上限が無限大の場合
      this._multiplicityString = `${this.lowerBound}..*`;
    } else {
      // 範囲がある場合
      this._multiplicityString = `${this.lowerBound}..${this.upperBound}`;
    }
  }
  
  /**
   * 多重度の表示文字列を取得
   */
  get multiplicityString(): string {
    return this._multiplicityString || '';
  }
  
  /**
   * 値が範囲内かどうかをチェック
   * @param count チェックする値
   * @returns 範囲内ならtrue、範囲外ならfalse
   */
  isInRange(count: number): boolean {
    // 上限が無限大の場合は下限以上であればOK
    if (this.upperBound === -1) {
      return count >= this.lowerBound;
    }
    
    // 通常の範囲チェック
    return count >= this.lowerBound && count <= this.upperBound;
  }
  
  /**
   * 多重度が有効かどうかチェック
   * @returns 有効な多重度の場合true、そうでない場合false
   */
  isValid(): boolean {
    // 下限は0以上の整数
    if (this.lowerBound < 0) {
      return false;
    }
    
    // 上限は下限以上、または-1（無限大）
    if (this.upperBound !== -1 && this.upperBound < this.lowerBound) {
      return false;
    }
    
    return true;
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_MultiplicityRange {
    return {
      __type: 'MultiplicityRange',
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      description: this.description,
      lowerBound: this.lowerBound,
      upperBound: this.upperBound,
      boundingType: this.boundingTypeId
    };
  }
  
  /**
   * JSON形式から多重度範囲を作成
   * @param json JSON表現
   * @returns 多重度範囲インスタンス
   */
  static fromJSON(json: KerML_MultiplicityRange): MultiplicityRange {
    return new MultiplicityRange({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      description: json.description,
      lowerBound: json.lowerBound,
      upperBound: json.upperBound,
      boundingTypeId: json.boundingType
    });
  }
  
  /**
   * 文字列表現から多重度範囲オブジェクトを作成する
   * @param multiplicity 多重度の文字列（例: '0..1', '1..*', '*', '2..5'）
   * @returns 対応するMultiplicityRangeオブジェクト
   */
  static fromString(multiplicity: string): MultiplicityRange {
    // 文字列が空の場合はデフォルト値（0..1）
    if (!multiplicity) {
      return new MultiplicityRange();
    }
    
    // '*' は '0..*' の省略形
    if (multiplicity === '*') {
      return new MultiplicityRange({
        lowerBound: 0,
        upperBound: -1
      });
    }
    
    // '1..*' のような形式をパース
    if (multiplicity.includes('..')) {
      const [lowerStr, upperStr] = multiplicity.split('..');
      const lowerBound = parseInt(lowerStr, 10);
      let upperBound: number;
      
      if (upperStr === '*') {
        upperBound = -1; // 無限大
      } else {
        upperBound = parseInt(upperStr, 10);
      }
      
      return new MultiplicityRange({
        lowerBound,
        upperBound
      });
    }
    
    // 単一の数値は下限と上限が同じ
    const bound = parseInt(multiplicity, 10);
    return new MultiplicityRange({
      lowerBound: bound,
      upperBound: bound
    });
  }
}