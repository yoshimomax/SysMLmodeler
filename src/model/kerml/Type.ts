import { v4 as uuidv4 } from 'uuid';
import { Feature } from './Feature';
import { Classifier } from './Classifier';
import { MultiplicityRange } from './MultiplicityRange';

/**
 * KerML Type クラス
 * KerML メタモデルのコア要素でType概念を表現する
 * @see https://www.omg.org/spec/KerML/1.0/Beta1/PDF
 */
export class Type {
  /** 一意識別子 */
  readonly id: string;
  
  /** 要素名 */
  name: string;
  
  /** 短い名前（エイリアス） */
  shortName?: string;
  
  /** 修飾名（完全修飾名） */
  qualifiedName?: string;
  
  /** 可視性（public, private, protected, package) */
  visibility?: 'public' | 'private' | 'protected' | 'package';
  
  /** この型の特性（Features）のリスト */
  features: Feature[] = [];
  
  /** この型の多重度（複数の範囲を持つ場合がある） */
  multiplicityRanges: MultiplicityRange[] = [];
  
  /** この型の一般化（継承）関係にある型のリスト */
  generalTypes: Type[] = [];
  
  /** この型が分類子の場合の情報 */
  classifier?: Classifier;
  
  /** 型の説明 */
  description?: string;
  
  /** 注釈（コメント） */
  comments: string[] = [];
  
  /** 型が抽象か（継承のみで実装不可） */
  isAbstract: boolean = false;
  
  /**
   * 型コンストラクタ
   * @param name 型の名前
   * @param features 型の特性のリスト（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   * @param isAbstract 抽象型かどうか
   */
  constructor(
    name: string,
    features: Feature[] = [],
    id?: string,
    isAbstract: boolean = false
  ) {
    this.id = id || uuidv4();
    this.name = name;
    this.features = features;
    this.isAbstract = isAbstract;
    
    // 特性の所有者を設定
    this.features.forEach(feature => {
      feature.ownerType = this;
    });
  }
  
  /**
   * 特性（Feature）を追加
   * @param feature 追加する特性
   */
  addFeature(feature: Feature): void {
    feature.ownerType = this;
    this.features.push(feature);
  }
  
  /**
   * 特性（Feature）を削除
   * @param featureId 削除する特性のID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeFeature(featureId: string): boolean {
    const initialLength = this.features.length;
    this.features = this.features.filter(f => f.id !== featureId);
    return this.features.length !== initialLength;
  }
  
  /**
   * 多重度範囲を追加
   * @param range 追加する多重度範囲
   */
  addMultiplicityRange(range: MultiplicityRange): void {
    this.multiplicityRanges.push(range);
  }
  
  /**
   * 一般化（継承）関係にある型を追加
   * @param type 一般化関係にある型
   */
  addGeneralType(type: Type): void {
    this.generalTypes.push(type);
  }
  
  /**
   * 型がコメントを追加
   * @param comment 追加するコメント
   */
  addComment(comment: string): void {
    this.comments.push(comment);
  }
  
  /**
   * 型情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      shortName: this.shortName,
      qualifiedName: this.qualifiedName,
      visibility: this.visibility,
      features: this.features.map(f => f.toObject()),
      multiplicityRanges: this.multiplicityRanges.map(m => m.toObject()),
      generalTypes: this.generalTypes.map(t => ({ id: t.id, name: t.name })),
      classifier: this.classifier?.toObject(),
      description: this.description,
      comments: this.comments,
      isAbstract: this.isAbstract
    };
  }
}