/**
 * KerML JSONインターフェース定義
 * KerMLメタモデルのシリアライズ／デシリアライズに使用する型定義
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 * 
 * Core要素（§7.3）とKernel要素（§7.4）の両方を含む
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
  __type: string;        // サブクラスがオーバーライドできるよう文字列型に変更
  isAbstract?: boolean;  // 抽象型かどうか
  isConjugated?: boolean; // 共役型かどうか
  features?: KerML_Element[]; // 特性のリスト
  multiplicity?: string;  // 多重度 (1, 0..1, 1..*, * など)
  specializations?: string[]; // 特化対象の型ID配列
}

/**
 * Classifier要素のJSONインターフェース
 */
export interface KerML_Classifier extends KerML_Type {
  __type: string;        // サブクラスがオーバーライドできるよう文字列型に変更
  isFinal?: boolean;     // 密閉クラスかどうか
  isIndividual?: boolean; // 個体クラスかどうか
}

/**
 * Feature要素のJSONインターフェース
 */
export interface KerML_Feature extends KerML_Type {
  __type: string;        // サブクラスがオーバーライドできるよう文字列型に変更
  isUnique?: boolean;    // 一意かどうか
  isOrdered?: boolean;   // 順序付けられているかどうか
  isComposite?: boolean; // コンポジションかどうか
  isPortion?: boolean;   // 部分かどうか
  isReadOnly?: boolean;  // 読み取り専用かどうか
  isDerived?: boolean;   // 派生かどうか
  isEnd?: boolean;       // 関連の終端かどうか
  direction?: 'in' | 'out' | 'inout'; // 方向
  type?: string;         // 型のUUID
  redefinitions?: string[]; // 再定義する特性のIDリスト
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

/**
 * ===== Kernel Layer 要素（§7.4）=====
 */

/**
 * DataType要素のJSONインターフェース
 * 基本的なデータ型（例：Integer, Boolean, String等）を表現
 */
export interface KerML_DataType {
  __type: 'DataType';
  id: string;            // UUID
  ownerId?: string;      // 所有者要素のUUID（ある場合）
  name?: string;         // 名前（任意）
  shortName?: string;    // 短い名前（任意）
  qualifiedName?: string; // 完全修飾名（任意）
  description?: string;  // 説明（任意）
  isAbstract?: boolean;  // 抽象型かどうか
  isConjugated?: boolean; // 共役型かどうか
  isFinal?: boolean;     // 密閉型かどうか
  isIndividual?: boolean; // 個体型かどうか
  features?: KerML_Element[]; // 特性のリスト
}

/**
 * Class要素のJSONインターフェース
 * オブジェクト指向の「クラス」概念を表現
 */
export interface KerML_Class {
  __type: 'Class';
  id: string;            // UUID
  ownerId?: string;      // 所有者要素のUUID（ある場合）
  name?: string;         // 名前（任意）
  shortName?: string;    // 短い名前（任意）
  qualifiedName?: string; // 完全修飾名（任意）
  description?: string;  // 説明（任意）
  isAbstract?: boolean;  // 抽象型かどうか
  isConjugated?: boolean; // 共役型かどうか
  isFinal?: boolean;     // 密閉型かどうか
  isIndividual?: boolean; // 個体型かどうか
  features?: KerML_Element[]; // 特性のリスト
}

/**
 * Structure要素のJSONインターフェース
 * 複合構造を表現（シーケンス、記録など）
 */
export interface KerML_Structure {
  __type: 'Structure';
  id: string;            // UUID
  ownerId?: string;      // 所有者要素のUUID（ある場合）
  name?: string;         // 名前（任意）
  shortName?: string;    // 短い名前（任意）
  qualifiedName?: string; // 完全修飾名（任意）
  description?: string;  // 説明（任意）
  isAbstract?: boolean;  // 抽象型かどうか
  isConjugated?: boolean; // 共役型かどうか
  isFinal?: boolean;     // 密閉型かどうか
  isIndividual?: boolean; // 個体型かどうか
  features?: KerML_Element[]; // 特性のリスト
}

/**
 * Association要素のJSONインターフェース
 * 型間の関連を表現
 */
export interface KerML_Association {
  __type: 'Association';
  id: string;            // UUID
  ownerId?: string;      // 所有者要素のUUID（ある場合）
  name?: string;         // 名前（任意）
  shortName?: string;    // 短い名前（任意）
  qualifiedName?: string; // 完全修飾名（任意）
  description?: string;  // 説明（任意）
  isAbstract?: boolean;  // 抽象型かどうか
  isConjugated?: boolean; // 共役型かどうか
  isFinal?: boolean;     // 密閉型かどうか
  isIndividual?: boolean; // 個体型かどうか
  features?: KerML_Element[]; // 特性のリスト（関連の終端を含む）
  relatedTypes?: string[]; // 関連する型のUUID配列
}

/**
 * Connector要素のJSONインターフェース
 * 要素間の接続を表現
 */
export interface KerML_Connector {
  __type: 'Connector';
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
  direction?: 'in' | 'out' | 'inout'; // 方向
  type?: string;         // 型のUUID
  connectedFeatures?: string[]; // 接続する特性のUUID配列
  features?: KerML_Element[]; // 特性のリスト
}

/**
 * BindingConnector要素のJSONインターフェース
 * 特性間の等価性を表現
 */
export interface KerML_BindingConnector {
  __type: 'BindingConnector';
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
  direction?: 'in' | 'out' | 'inout'; // 方向
  type?: string;         // 型のUUID
  connectedFeatures?: string[]; // 接続する特性のUUID配列
  features?: KerML_Element[]; // 特性のリスト
}

/**
 * Succession要素のJSONインターフェース
 * 時間的な前後関係を表現
 */
export interface KerML_Succession {
  __type: 'Succession';
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
  direction?: 'in' | 'out' | 'inout'; // 方向
  type?: string;         // 型のUUID
  connectedFeatures?: string[]; // 接続する特性のUUID配列
  features?: KerML_Element[]; // 特性のリスト
  effect?: string;       // 効果の記述
  guard?: string;        // ガード条件
}

/**
 * ItemFlow要素のJSONインターフェース
 * 特性間のアイテム流れを表現
 */
export interface KerML_ItemFlow {
  __type: 'ItemFlow';
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
  direction?: 'in' | 'out' | 'inout'; // 方向
  type?: string;         // 型のUUID
  connectedFeatures?: string[]; // 接続する特性のUUID配列
  features?: KerML_Element[]; // 特性のリスト
  itemType?: string;     // アイテムの型UUID
}

/**
 * SuccessionItemFlow要素のJSONインターフェース
 * 時間的な前後関係の中でのアイテム流れを表現
 */
export interface KerML_SuccessionItemFlow {
  __type: 'SuccessionItemFlow';
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
  direction?: 'in' | 'out' | 'inout'; // 方向
  type?: string;         // 型のUUID
  connectedFeatures?: string[]; // 接続する特性のUUID配列
  features?: KerML_Element[]; // 特性のリスト
  itemType?: string;     // アイテムの型UUID
  effect?: string;       // 効果の記述
  guard?: string;        // ガード条件
}

/**
 * Behavior要素のJSONインターフェース
 * 動的な振る舞いを表現
 */
export interface KerML_Behavior {
  __type: 'Behavior';
  id: string;            // UUID
  ownerId?: string;      // 所有者要素のUUID（ある場合）
  name?: string;         // 名前（任意）
  shortName?: string;    // 短い名前（任意）
  qualifiedName?: string; // 完全修飾名（任意）
  description?: string;  // 説明（任意）
  isAbstract?: boolean;  // 抽象型かどうか
  isConjugated?: boolean; // 共役型かどうか
  isFinal?: boolean;     // 密閉型かどうか
  isIndividual?: boolean; // 個体型かどうか
  features?: KerML_Element[]; // 特性のリスト
  steps?: string[];      // ステップのUUID配列
}

/**
 * Step要素のJSONインターフェース
 * 振る舞いの中の単一ステップを表現
 */
export interface KerML_Step {
  __type: 'Step';
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
  direction?: 'in' | 'out' | 'inout'; // 方向
  type?: string;         // 型のUUID
  features?: KerML_Element[]; // 特性のリスト
  behaviorReference?: string; // 参照する振る舞いのUUID
}

/**
 * Function要素のJSONインターフェース
 * 関数的な振る舞いを表現
 */
export interface KerML_Function {
  __type: 'Function';
  id: string;            // UUID
  ownerId?: string;      // 所有者要素のUUID（ある場合）
  name?: string;         // 名前（任意）
  shortName?: string;    // 短い名前（任意）
  qualifiedName?: string; // 完全修飾名（任意）
  description?: string;  // 説明（任意）
  isAbstract?: boolean;  // 抽象型かどうか
  isConjugated?: boolean; // 共役型かどうか
  isFinal?: boolean;     // 密閉型かどうか
  isIndividual?: boolean; // 個体型かどうか
  features?: KerML_Element[]; // 特性のリスト
  steps?: string[];      // ステップのUUID配列
  expression?: string;   // 関数式のUUID
}

/**
 * Expression要素のJSONインターフェース
 * 式を表現
 */
export interface KerML_Expression {
  __type: 'Expression';
  id: string;            // UUID
  ownerId?: string;      // 所有者要素のUUID（ある場合）
  name?: string;         // 名前（任意）
  shortName?: string;    // 短い名前（任意）
  qualifiedName?: string; // 完全修飾名（任意）
  description?: string;  // 説明（任意）
  isAbstract?: boolean;  // 抽象型かどうか
  isConjugated?: boolean; // 共役型かどうか
  isFinal?: boolean;     // 密閉型かどうか
  isIndividual?: boolean; // 個体型かどうか
  features?: KerML_Element[]; // 特性のリスト
  steps?: string[];      // ステップのUUID配列
  body?: string;         // 式本体
  result?: string;       // 結果への参照
}

/**
 * Predicate要素のJSONインターフェース
 * ブール述語（条件）を表現
 */
export interface KerML_Predicate {
  __type: 'Predicate';
  id: string;            // UUID
  ownerId?: string;      // 所有者要素のUUID（ある場合）
  name?: string;         // 名前（任意）
  shortName?: string;    // 短い名前（任意）
  qualifiedName?: string; // 完全修飾名（任意）
  description?: string;  // 説明（任意）
  isAbstract?: boolean;  // 抽象型かどうか
  isConjugated?: boolean; // 共役型かどうか
  isFinal?: boolean;     // 密閉型かどうか
  isIndividual?: boolean; // 個体型かどうか
  features?: KerML_Element[]; // 特性のリスト
  steps?: string[];      // ステップのUUID配列
  body?: string;         // 述語本体
}

/**
 * Interaction要素のJSONインターフェース
 * 相互作用を表現
 */
export interface KerML_Interaction {
  __type: 'Interaction';
  id: string;            // UUID
  ownerId?: string;      // 所有者要素のUUID（ある場合）
  name?: string;         // 名前（任意）
  shortName?: string;    // 短い名前（任意）
  qualifiedName?: string; // 完全修飾名（任意）
  description?: string;  // 説明（任意）
  isAbstract?: boolean;  // 抽象型かどうか
  isConjugated?: boolean; // 共役型かどうか
  isFinal?: boolean;     // 密閉型かどうか
  isIndividual?: boolean; // 個体型かどうか
  features?: KerML_Element[]; // 特性のリスト
  steps?: string[];      // ステップのUUID配列
  participants?: string[]; // 参加者のUUID配列
}

/**
 * FeatureValue要素のJSONインターフェース
 * 特性の値を表現
 */
export interface KerML_FeatureValue {
  __type: 'FeatureValue';
  id: string;            // UUID
  ownerId?: string;      // 所有者要素のUUID（ある場合）
  name?: string;         // 名前（任意）
  shortName?: string;    // 短い名前（任意）
  qualifiedName?: string; // 完全修飾名（任意）
  description?: string;  // 説明（任意）
  featureId: string;     // 値を持つ特性のUUID
  value?: any;           // 特性の値
  isDefault?: boolean;   // デフォルト値かどうか
}

/**
 * MetadataFeature要素のJSONインターフェース
 * メタデータを表現する特性
 */
export interface KerML_MetadataFeature {
  __type: 'MetadataFeature';
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
  direction?: 'in' | 'out' | 'inout'; // 方向
  type?: string;         // 型のUUID
  features?: KerML_Element[]; // 特性のリスト
  annotatedElements?: string[]; // 注釈を付ける要素のUUID配列
}

/**
 * Package要素のJSONインターフェース
 * 要素のグループ化を表現
 */
export interface KerML_Package {
  __type: 'Package';
  id: string;            // UUID
  ownerId?: string;      // 所有者要素のUUID（ある場合）
  name?: string;         // 名前（任意）
  shortName?: string;    // 短い名前（任意）
  qualifiedName?: string; // 完全修飾名（任意）
  description?: string;  // 説明（任意）
  elements?: KerML_Element[]; // パッケージに含まれる要素のリスト
  imports?: string[];    // インポートするパッケージのUUID配列
}