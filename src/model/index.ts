// KerML コア要素
export { Type } from './kerml/Type';
export { Feature } from './kerml/Feature';
export { Classifier } from './kerml/Classifier';
export { MultiplicityRange } from './kerml/MultiplicityRange';

// SysML v2 要素
export { BlockDefinition } from './sysml2/BlockDefinition';
export { PartDefinition } from './sysml2/PartDefinition';
export { AttributeDefinition } from './sysml2/AttributeDefinition';
export { PortDefinition } from './sysml2/PortDefinition';
export { ConnectionDefinition } from './sysml2/ConnectionDefinition';
export { InterfaceDefinition, OperationDefinition, ParameterDefinition } from './sysml2/InterfaceDefinition';

// プラットフォーム独立モデル（PIM）要素
export { 
  SystemContext, 
  System, 
  Subsystem, 
  Component, 
  Actor, 
  Requirement, 
  DiagramProperties 
} from './pim/SystemContext';

export { 
  StateMachine, 
  State, 
  Transition 
} from './pim/StateMachine';

export { 
  ActivityModel, 
  Activity, 
  Action, 
  Parameter, 
  Pin, 
  ObjectNode, 
  ControlFlow, 
  ObjectFlow 
} from './pim/BehaviorModel';

// ユーティリティ
export { generateUUID, isValidUUID, ensureUUID } from './utils/uuid';

// レガシー互換性のためのエクスポート（必要に応じて）
// 将来削除予定
export { default as Block } from '../model/Block';
export { default as Port } from '../model/Port';
export { default as Property } from '../model/Property';
export { default as Connection } from '../model/Connection';