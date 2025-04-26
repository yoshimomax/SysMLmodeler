import { v4 as uuidv4 } from 'uuid';
import { Type } from './Type';
import { MultiplicityRange } from './MultiplicityRange';

/**
 * KerML Feature クラス
 * KerML メタモデルのFeature概念を表現する
 * @see https://www.omg.org/spec/KerML/1.0/Beta1/PDF
 */
export class Feature {
  /** 一意識別子 */
  readonly id: string;
  
  /** 特性名 */
  name: string;
  
  /** 短い名前（エイリアス） */
  shortName?: string;
  
  /** 修飾名（完全修飾名） */
  qualifiedName?: string;
  
  /** 可視性（public, private, protected, package) */
  visibility?: 'public' | 'private' | 'protected' | 'package';
  
  /** この特性の所有者となる型 */
  ownerType?: Type;
  
  /** この特性の型 */
  type?: Type;
  
  /** この特性の多重度（複数の範囲を持つ場合がある） */
  multiplicityRanges: MultiplicityRange[] = [];
  
  /** 特性の説明 */
  description?: string;
  
  /** 注釈（コメント） */
  comments: string[] = [];
  
  /** 特性が抽象か（継承のみで実装不可） */
  isAbstract: boolean = false;
  
  /** 特性がリードオンリーかどうか */
  isReadOnly: boolean = false;
  
  /** 特性がデリベーション（派生）かどうか */
  isDerived: boolean = false;
  
  /** 特性が順序つきかどうか */
  isOrdered: boolean = false;
  
  /** 特性が一意かどうか */
  isUnique: boolean = false;
  
  /** 特性がコンポジション（構成要素）かどうか */
  isComposite: boolean = false;
  
  /** 特性の明示的な方向性 */
  direction?: 'in' | 'out' | 'inout';
  
  /** 特性の既定値（存在する場合） */
  defaultValue?: any;
  
  /**
   * Feature コンストラクタ
   * @param name 特性名
   * @param type 特性の型（オプション）
   * @param ownerType 特性の所有者となる型（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    type?: Type,
    ownerType?: Type,
    id?: string
  ) {
    this.id = id || uuidv4();
    this.name = name;
    this.type = type;
    this.ownerType = ownerType;
  }
  
  /**
   * 多重度範囲を追加
   * @param range 追加する多重度範囲
   */
  addMultiplicityRange(range: MultiplicityRange): void {
    this.multiplicityRanges.push(range);
  }
  
  /**
   * 特性がコメントを追加
   * @param comment 追加するコメント
   */
  addComment(comment: string): void {
    this.comments.push(comment);
  }
  
  /**
   * 特性情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      shortName: this.shortName,
      qualifiedName: this.qualifiedName,
      visibility: this.visibility,
      ownerTypeId: this.ownerType?.id,
      ownerTypeName: this.ownerType?.name,
      typeId: this.type?.id,
      typeName: this.type?.name,
      multiplicityRanges: this.multiplicityRanges.map(m => m.toObject()),
      description: this.description,
      comments: this.comments,
      isAbstract: this.isAbstract,
      isReadOnly: this.isReadOnly,
      isDerived: this.isDerived,
      isOrdered: this.isOrdered,
      isUnique: this.isUnique,
      isComposite: this.isComposite,
      direction: this.direction,
      defaultValue: this.defaultValue
    };
  }
}