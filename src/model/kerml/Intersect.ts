import { v4 as uuidv4 } from 'uuid';
import { KerML_Intersect } from './interfaces';
import { Type } from './Type';
import { Feature } from './Feature';

/**
 * KerML Intersect クラス
 * KerML メタモデルの交差型概念を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class Intersect extends Type {
  /** 交差する型のID配列 */
  operands: string[] = [];
  
  /**
   * Intersect コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    ownerId?: string;
    name?: string;
    shortName?: string;
    qualifiedName?: string;
    description?: string;
    isAbstract?: boolean;
    isConjugated?: boolean;
    features?: Feature[];
    operands?: string[];
  } = {}) {
    // 親クラスのコンストラクタを呼び出し
    super({
      id: options.id,
      ownerId: options.ownerId,
      name: options.name,
      shortName: options.shortName,
      qualifiedName: options.qualifiedName,
      description: options.description,
      isAbstract: options.isAbstract,
      isConjugated: options.isConjugated,
      features: options.features
    });
    
    if (options.operands) {
      this.operands = [...options.operands];
    }
  }
  
  /**
   * 交差する型を追加
   * @param typeId 追加する型のID
   */
  addOperand(typeId: string): void {
    if (!this.operands.includes(typeId)) {
      this.operands.push(typeId);
    }
  }
  
  /**
   * 交差する型を削除
   * @param typeId 削除する型のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeOperand(typeId: string): boolean {
    const initialLength = this.operands.length;
    this.operands = this.operands.filter(id => id !== typeId);
    return this.operands.length !== initialLength;
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_Intersect {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'Intersect',
      operands: [...this.operands]
    } as KerML_Intersect;
  }
  
  /**
   * JSON形式から交差型を作成
   * @param json JSON表現
   * @returns 交差型インスタンス
   */
  static fromJSON(json: KerML_Intersect, featureInstances: Feature[] = []): Intersect {
    // 基本的なType情報でIntersectを初期化
    const intersect = new Intersect({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      isAbstract: json.isAbstract,
      isConjugated: json.isConjugated,
      operands: json.operands
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === intersect.id) {
          intersect.addFeature(feature);
        }
      });
    }
    
    return intersect;
  }
}