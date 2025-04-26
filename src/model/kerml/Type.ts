import { v4 as uuidv4 } from 'uuid';
import { KerML_Type } from './interfaces';
import { Feature } from './Feature';

/**
 * KerML Type クラス
 * KerML メタモデルの基本的な型概念を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class Type {
  /** 一意識別子 */
  readonly id: string;
  
  /** 所有者要素ID */
  ownerId?: string;
  
  /** 要素名 */
  name?: string;
  
  /** 短い名前（エイリアス） */
  shortName?: string;
  
  /** 修飾名（完全修飾名） */
  qualifiedName?: string;
  
  /** 説明 */
  description?: string;
  
  /** 抽象型かどうか */
  isAbstract: boolean = false;
  
  /** 共役型かどうか */
  isConjugated: boolean = false;
  
  /** 多重度 (1, 0..1, 1..*, * など) */
  multiplicity?: string;
  
  /** 特化対象の型ID配列 (is-a, specialization関係) */
  specializationIds: string[] = [];
  
  /** 型の特性リスト */
  private _features: Feature[] = [];
  
  /**
   * Type コンストラクタ
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
    multiplicity?: string;
    specializationIds?: string[];
    features?: Feature[];
  } = {}) {
    this.id = options.id || uuidv4();
    this.ownerId = options.ownerId;
    this.name = options.name;
    this.shortName = options.shortName;
    this.qualifiedName = options.qualifiedName;
    this.description = options.description;
    this.multiplicity = options.multiplicity;
    
    if (options.specializationIds) {
      this.specializationIds = [...options.specializationIds];
    }
    
    if (options.isAbstract !== undefined) {
      this.isAbstract = options.isAbstract;
    }
    
    if (options.isConjugated !== undefined) {
      this.isConjugated = options.isConjugated;
    }
    
    if (options.features) {
      this._features = [...options.features];
    }
  }
  
  /**
   * 型の特性を取得
   */
  get features(): Feature[] {
    return [...this._features];
  }
  
  /**
   * 特性を追加
   * @param feature 追加する特性
   */
  addFeature(feature: Feature): void {
    // 特性の所有者を設定
    feature.ownerId = this.id;
    this._features.push(feature);
  }
  
  /**
   * 特性を削除
   * @param featureId 削除する特性のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeFeature(featureId: string): boolean {
    const initialLength = this._features.length;
    this._features = this._features.filter(f => f.id !== featureId);
    return this._features.length !== initialLength;
  }
  
  /**
   * IDで特性を検索
   * @param featureId 検索する特性のID
   * @returns 見つかった特性または undefined
   */
  findFeatureById(featureId: string): Feature | undefined {
    return this._features.find(f => f.id === featureId);
  }
  
  /**
   * 名前で特性を検索
   * @param featureName 検索する特性の名前
   * @returns 見つかった特性または undefined
   */
  findFeatureByName(featureName: string): Feature | undefined {
    return this._features.find(f => f.name === featureName);
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_Type {
    return {
      __type: 'Type',
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      shortName: this.shortName,
      qualifiedName: this.qualifiedName,
      description: this.description,
      isAbstract: this.isAbstract,
      isConjugated: this.isConjugated,
      features: this._features.map(f => f.toJSON()),
      multiplicity: this.multiplicity,
      specializations: this.specializationIds.length > 0 ? this.specializationIds : undefined
    };
  }
  
  /**
   * JSON形式から型を作成
   * @param json JSON表現
   * @returns 型インスタンス
   */
  static fromJSON(json: KerML_Type, featureInstances: Feature[] = []): Type {
    // まず基本的なType情報で初期化
    const type = new Type({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      isAbstract: json.isAbstract,
      isConjugated: json.isConjugated,
      multiplicity: json.multiplicity,
      specializationIds: json.specializations
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === type.id) {
          type.addFeature(feature);
        }
      });
    }
    
    return type;
  }
  
  /**
   * オブジェクトをプレーンなJavaScriptオブジェクトに変換する（UI表示用）
   * @returns プレーンなJavaScriptオブジェクト
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      stereotype: 'type',
      isAbstract: this.isAbstract
    };
  }
}