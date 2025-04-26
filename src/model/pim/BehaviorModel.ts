import { v4 as uuidv4 } from 'uuid';
import { BlockDefinition } from '../sysml2/BlockDefinition';
import { Feature } from '../kerml/Feature';
import { Type } from '../kerml/Type';

/**
 * ActivityModel クラス
 * システムやコンポーネントの振る舞いを活動図で表現するモデル
 */
export class ActivityModel {
  /** 一意識別子 */
  readonly id: string;
  
  /** アクティビティモデル名 */
  name: string;
  
  /** アクティビティモデルの説明 */
  description?: string;
  
  /** このアクティビティモデルが記述する対象のブロック/要素 */
  owner?: BlockDefinition;
  
  /** アクティビティのリスト */
  activities: Activity[] = [];
  
  /** アクションのリスト */
  actions: Action[] = [];
  
  /** オブジェクトノードのリスト */
  objectNodes: ObjectNode[] = [];
  
  /** 制御フローのリスト */
  controlFlows: ControlFlow[] = [];
  
  /** オブジェクトフローのリスト */
  objectFlows: ObjectFlow[] = [];
  
  /** 開始ノードのID */
  initialNodeId?: string;
  
  /** 終了ノードのIDリスト */
  finalNodeIds: string[] = [];
  
  /**
   * ActivityModel コンストラクタ
   * @param name アクティビティモデル名
   * @param owner モデルの所有者（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    owner?: BlockDefinition,
    id?: string
  ) {
    this.id = id || uuidv4();
    this.name = name;
    this.owner = owner;
  }
  
  /**
   * アクティビティを追加する
   * @param activity 追加するアクティビティ
   */
  addActivity(activity: Activity): void {
    activity.ownerModel = this;
    this.activities.push(activity);
  }
  
  /**
   * アクションを追加する
   * @param action 追加するアクション
   */
  addAction(action: Action): void {
    action.ownerModel = this;
    this.actions.push(action);
  }
  
  /**
   * オブジェクトノードを追加する
   * @param objectNode 追加するオブジェクトノード
   */
  addObjectNode(objectNode: ObjectNode): void {
    objectNode.ownerModel = this;
    this.objectNodes.push(objectNode);
  }
  
  /**
   * 制御フローを追加する
   * @param controlFlow 追加する制御フロー
   */
  addControlFlow(controlFlow: ControlFlow): void {
    controlFlow.ownerModel = this;
    this.controlFlows.push(controlFlow);
  }
  
  /**
   * オブジェクトフローを追加する
   * @param objectFlow 追加するオブジェクトフロー
   */
  addObjectFlow(objectFlow: ObjectFlow): void {
    objectFlow.ownerModel = this;
    this.objectFlows.push(objectFlow);
  }
  
  /**
   * アクティビティモデルの情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      ownerId: this.owner?.id,
      ownerName: this.owner?.name,
      activities: this.activities.map(a => a.toObject()),
      actions: this.actions.map(a => a.toObject()),
      objectNodes: this.objectNodes.map(n => n.toObject()),
      controlFlows: this.controlFlows.map(f => f.toObject()),
      objectFlows: this.objectFlows.map(f => f.toObject()),
      initialNodeId: this.initialNodeId,
      finalNodeIds: this.finalNodeIds
    };
  }
}

/**
 * Activity クラス
 * アクティビティを表現する
 */
export class Activity {
  /** 一意識別子 */
  readonly id: string;
  
  /** アクティビティ名 */
  name: string;
  
  /** アクティビティの説明 */
  description?: string;
  
  /** このアクティビティの所有者となるモデル */
  ownerModel?: ActivityModel;
  
  /** 親アクティビティ（階層化されている場合） */
  parentActivity?: Activity;
  
  /** 子アクティビティ（階層化されている場合） */
  childActivities: Activity[] = [];
  
  /** アクティビティに含まれるアクション */
  actions: Action[] = [];
  
  /** アクティビティの入力パラメータ */
  inputParameters: Parameter[] = [];
  
  /** アクティビティの出力パラメータ */
  outputParameters: Parameter[] = [];
  
  /** アクティビティの事前条件 */
  preconditions: string[] = [];
  
  /** アクティビティの事後条件 */
  postconditions: string[] = [];
  
  /** UI上の位置情報（オプション） */
  position?: { x: number; y: number };
  
  /** UI上のサイズ情報（オプション） */
  size?: { width: number; height: number };
  
  /**
   * Activity コンストラクタ
   * @param name アクティビティ名
   * @param ownerModel 所有者となるモデル（オプション）
   * @param parentActivity 親アクティビティ（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    ownerModel?: ActivityModel,
    parentActivity?: Activity,
    id?: string
  ) {
    this.id = id || uuidv4();
    this.name = name;
    this.ownerModel = ownerModel;
    this.parentActivity = parentActivity;
    
    // 親アクティビティの子リストに自身を追加
    if (parentActivity) {
      parentActivity.childActivities.push(this);
    }
  }
  
  /**
   * アクションを追加する
   * @param action 追加するアクション
   */
  addAction(action: Action): void {
    action.parentActivity = this;
    this.actions.push(action);
  }
  
  /**
   * 入力パラメータを追加する
   * @param parameter 追加する入力パラメータ
   */
  addInputParameter(parameter: Parameter): void {
    parameter.parentActivity = this;
    parameter.direction = 'in';
    this.inputParameters.push(parameter);
  }
  
  /**
   * 出力パラメータを追加する
   * @param parameter 追加する出力パラメータ
   */
  addOutputParameter(parameter: Parameter): void {
    parameter.parentActivity = this;
    parameter.direction = 'out';
    this.outputParameters.push(parameter);
  }
  
  /**
   * アクティビティの情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      ownerModelId: this.ownerModel?.id,
      parentActivityId: this.parentActivity?.id,
      parentActivityName: this.parentActivity?.name,
      childActivities: this.childActivities.map(a => a.toObject()),
      actions: this.actions.map(a => a.toObject()),
      inputParameters: this.inputParameters.map(p => p.toObject()),
      outputParameters: this.outputParameters.map(p => p.toObject()),
      preconditions: this.preconditions,
      postconditions: this.postconditions,
      position: this.position,
      size: this.size
    };
  }
}

/**
 * Action クラス
 * アクティビティ内の個別動作を表現する
 */
export class Action {
  /** 一意識別子 */
  readonly id: string;
  
  /** アクション名 */
  name: string;
  
  /** アクションの説明 */
  description?: string;
  
  /** このアクションの所有者となるモデル */
  ownerModel?: ActivityModel;
  
  /** このアクションの親アクティビティ */
  parentActivity?: Activity;
  
  /** アクションの入力ピン */
  inputPins: Pin[] = [];
  
  /** アクションの出力ピン */
  outputPins: Pin[] = [];
  
  /** アクションの種類 */
  actionKind?: 'call' | 'send' | 'accept' | 'create' | 'destroy' | 'read' | 'write';
  
  /** 呼び出し操作（callアクションの場合） */
  calledOperation?: string;
  
  /** 呼び出し振る舞い（callアクションの場合） */
  calledBehavior?: string;
  
  /** UI上の位置情報（オプション） */
  position?: { x: number; y: number };
  
  /** UI上のサイズ情報（オプション） */
  size?: { width: number; height: number };
  
  /**
   * Action コンストラクタ
   * @param name アクション名
   * @param ownerModel 所有者となるモデル（オプション）
   * @param parentActivity 親アクティビティ（オプション）
   * @param actionKind アクションの種類（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    ownerModel?: ActivityModel,
    parentActivity?: Activity,
    actionKind?: 'call' | 'send' | 'accept' | 'create' | 'destroy' | 'read' | 'write',
    id?: string
  ) {
    this.id = id || uuidv4();
    this.name = name;
    this.ownerModel = ownerModel;
    this.parentActivity = parentActivity;
    this.actionKind = actionKind;
  }
  
  /**
   * 入力ピンを追加する
   * @param pin 追加する入力ピン
   */
  addInputPin(pin: Pin): void {
    pin.ownerAction = this;
    pin.direction = 'in';
    this.inputPins.push(pin);
  }
  
  /**
   * 出力ピンを追加する
   * @param pin 追加する出力ピン
   */
  addOutputPin(pin: Pin): void {
    pin.ownerAction = this;
    pin.direction = 'out';
    this.outputPins.push(pin);
  }
  
  /**
   * アクションの情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      ownerModelId: this.ownerModel?.id,
      parentActivityId: this.parentActivity?.id,
      parentActivityName: this.parentActivity?.name,
      inputPins: this.inputPins.map(p => p.toObject()),
      outputPins: this.outputPins.map(p => p.toObject()),
      actionKind: this.actionKind,
      calledOperation: this.calledOperation,
      calledBehavior: this.calledBehavior,
      position: this.position,
      size: this.size
    };
  }
}

/**
 * Parameter クラス
 * アクティビティの入出力パラメータを表現する
 */
export class Parameter {
  /** 一意識別子 */
  readonly id: string;
  
  /** パラメータ名 */
  name: string;
  
  /** パラメータの型名 */
  typeName: string;
  
  /** パラメータの方向 */
  direction: 'in' | 'out' | 'inout' = 'in';
  
  /** パラメータの説明 */
  description?: string;
  
  /** パラメータの既定値 */
  defaultValue?: any;
  
  /** このパラメータの親アクティビティ */
  parentActivity?: Activity;
  
  /**
   * Parameter コンストラクタ
   * @param name パラメータ名
   * @param typeName パラメータの型名
   * @param direction パラメータの方向（デフォルト: 'in'）
   * @param parentActivity 親アクティビティ（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    typeName: string,
    direction: 'in' | 'out' | 'inout' = 'in',
    parentActivity?: Activity,
    id?: string
  ) {
    this.id = id || uuidv4();
    this.name = name;
    this.typeName = typeName;
    this.direction = direction;
    this.parentActivity = parentActivity;
  }
  
  /**
   * パラメータの情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      typeName: this.typeName,
      direction: this.direction,
      description: this.description,
      defaultValue: this.defaultValue,
      parentActivityId: this.parentActivity?.id,
      parentActivityName: this.parentActivity?.name
    };
  }
}

/**
 * Pin クラス
 * アクションの入出力ピンを表現する
 */
export class Pin {
  /** 一意識別子 */
  readonly id: string;
  
  /** ピン名 */
  name: string;
  
  /** ピンの型名 */
  typeName: string;
  
  /** ピンの方向 */
  direction: 'in' | 'out' = 'in';
  
  /** ピンの説明 */
  description?: string;
  
  /** このピンの親アクション */
  ownerAction?: Action;
  
  /** UI上の相対位置情報（親アクションからの相対位置） */
  relativePosition?: { x: number; y: number };
  
  /**
   * Pin コンストラクタ
   * @param name ピン名
   * @param typeName ピンの型名
   * @param direction ピンの方向（デフォルト: 'in'）
   * @param ownerAction 親アクション（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    typeName: string,
    direction: 'in' | 'out' = 'in',
    ownerAction?: Action,
    id?: string
  ) {
    this.id = id || uuidv4();
    this.name = name;
    this.typeName = typeName;
    this.direction = direction;
    this.ownerAction = ownerAction;
  }
  
  /**
   * ピンの情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      typeName: this.typeName,
      direction: this.direction,
      description: this.description,
      ownerActionId: this.ownerAction?.id,
      ownerActionName: this.ownerAction?.name,
      relativePosition: this.relativePosition
    };
  }
}

/**
 * ObjectNode クラス
 * アクティビティ図のオブジェクトノードを表現する
 */
export class ObjectNode {
  /** 一意識別子 */
  readonly id: string;
  
  /** オブジェクトノード名 */
  name: string;
  
  /** オブジェクトノードの型名 */
  typeName: string;
  
  /** オブジェクトノードの説明 */
  description?: string;
  
  /** このオブジェクトノードの所有者となるモデル */
  ownerModel?: ActivityModel;
  
  /** オブジェクトノードの種類 */
  nodeKind?: 'central' | 'pin' | 'parameter' | 'expansion' | 'datastore';
  
  /** オブジェクトノードの状態 */
  state?: string;
  
  /** オブジェクトノードが入力かどうか */
  isInput: boolean = false;
  
  /** オブジェクトノードが出力かどうか */
  isOutput: boolean = false;
  
  /** UI上の位置情報（オプション） */
  position?: { x: number; y: number };
  
  /** UI上のサイズ情報（オプション） */
  size?: { width: number; height: number };
  
  /**
   * ObjectNode コンストラクタ
   * @param name オブジェクトノード名
   * @param typeName オブジェクトノードの型名
   * @param ownerModel 所有者となるモデル（オプション）
   * @param nodeKind ノードの種類（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    typeName: string,
    ownerModel?: ActivityModel,
    nodeKind?: 'central' | 'pin' | 'parameter' | 'expansion' | 'datastore',
    id?: string
  ) {
    this.id = id || uuidv4();
    this.name = name;
    this.typeName = typeName;
    this.ownerModel = ownerModel;
    this.nodeKind = nodeKind;
  }
  
  /**
   * オブジェクトノードの情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      typeName: this.typeName,
      description: this.description,
      ownerModelId: this.ownerModel?.id,
      nodeKind: this.nodeKind,
      state: this.state,
      isInput: this.isInput,
      isOutput: this.isOutput,
      position: this.position,
      size: this.size
    };
  }
}

/**
 * ControlFlow クラス
 * アクティビティ図の制御フローを表現する
 */
export class ControlFlow {
  /** 一意識別子 */
  readonly id: string;
  
  /** 制御フロー名/ラベル */
  name?: string;
  
  /** 制御フローの説明 */
  description?: string;
  
  /** この制御フローの所有者となるモデル */
  ownerModel?: ActivityModel;
  
  /** 制御フロー元のID（アクションまたはコントロールノード） */
  sourceId: string;
  
  /** 制御フロー先のID（アクションまたはコントロールノード） */
  targetId: string;
  
  /** 制御フローのガード条件 */
  guard?: string;
  
  /** 制御フローの重み（並列パスの場合） */
  weight?: number;
  
  /** UI表示用の中間点 */
  vertices?: { x: number; y: number }[];
  
  /**
   * ControlFlow コンストラクタ
   * @param sourceId フロー元のID
   * @param targetId フロー先のID
   * @param ownerModel 所有者となるモデル（オプション）
   * @param name フロー名/ラベル（オプション）
   * @param guard ガード条件（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    sourceId: string,
    targetId: string,
    ownerModel?: ActivityModel,
    name?: string,
    guard?: string,
    id?: string
  ) {
    this.id = id || uuidv4();
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.ownerModel = ownerModel;
    this.name = name;
    this.guard = guard;
  }
  
  /**
   * 中間点を設定する
   * @param vertices 中間点の配列
   */
  setVertices(vertices: { x: number; y: number }[]): void {
    this.vertices = vertices;
  }
  
  /**
   * 制御フローの情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      ownerModelId: this.ownerModel?.id,
      sourceId: this.sourceId,
      targetId: this.targetId,
      guard: this.guard,
      weight: this.weight,
      vertices: this.vertices
    };
  }
}

/**
 * ObjectFlow クラス
 * アクティビティ図のオブジェクトフローを表現する
 */
export class ObjectFlow {
  /** 一意識別子 */
  readonly id: string;
  
  /** オブジェクトフロー名/ラベル */
  name?: string;
  
  /** オブジェクトフローの説明 */
  description?: string;
  
  /** このオブジェクトフローの所有者となるモデル */
  ownerModel?: ActivityModel;
  
  /** オブジェクトフロー元のID（ピンまたはオブジェクトノード） */
  sourceId: string;
  
  /** オブジェクトフロー先のID（ピンまたはオブジェクトノード） */
  targetId: string;
  
  /** フローする型名 */
  typeName?: string;
  
  /** オブジェクトフローの変換（変換がある場合） */
  transformation?: string;
  
  /** オブジェクトフローの選択条件 */
  selection?: string;
  
  /** UI表示用の中間点 */
  vertices?: { x: number; y: number }[];
  
  /**
   * ObjectFlow コンストラクタ
   * @param sourceId フロー元のID
   * @param targetId フロー先のID
   * @param ownerModel 所有者となるモデル（オプション）
   * @param name フロー名/ラベル（オプション）
   * @param typeName フローする型名（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    sourceId: string,
    targetId: string,
    ownerModel?: ActivityModel,
    name?: string,
    typeName?: string,
    id?: string
  ) {
    this.id = id || uuidv4();
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.ownerModel = ownerModel;
    this.name = name;
    this.typeName = typeName;
  }
  
  /**
   * 中間点を設定する
   * @param vertices 中間点の配列
   */
  setVertices(vertices: { x: number; y: number }[]): void {
    this.vertices = vertices;
  }
  
  /**
   * オブジェクトフローの情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      ownerModelId: this.ownerModel?.id,
      sourceId: this.sourceId,
      targetId: this.targetId,
      typeName: this.typeName,
      transformation: this.transformation,
      selection: this.selection,
      vertices: this.vertices
    };
  }
}