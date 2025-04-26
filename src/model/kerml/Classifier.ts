import { v4 as uuidv4 } from 'uuid';
import { Type } from './Type';

/**
 * KerML Classifier クラス
 * KerML メタモデルのClassifier概念を表現する
 * @see https://www.omg.org/spec/KerML/1.0/Beta1/PDF
 */
export class Classifier {
  /** 一意識別子 */
  readonly id: string;
  
  /** この分類子の所有者となる型 */
  ownerType?: Type;
  
  /** 分類子がメタクラスかどうか */
  isMetaclass: boolean = false;
  
  /** 分類子が抽象クラスかどうか */
  isAbstract: boolean = false;
  
  /** 分類子が密閉クラスかどうか（拡張できないクラス） */
  isFinal: boolean = false;
  
  /** 分類子が個体クラスかどうか（インスタンスの識別性を持つ） */
  isIndividual: boolean = false;
  
  /**
   * Classifier コンストラクタ
   * @param ownerType この分類子の所有者となる型（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   * @param isAbstract 抽象クラスかどうか
   * @param isFinal 密閉クラスかどうか
   * @param isMetaclass メタクラスかどうか
   * @param isIndividual 個体クラスかどうか
   */
  constructor(
    ownerType?: Type,
    id?: string,
    isAbstract: boolean = false,
    isFinal: boolean = false,
    isMetaclass: boolean = false,
    isIndividual: boolean = false
  ) {
    this.id = id || uuidv4();
    this.ownerType = ownerType;
    this.isAbstract = isAbstract;
    this.isFinal = isFinal;
    this.isMetaclass = isMetaclass;
    this.isIndividual = isIndividual;
    
    // 所有者の型が指定されている場合、その型のclassifierを自身に設定
    if (ownerType) {
      ownerType.classifier = this;
    }
  }
  
  /**
   * 分類子情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      ownerTypeId: this.ownerType?.id,
      ownerTypeName: this.ownerType?.name,
      isMetaclass: this.isMetaclass,
      isAbstract: this.isAbstract,
      isFinal: this.isFinal,
      isIndividual: this.isIndividual
    };
  }
}