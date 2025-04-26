import { v4 as uuidv4 } from 'uuid';

/**
 * KerML MultiplicityRange クラス
 * KerML メタモデルの多重度範囲概念を表現する
 * @see https://www.omg.org/spec/KerML/1.0/Beta1/PDF
 */
export class MultiplicityRange {
  /** 一意識別子 */
  readonly id: string;
  
  /** 下限値 */
  lowerBound: number;
  
  /** 上限値（-1 は無限大を表す） */
  upperBound: number;
  
  /** 多重度の表示文字列（内部表現ではなく表示用） */
  multiplicityString?: string;
  
  /**
   * MultiplicityRange コンストラクタ
   * @param lowerBound 下限値（デフォルト: 0）
   * @param upperBound 上限値（デフォルト: 1、-1 は無限大）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    lowerBound: number = 0,
    upperBound: number = 1,
    id?: string
  ) {
    this.id = id || uuidv4();
    this.lowerBound = lowerBound;
    this.upperBound = upperBound;
    
    // 表示文字列を設定
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
      this.multiplicityString = `${this.lowerBound}`;
    } else if (this.upperBound === -1) {
      // 上限が無限大の場合
      this.multiplicityString = `${this.lowerBound}..*`;
    } else {
      // 範囲がある場合
      this.multiplicityString = `${this.lowerBound}..${this.upperBound}`;
    }
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
   * 多重度範囲情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      lowerBound: this.lowerBound,
      upperBound: this.upperBound,
      multiplicityString: this.multiplicityString
    };
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
      return new MultiplicityRange(0, -1);
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
      
      return new MultiplicityRange(lowerBound, upperBound);
    }
    
    // 単一の数値は下限と上限が同じ
    const bound = parseInt(multiplicity, 10);
    return new MultiplicityRange(bound, bound);
  }
}