import { v4 as uuidv4 } from 'uuid';
import { BlockDefinition } from '../sysml2/BlockDefinition';
import { PartDefinition } from '../sysml2/PartDefinition';
import { ConnectionDefinition } from '../sysml2/ConnectionDefinition';
import { AttributeDefinition } from '../sysml2/AttributeDefinition';
import { PortDefinition } from '../sysml2/PortDefinition';
import { InterfaceDefinition } from '../sysml2/InterfaceDefinition';

/**
 * SystemContext クラス
 * システム境界とシステム外部環境を含む全体のコンテキストを表現する
 */
export class SystemContext {
  /** 一意識別子 */
  readonly id: string;
  
  /** システムコンテキスト名 */
  name: string;
  
  /** システムコンテキストの説明 */
  description?: string;
  
  /** システムコンテキストに含まれるシステム定義 */
  system?: System;
  
  /** システムコンテキストに含まれる外部アクター */
  externalActors: Actor[] = [];
  
  /** システムと外部アクター間の接続 */
  connections: ConnectionDefinition[] = [];
  
  /** 
   * コンテキスト図のプロパティ
   * 図のサイズやグリッド設定など
   */
  diagramProperties?: DiagramProperties;
  
  /**
   * SystemContext コンストラクタ
   * @param name システムコンテキスト名
   * @param system システム定義（オプション）
   * @param externalActors 外部アクターのリスト（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    system?: System,
    externalActors: Actor[] = [],
    id?: string
  ) {
    this.id = id || uuidv4();
    this.name = name;
    this.system = system;
    this.externalActors = externalActors;
  }
  
  /**
   * システムを設定する
   * @param system 設定するシステム
   */
  setSystem(system: System): void {
    this.system = system;
  }
  
  /**
   * 外部アクターを追加する
   * @param actor 追加する外部アクター
   */
  addExternalActor(actor: Actor): void {
    this.externalActors.push(actor);
  }
  
  /**
   * 接続を追加する
   * @param connection 追加する接続
   */
  addConnection(connection: ConnectionDefinition): void {
    this.connections.push(connection);
  }
  
  /**
   * 外部アクターを削除する
   * @param actorId 削除する外部アクターのID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeExternalActor(actorId: string): boolean {
    const initialLength = this.externalActors.length;
    this.externalActors = this.externalActors.filter(a => a.id !== actorId);
    
    // 削除されたアクターに関連する接続も削除
    this.connections = this.connections.filter(c => {
      // アクターに関連するポートIDを取得
      const actorPortIds = this.externalActors.flatMap(a => 
        a.ports.map(p => p.id)
      );
      
      // 接続の両端がアクターのポートでないことを確認
      return actorPortIds.includes(c.sourcePortId) || 
             actorPortIds.includes(c.targetPortId);
    });
    
    return this.externalActors.length !== initialLength;
  }
  
  /**
   * 接続を削除する
   * @param connectionId 削除する接続のID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeConnection(connectionId: string): boolean {
    const initialLength = this.connections.length;
    this.connections = this.connections.filter(c => c.id !== connectionId);
    return this.connections.length !== initialLength;
  }
  
  /**
   * システムコンテキストの情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      system: this.system?.toObject(),
      externalActors: this.externalActors.map(a => a.toObject()),
      connections: this.connections.map(c => c.toObject()),
      diagramProperties: this.diagramProperties
    };
  }
}

/**
 * System クラス
 * 対象システムを表現する
 */
export class System extends BlockDefinition {
  /** このシステムが持つサブシステムのリスト */
  subsystems: Subsystem[] = [];
  
  /** システムが満たすべき要件のリスト */
  requirements: Requirement[] = [];
  
  /**
   * System コンストラクタ
   * @param name システム名
   * @param attributes 属性のリスト（オプション）
   * @param ports ポートのリスト（オプション）
   * @param subsystems サブシステムのリスト（オプション）
   * @param requirements 要件のリスト（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    attributes: AttributeDefinition[] = [],
    ports: PortDefinition[] = [],
    subsystems: Subsystem[] = [],
    requirements: Requirement[] = [],
    id?: string
  ) {
    // BlockDefinitionクラスのコンストラクタ呼び出し
    super(name, attributes, ports, 'system', id);
    
    this.subsystems = subsystems;
    this.requirements = requirements;
  }
  
  /**
   * サブシステムを追加する
   * @param subsystem 追加するサブシステム
   */
  addSubsystem(subsystem: Subsystem): void {
    this.subsystems.push(subsystem);
  }
  
  /**
   * 要件を追加する
   * @param requirement 追加する要件
   */
  addRequirement(requirement: Requirement): void {
    this.requirements.push(requirement);
  }
  
  /**
   * サブシステムを削除する
   * @param subsystemId 削除するサブシステムのID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeSubsystem(subsystemId: string): boolean {
    const initialLength = this.subsystems.length;
    this.subsystems = this.subsystems.filter(s => s.id !== subsystemId);
    return this.subsystems.length !== initialLength;
  }
  
  /**
   * 要件を削除する
   * @param requirementId 削除する要件のID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeRequirement(requirementId: string): boolean {
    const initialLength = this.requirements.length;
    this.requirements = this.requirements.filter(r => r.id !== requirementId);
    return this.requirements.length !== initialLength;
  }
  
  /**
   * システム情報をオブジェクトとして返す
   */
  override toObject() {
    return {
      ...super.toObject(),
      subsystems: this.subsystems.map(s => s.toObject()),
      requirements: this.requirements.map(r => r.toObject())
    };
  }
}

/**
 * Subsystem クラス
 * システムを構成するサブシステムを表現する
 */
export class Subsystem extends BlockDefinition {
  /** このサブシステムが持つコンポーネントのリスト */
  components: Component[] = [];
  
  /** サブシステムの親システム */
  parentSystem?: System;
  
  /**
   * Subsystem コンストラクタ
   * @param name サブシステム名
   * @param attributes 属性のリスト（オプション）
   * @param ports ポートのリスト（オプション）
   * @param components コンポーネントのリスト（オプション）
   * @param parentSystem 親システム（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    attributes: AttributeDefinition[] = [],
    ports: PortDefinition[] = [],
    components: Component[] = [],
    parentSystem?: System,
    id?: string
  ) {
    // BlockDefinitionクラスのコンストラクタ呼び出し
    super(name, attributes, ports, 'subsystem', id);
    
    this.components = components;
    this.parentSystem = parentSystem;
  }
  
  /**
   * コンポーネントを追加する
   * @param component 追加するコンポーネント
   */
  addComponent(component: Component): void {
    this.components.push(component);
  }
  
  /**
   * コンポーネントを削除する
   * @param componentId 削除するコンポーネントのID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeComponent(componentId: string): boolean {
    const initialLength = this.components.length;
    this.components = this.components.filter(c => c.id !== componentId);
    return this.components.length !== initialLength;
  }
  
  /**
   * サブシステム情報をオブジェクトとして返す
   */
  override toObject() {
    return {
      ...super.toObject(),
      components: this.components.map(c => c.toObject()),
      parentSystemId: this.parentSystem?.id,
      parentSystemName: this.parentSystem?.name
    };
  }
}

/**
 * Component クラス
 * システムの基本構成要素を表現する
 */
export class Component extends BlockDefinition {
  /** コンポーネントの親サブシステム */
  parentSubsystem?: Subsystem;
  
  /**
   * Component コンストラクタ
   * @param name コンポーネント名
   * @param attributes 属性のリスト（オプション）
   * @param ports ポートのリスト（オプション）
   * @param parentSubsystem 親サブシステム（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    attributes: AttributeDefinition[] = [],
    ports: PortDefinition[] = [],
    parentSubsystem?: Subsystem,
    id?: string
  ) {
    // BlockDefinitionクラスのコンストラクタ呼び出し
    super(name, attributes, ports, 'component', id);
    
    this.parentSubsystem = parentSubsystem;
  }
  
  /**
   * コンポーネント情報をオブジェクトとして返す
   */
  override toObject() {
    return {
      ...super.toObject(),
      parentSubsystemId: this.parentSubsystem?.id,
      parentSubsystemName: this.parentSubsystem?.name
    };
  }
}

/**
 * Actor クラス
 * システム外部のアクターやシステムを表現する
 */
export class Actor extends BlockDefinition {
  /** アクターのタイプ（human, system, device など） */
  actorType?: string;
  
  /**
   * Actor コンストラクタ
   * @param name アクター名
   * @param attributes 属性のリスト（オプション）
   * @param ports ポートのリスト（オプション）
   * @param actorType アクタータイプ（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    attributes: AttributeDefinition[] = [],
    ports: PortDefinition[] = [],
    actorType?: string,
    id?: string
  ) {
    // BlockDefinitionクラスのコンストラクタ呼び出し
    super(name, attributes, ports, 'actor', id);
    
    this.actorType = actorType;
  }
  
  /**
   * アクター情報をオブジェクトとして返す
   */
  override toObject() {
    return {
      ...super.toObject(),
      actorType: this.actorType
    };
  }
}

/**
 * Requirement クラス
 * システムまたはサブシステムの要件を表現する
 */
export class Requirement {
  /** 一意識別子 */
  readonly id: string;
  
  /** 要件名 */
  name: string;
  
  /** 要件の説明 */
  description: string;
  
  /** 要件の種類（機能要件、非機能要件など） */
  category?: string;
  
  /** 要件の重要度（高、中、低など） */
  priority?: 'high' | 'medium' | 'low';
  
  /** 要件のソース（利害関係者、規制など） */
  source?: string;
  
  /** 要件検証方法 */
  verificationMethod?: string;
  
  /** この要件に関連するシステム/サブシステム */
  relatedSystemId?: string;
  
  /**
   * Requirement コンストラクタ
   * @param name 要件名
   * @param description 要件の説明
   * @param category 要件の種類（オプション）
   * @param priority 要件の重要度（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    description: string,
    category?: string,
    priority?: 'high' | 'medium' | 'low',
    id?: string
  ) {
    this.id = id || uuidv4();
    this.name = name;
    this.description = description;
    this.category = category;
    this.priority = priority;
  }
  
  /**
   * 要件情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      priority: this.priority,
      source: this.source,
      verificationMethod: this.verificationMethod,
      relatedSystemId: this.relatedSystemId
    };
  }
}

/**
 * DiagramProperties インターフェース
 * 図の表示プロパティを定義する
 */
export interface DiagramProperties {
  /** 図の幅 */
  width: number;
  
  /** 図の高さ */
  height: number;
  
  /** グリッドサイズ */
  gridSize?: number;
  
  /** グリッド表示の有無 */
  showGrid?: boolean;
  
  /** スナップ機能の有無 */
  snapToGrid?: boolean;
  
  /** 図の背景色 */
  backgroundColor?: string;
}