import { v4 as uuidv4 } from 'uuid';
import { KerML_Union } from './interfaces';
import { Type } from './Type';
import { Feature } from './Feature';

/**
 * KerML Union クラス
 * KerML メタモデルの合成型概念を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class Union extends Type {
  /** 合成する型のID配列 */
  operands: string[] = [];
  
  /**
   * Union コンストラクタ
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
   * 合成する型を追加
   * @param typeId 追加する型のID
   */
  addOperand(typeId: string): void {
    if (!this.operands.includes(typeId)) {
      this.operands.push(typeId);
    }
  }
  
  /**
   * 合成する型を削除
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
  toJSON(): KerML_Union {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'Union',
      operands: [...this.operands]
    } as KerML_Union;
  }
  
  /**
   * JSON形式から合成型を作成
   * @param json JSON表現
   * @returns 合成型インスタンス
   */
  static fromJSON(json: KerML_Union, featureInstances: Feature[] = []): Union {
    // 基本的なType情報でUnionを初期化
    const union = new Union({
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
        if (feature.ownerId === union.id) {
          union.addFeature(feature);
        }
      });
    }
    
    return union;
  }
}