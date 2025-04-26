import { v4 as uuidv4 } from 'uuid';
import { Type } from '../kerml/Type';
import { AttributeDefinition } from './AttributeDefinition';

/**
 * SysML v2 InterfaceDefinition クラス
 * SysML v2 言語仕様のインターフェース定義を表現する
 * @see https://www.omg.org/spec/SysML/2.0/Beta1
 */
export class InterfaceDefinition extends Type {
  /** このインターフェースが持つ属性定義のリスト */
  attributes: AttributeDefinition[] = [];
  
  /** インターフェースが提供する操作（メソッド）のリスト */
  operations: OperationDefinition[] = [];
  
  /** インターフェースのステレオタイプ */
  stereotype?: string;
  
  /** インターフェースが抽象かどうか */
  isAbstract: boolean = true;
  
  /**
   * InterfaceDefinition コンストラクタ
   * @param name インターフェース名
   * @param attributes 属性のリスト（オプション）
   * @param operations 操作のリスト（オプション）
   * @param stereotype ステレオタイプ（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    attributes: AttributeDefinition[] = [],
    operations: OperationDefinition[] = [],
    stereotype?: string,
    id?: string
  ) {
    // Typeクラスのコンストラクタ呼び出し
    super(name, [], id, true); // インターフェースはデフォルトで抽象
    
    this.attributes = attributes;
    this.operations = operations;
    this.stereotype = stereotype;
    
    // 属性と操作の親設定
    this.attributes.forEach(attr => {
      attr.ownerInterface = this;
    });
    
    this.operations.forEach(op => {
      op.ownerInterface = this;
    });
  }
  
  /**
   * 属性を追加する
   * @param attribute 追加する属性
   */
  addAttribute(attribute: AttributeDefinition): void {
    attribute.ownerInterface = this;
    this.attributes.push(attribute);
  }
  
  /**
   * 操作を追加する
   * @param operation 追加する操作
   */
  addOperation(operation: OperationDefinition): void {
    operation.ownerInterface = this;
    this.operations.push(operation);
  }
  
  /**
   * 属性を削除する
   * @param attributeId 削除する属性のID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeAttribute(attributeId: string): boolean {
    const initialLength = this.attributes.length;
    this.attributes = this.attributes.filter(a => a.id !== attributeId);
    return this.attributes.length !== initialLength;
  }
  
  /**
   * 操作を削除する
   * @param operationId 削除する操作のID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeOperation(operationId: string): boolean {
    const initialLength = this.operations.length;
    this.operations = this.operations.filter(o => o.id !== operationId);
    return this.operations.length !== initialLength;
  }
  
  /**
   * インターフェース定義の情報をオブジェクトとして返す
   */
  override toObject() {
    return {
      ...super.toObject(),
      attributes: this.attributes.map(a => a.toObject()),
      operations: this.operations.map(o => o.toObject()),
      stereotype: this.stereotype,
      isAbstract: this.isAbstract
    };
  }
}

/**
 * SysML v2 OperationDefinition クラス
 * インターフェースの操作（メソッド）を表現する
 */
export class OperationDefinition {
  /** 一意識別子 */
  readonly id: string;
  
  /** 操作名 */
  name: string;
  
  /** 操作の戻り値の型 */
  returnType?: string;
  
  /** 操作の引数リスト */
  parameters: ParameterDefinition[] = [];
  
  /** この操作の所有者となるインターフェース */
  ownerInterface?: InterfaceDefinition;
  
  /** 操作の説明 */
  description?: string;
  
  /** 操作が抽象かどうか */
  isAbstract: boolean = false;
  
  /**
   * OperationDefinition コンストラクタ
   * @param name 操作名
   * @param returnType 戻り値の型（オプション）
   * @param parameters 引数リスト（オプション）
   * @param ownerInterface 所有インターフェース（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    returnType?: string,
    parameters: ParameterDefinition[] = [],
    ownerInterface?: InterfaceDefinition,
    id?: string
  ) {
    this.id = id || uuidv4();
    this.name = name;
    this.returnType = returnType;
    this.parameters = parameters;
    this.ownerInterface = ownerInterface;
    
    // 引数のowner設定
    this.parameters.forEach(param => {
      param.ownerOperation = this;
    });
  }
  
  /**
   * パラメータを追加する
   * @param parameter 追加するパラメータ
   */
  addParameter(parameter: ParameterDefinition): void {
    parameter.ownerOperation = this;
    this.parameters.push(parameter);
  }
  
  /**
   * パラメータを削除する
   * @param parameterId 削除するパラメータのID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeParameter(parameterId: string): boolean {
    const initialLength = this.parameters.length;
    this.parameters = this.parameters.filter(p => p.id !== parameterId);
    return this.parameters.length !== initialLength;
  }
  
  /**
   * 操作の情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      returnType: this.returnType,
      parameters: this.parameters.map(p => p.toObject()),
      ownerInterfaceId: this.ownerInterface?.id,
      ownerInterfaceName: this.ownerInterface?.name,
      description: this.description,
      isAbstract: this.isAbstract
    };
  }
}

/**
 * SysML v2 ParameterDefinition クラス
 * 操作の引数パラメータを表現する
 */
export class ParameterDefinition {
  /** 一意識別子 */
  readonly id: string;
  
  /** パラメータ名 */
  name: string;
  
  /** パラメータの型 */
  type: string;
  
  /** デフォルト値 */
  defaultValue?: any;
  
  /** パラメータの方向 (in, out, inout) */
  direction: 'in' | 'out' | 'inout' = 'in';
  
  /** このパラメータの所有者となる操作 */
  ownerOperation?: OperationDefinition;
  
  /**
   * ParameterDefinition コンストラクタ
   * @param name パラメータ名
   * @param type パラメータの型
   * @param direction パラメータの方向（デフォルト: 'in'）
   * @param defaultValue デフォルト値（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    type: string,
    direction: 'in' | 'out' | 'inout' = 'in',
    defaultValue?: any,
    id?: string
  ) {
    this.id = id || uuidv4();
    this.name = name;
    this.type = type;
    this.direction = direction;
    this.defaultValue = defaultValue;
  }
  
  /**
   * パラメータの情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      defaultValue: this.defaultValue,
      direction: this.direction,
      ownerOperationId: this.ownerOperation?.id,
      ownerOperationName: this.ownerOperation?.name
    };
  }
}