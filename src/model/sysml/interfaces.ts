/**
 * SysML v2 JSONインターフェース定義
 * SysML v2メタモデルのシリアライズ／デシリアライズに使用する型定義
 * OMG仕様：PTC/2023-02-02、SysML v2 Beta1
 * 
 * KerMLのインターフェースを拡張し、SysML固有の構成要素を追加
 */

import { KerML_Element, KerML_Type, KerML_Feature, KerML_Behavior } from '../kerml/interfaces';

/**
 * SysML_Element基本インターフェース
 * KerML_Elementを継承し、SysML特有の属性を追加
 */
export interface SysML_Element extends KerML_Element {
  /**
   * SysMLのステレオタイプ（例：block, part, requirement など）
   */
  stereotype?: string;
}

/**
 * SysML_Part要素のJSONインターフェース
 * システムの構造要素を表現
 */
export interface SysML_Part extends SysML_Element, KerML_Feature {
  __type: 'Part';
  isComposite?: boolean;    // コンポジション関係か
  multiplicity?: string;    // 多重度（例: "1", "0..1", "1..*", "*"）
  typeId?: string;          // 型のUUID
  referencedPartId?: string; // 参照する部品のUUID（代替表現の場合）
  isAbstract?: boolean;     // 抽象要素かどうか
  ports?: string[];         // ポートのUUID配列
}

/**
 * SysML_Block要素のJSONインターフェース
 * システムの型を表現
 */
export interface SysML_Block extends SysML_Element, KerML_Type {
  __type: 'Block';
  isAbstract?: boolean;     // 抽象ブロックかどうか
  specializationIds?: string[]; // 特化関係のUUID配列
  propertyIds?: string[];   // プロパティのUUID配列
  portIds?: string[];       // ポートのUUID配列
}

/**
 * SysML_Port要素のJSONインターフェース
 * システムのインターフェースポイントを表現
 */
export interface SysML_Port extends SysML_Element, KerML_Feature {
  __type: 'Port';
  direction?: 'in' | 'out' | 'inout' | 'none'; // 方向
  isService?: boolean;      // サービスポートかどうか
  isConjugated?: boolean;   // 共役ポートかどうか
  typeId?: string;          // ポート型のUUID
  parentId: string;         // 親要素のUUID
}

/**
 * SysML_Connector要素のJSONインターフェース
 * システム要素間の接続を表現
 */
export interface SysML_Connector extends SysML_Element {
  __type: 'Connector';
  sourceId: string;         // 接続元のUUID
  targetId: string;         // 接続先のUUID
  sourcePortId?: string;    // 接続元ポートのUUID（オプション）
  targetPortId?: string;    // 接続先ポートのUUID（オプション）
  typeId?: string;          // コネクタの型（関連）のUUID
  parentId: string;         // 親要素のUUID
}

/**
 * SysML_ItemFlow要素のJSONインターフェース
 * コネクタを通じて流れるアイテムを表現
 */
export interface SysML_ItemFlow extends SysML_Element {
  __type: 'ItemFlow';
  connectorId: string;      // 関連するコネクタのUUID
  itemTypeId: string;       // アイテムの型のUUID
  sourceId: string;         // 送信元のUUID
  targetId: string;         // 送信先のUUID
}

/**
 * SysML_Requirement要素のJSONインターフェース
 * システム要件を表現
 */
export interface SysML_Requirement extends SysML_Element, KerML_Type {
  __type: 'Requirement';
  id: string;               // UUID
  text: string;             // 要件テキスト
  rationale?: string;       // 根拠
  criticality?: string;     // 重要度
  status?: string;          // ステータス
  verifiedBy?: string[];    // 検証する要素のUUID配列
  satisfiedBy?: string[];   // 満足する要素のUUID配列
  refinedBy?: string[];     // 洗練する要素のUUID配列
  tracedTo?: string[];      // トレースする要素のUUID配列
}

/**
 * SysML_Action要素のJSONインターフェース
 * アクティビティの中の個別アクションを表現
 */
export interface SysML_Action extends SysML_Element, KerML_Behavior {
  __type: 'Action';
  inputParameters?: string[]; // 入力パラメータのUUID配列
  outputParameters?: string[]; // 出力パラメータのUUID配列
  localPrecondition?: string; // 局所的な事前条件
  localPostcondition?: string; // 局所的な事後条件
}

/**
 * SysML_Activity要素のJSONインターフェース
 * 一連のアクションから成る活動を表現
 */
export interface SysML_Activity extends SysML_Element, KerML_Behavior {
  __type: 'Activity';
  isReentrant?: boolean;    // 再入可能かどうか
  isReadOnly?: boolean;     // 読み取り専用かどうか
  isSingleExecution?: boolean; // 単一実行かどうか
  precondition?: string;    // 事前条件
  postcondition?: string;   // 事後条件
  parameters?: string[];    // パラメータのUUID配列
  nodes?: string[];         // アクティビティノードのUUID配列
  edges?: string[];         // アクティビティエッジのUUID配列
}

/**
 * SysML_State要素のJSONインターフェース
 * ステートマシンの状態を表現
 */
export interface SysML_State extends SysML_Element, KerML_Behavior {
  __type: 'State';
  isInitial?: boolean;      // 初期状態かどうか
  isFinal?: boolean;        // 最終状態かどうか
  isComposite?: boolean;    // 複合状態かどうか
  isOrthogonal?: boolean;   // 直交状態かどうか
  entryAction?: string;     // 入場アクションのUUID
  exitAction?: string;      // 退場アクションのUUID
  doActivity?: string;      // 状態内活動のUUID
  substates?: string[];     // サブ状態のUUID配列（複合状態の場合）
}

/**
 * SysML_Transition要素のJSONインターフェース
 * ステート間の遷移を表現
 */
export interface SysML_Transition extends SysML_Element {
  __type: 'Transition';
  sourceId: string;         // 遷移元状態のUUID
  targetId: string;         // 遷移先状態のUUID
  guard?: string;           // ガード条件
  trigger?: string;         // トリガーイベント
  effect?: string;          // 遷移時効果（アクション）
  parentId: string;         // 親ステートマシンのUUID
}

/**
 * SysML_StateMachine要素のJSONインターフェース
 * 状態遷移モデルを表現
 */
export interface SysML_StateMachine extends SysML_Element, KerML_Behavior {
  __type: 'StateMachine';
  states: string[];         // 状態のUUID配列
  transitions: string[];    // 遷移のUUID配列
  initialStateId?: string;  // 初期状態のUUID
}

/**
 * SysML_ViewDefinition要素のJSONインターフェース
 * ビュー定義を表現
 */
export interface SysML_ViewDefinition extends SysML_Element, KerML_Type {
  __type: 'ViewDefinition';
  renderedElements?: string[]; // 表示する要素のUUID配列
  viewpointId?: string;     // 関連するビューポイントのUUID
}

/**
 * SysML_View要素のJSONインターフェース
 * ビューインスタンスを表現
 */
export interface SysML_View extends SysML_Element {
  __type: 'View';
  viewDefinitionId: string; // ビュー定義のUUID
  renderedElements: string[]; // 実際に表示される要素のUUID配列
}

/**
 * SysML_Viewpoint要素のJSONインターフェース
 * 関心事を表すビューポイントを表現
 */
export interface SysML_Viewpoint extends SysML_Element, KerML_Type {
  __type: 'Viewpoint';
  concerns: string[];       // 関心事
  stakeholders: string[];   // ステークホルダー
  methods?: string[];       // メソッド
  languages?: string[];     // 言語
}

/**
 * SysML_Package要素のJSONインターフェース
 * モデル要素のグループ化を表現
 */
export interface SysML_Package extends SysML_Element {
  __type: 'Package';
  elementIds: string[];     // 含まれる要素のUUID配列
  subpackageIds?: string[]; // サブパッケージのUUID配列
  parentPackageId?: string; // 親パッケージのUUID
}

/**
 * SysML_Model要素のJSONインターフェース
 * SysML v2モデル全体を表現
 */
export interface SysML_Model extends SysML_Element {
  __type: 'Model';
  name: string;             // モデル名
  rootPackageIds: string[]; // ルートパッケージのUUID配列
  elements: SysML_Element[]; // すべてのモデル要素の配列
}