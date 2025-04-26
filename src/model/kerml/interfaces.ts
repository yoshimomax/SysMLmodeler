/**
 * KerML JSONインターフェース定義
 * KerMLメタモデルのシリアライズ／デシリアライズに使用する型定義
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */

/**
 * KerML要素の共通基本インターフェース
 */
export interface KerML_Element {
  id: string;            // UUID
  ownerId?: string;      // 所有者要素のUUID（ある場合）
  name?: string;         // 名前（任意）
  shortName?: string;    // 短い名前（任意）
  qualifiedName?: string; // 完全修飾名（任意）
  description?: string;  // 説明（任意）
  __type: string;        // 型識別子
}

/**
 * Type要素のJSONインターフェース
 */
export interface KerML_Type extends KerML_Element {
  __type: 'Type';
  isAbstract?: boolean;  // 抽象型かどうか
  isConjugated?: boolean; // 共役型かどうか
  features?: KerML_Element[]; // 特性のリスト
}

/**
 * Classifier要素のJSONインターフェース
 */
export interface KerML_Classifier {
  __type: 'Classifier';
  id: string;            // UUID
  ownerId?: string;      // 所有者要素のUUID（ある場合）
  name?: string;         // 名前（任意）
  shortName?: string;    // 短い名前（任意）
  qualifiedName?: string; // 完全修飾名（任意）
  description?: string;  // 説明（任意）
  isAbstract?: boolean;  // 抽象クラスかどうか
  isFinal?: boolean;     // 密閉クラスかどうか
  isConjugated?: boolean; // 共役クラスかどうか
  isIndividual?: boolean; // 個体クラスかどうか
  features?: KerML_Element[]; // 特性のリスト
}

/**
 * Feature要素のJSONインターフェース
 */
export interface KerML_Feature {
  __type: 'Feature';
  id: string;            // UUID
  ownerId?: string;      // 所有者要素のUUID（ある場合）
  name?: string;         // 名前（任意）
  shortName?: string;    // 短い名前（任意）
  qualifiedName?: string; // 完全修飾名（任意）
  description?: string;  // 説明（任意）
  isAbstract?: boolean;  // 抽象型かどうか
  isConjugated?: boolean; // 共役型かどうか
  isUnique?: boolean;    // 一意かどうか
  isOrdered?: boolean;   // 順序付けられているかどうか
  isComposite?: boolean; // コンポジションかどうか
  isPortion?: boolean;   // 部分かどうか
  isReadOnly?: boolean;  // 読み取り専用かどうか
  isDerived?: boolean;   // 派生かどうか
  isEnd?: boolean;       // 関連の終端かどうか
  direction?: 'in' | 'out' | 'inout'; // 方向
  type?: string;         // 型のUUID
  features?: KerML_Element[]; // 特性のリスト
}

/**
 * MultiplicityRange要素のJSONインターフェース
 */
export interface KerML_MultiplicityRange extends KerML_Element {
  __type: 'MultiplicityRange';
  lowerBound: number;    // 下限値
  upperBound: number;    // 上限値（-1は無限大）
  boundingType?: string; // 境界の型UUID
}

/**
 * Specialization要素のJSONインターフェース
 */
export interface KerML_Specialization extends KerML_Element {
  __type: 'Specialization';
  general: string;       // 一般型のUUID
  specific: string;      // 特定型のUUID
}

/**
 * Conjugation要素のJSONインターフェース
 */
export interface KerML_Conjugation extends KerML_Element {
  __type: 'Conjugation';
  originalType: string;  // 元の型のUUID
  conjugatedType: string; // 共役型のUUID
}

/**
 * FeatureMembership要素のJSONインターフェース
 */
export interface KerML_FeatureMembership extends KerML_Element {
  __type: 'FeatureMembership';
  owningType: string;    // 所有型のUUID
  memberFeature: string; // メンバー特性のUUID
}

/**
 * TypeFeaturing要素のJSONインターフェース
 */
export interface KerML_TypeFeaturing extends KerML_Element {
  __type: 'TypeFeaturing';
  featuringType: string; // 特性を持つ型のUUID
  featuredType: string;  // 特性として使われる型のUUID
}

/**
 * FeatureChaining要素のJSONインターフェース
 */
export interface KerML_FeatureChaining extends KerML_Element {
  __type: 'FeatureChaining';
  chainingFeature: string; // チェーン特性のUUID
  featuredBy: string;     // 特性を持つ要素のUUID
}

/**
 * FeatureInverting要素のJSONインターフェース
 */
export interface KerML_FeatureInverting extends KerML_Element {
  __type: 'FeatureInverting';
  featureInverted: string; // 反転される特性のUUID
  invertingFeature: string; // 反転する特性のUUID
}

/**
 * Union型要素のJSONインターフェース
 */
export interface KerML_Union {
  __type: 'Union';
  id: string;            // UUID
  ownerId?: string;      // 所有者要素のUUID（ある場合）
  name?: string;         // 名前（任意）
  shortName?: string;    // 短い名前（任意）
  qualifiedName?: string; // 完全修飾名（任意）
  description?: string;  // 説明（任意）
  isAbstract?: boolean;  // 抽象型かどうか
  isConjugated?: boolean; // 共役型かどうか
  features?: KerML_Element[]; // 特性のリスト
  operands: string[];    // 演算対象型のUUID配列
}

/**
 * Intersect型要素のJSONインターフェース
 */
export interface KerML_Intersect {
  __type: 'Intersect';
  id: string;            // UUID
  ownerId?: string;      // 所有者要素のUUID（ある場合）
  name?: string;         // 名前（任意）
  shortName?: string;    // 短い名前（任意）
  qualifiedName?: string; // 完全修飾名（任意）
  description?: string;  // 説明（任意）
  isAbstract?: boolean;  // 抽象型かどうか
  isConjugated?: boolean; // 共役型かどうか
  features?: KerML_Element[]; // 特性のリスト
  operands: string[];    // 演算対象型のUUID配列
}

/**
 * Difference型要素のJSONインターフェース
 */
export interface KerML_Difference {
  __type: 'Difference';
  id: string;            // UUID
  ownerId?: string;      // 所有者要素のUUID（ある場合）
  name?: string;         // 名前（任意）
  shortName?: string;    // 短い名前（任意）
  qualifiedName?: string; // 完全修飾名（任意）
  description?: string;  // 説明（任意）
  isAbstract?: boolean;  // 抽象型かどうか
  isConjugated?: boolean; // 共役型かどうか
  features?: KerML_Element[]; // 特性のリスト
  firstOperand: string;   // 第1オペランドのUUID
  secondOperand: string;  // 第2オペランドのUUID
}