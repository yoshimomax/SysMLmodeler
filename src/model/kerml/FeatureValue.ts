import { v4 as uuidv4 } from 'uuid';
import { KerML_FeatureValue } from './interfaces';

/**
 * KerML FeatureValue クラス
 * KerML メタモデルの特性の値を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class FeatureValue {
  /** 特性値の一意識別子 */
  readonly id: string;
  
  /** 所有者要素のID */
  ownerId?: string;
  
  /** 名前 */
  name?: string;
  
  /** 短い名前 */
  shortName?: string;
  
  /** 完全修飾名 */
  qualifiedName?: string;
  
  /** 説明 */
  description?: string;
  
  /** 値を持つ特性のID */
  featureId: string;
  
  /** 特性の値 */
  value?: any;
  
  /** デフォルト値かどうか */
  isDefault?: boolean;
  
  /**
   * FeatureValue コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    ownerId?: string;
    name?: string;
    shortName?: string;
    qualifiedName?: string;
    description?: string;
    featureId: string;
    value?: any;
    isDefault?: boolean;
  }) {
    this.id = options.id || uuidv4();
    this.ownerId = options.ownerId;
    this.name = options.name;
    this.shortName = options.shortName;
    this.qualifiedName = options.qualifiedName;
    this.description = options.description;
    this.featureId = options.featureId;
    this.value = options.value;
    this.isDefault = options.isDefault;
  }
  
  /**
   * 値を設定する
   * @param value 新しい値
   */
  setValue(value: any): void {
    this.value = value;
  }
  
  /**
   * デフォルト値フラグを設定する
   * @param isDefault デフォルト値かどうか
   */
  setIsDefault(isDefault: boolean): void {
    this.isDefault = isDefault;
  }
  
  /**
   * JSON形式に変換
   * @returns 特性値のJSON表現
   */
  toJSON(): KerML_FeatureValue {
    return {
      __type: 'FeatureValue',
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      shortName: this.shortName,
      qualifiedName: this.qualifiedName,
      description: this.description,
      featureId: this.featureId,
      value: this.value,
      isDefault: this.isDefault
    };
  }
  
  /**
   * JSON形式から特性値を作成
   * @param json JSON表現
   * @returns 特性値インスタンス
   */
  static fromJSON(json: KerML_FeatureValue): FeatureValue {
    return new FeatureValue({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      featureId: json.featureId,
      value: json.value,
      isDefault: json.isDefault
    });
  }
}