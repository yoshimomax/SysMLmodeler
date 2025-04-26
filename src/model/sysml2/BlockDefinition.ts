import { v4 as uuidv4 } from 'uuid';
import { Type } from '../kerml/Type';
import { Feature } from '../kerml/Feature';
import { AttributeDefinition } from './AttributeDefinition';
import { PortDefinition } from './PortDefinition';

/**
 * SysML v2 BlockDefinition クラス
 * SysML v2 言語仕様のブロック定義を表現する
 * @see https://www.omg.org/spec/SysML/2.0/Beta1
 */
export class BlockDefinition extends Type {
  /** このブロックが持つ属性定義のリスト */
  attributes: AttributeDefinition[] = [];
  
  /** このブロックが持つポート定義のリスト */
  ports: PortDefinition[] = [];
  
  /** ブロックの配置位置（レイアウト情報） */
  position?: { x: number; y: number };
  
  /** ブロックのサイズ（レイアウト情報） */
  size?: { width: number; height: number };
  
  /** ブロックのステレオタイプ */
  stereotype?: string;
  
  /** ブロックが抽象かどうか */
  isAbstract: boolean = false;
  
  /** ブロックがシングルトンかどうか */
  isSingleton: boolean = false;
  
  /**
   * BlockDefinition コンストラクタ
   * @param name ブロック名
   * @param attributes 属性のリスト（オプション）
   * @param ports ポートのリスト（オプション）
   * @param stereotype ステレオタイプ（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    attributes: AttributeDefinition[] = [],
    ports: PortDefinition[] = [],
    stereotype?: string,
    id?: string
  ) {
    // Typeクラスのコンストラクタ呼び出し
    super(name, [], id);
    
    this.attributes = attributes;
    this.ports = ports;
    this.stereotype = stereotype;
    
    // 属性とポートの親設定
    this.attributes.forEach(attr => {
      attr.ownerBlock = this;
    });
    
    this.ports.forEach(port => {
      port.ownerBlock = this;
    });
  }
  
  /**
   * 属性を追加する
   * @param attribute 追加する属性
   */
  addAttribute(attribute: AttributeDefinition): void {
    attribute.ownerBlock = this;
    this.attributes.push(attribute);
  }
  
  /**
   * ポートを追加する
   * @param port 追加するポート
   */
  addPort(port: PortDefinition): void {
    port.ownerBlock = this;
    this.ports.push(port);
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
   * ポートを削除する
   * @param portId 削除するポートのID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removePort(portId: string): boolean {
    const initialLength = this.ports.length;
    this.ports = this.ports.filter(p => p.id !== portId);
    return this.ports.length !== initialLength;
  }
  
  /**
   * ブロック定義の情報をオブジェクトとして返す
   */
  override toObject() {
    return {
      ...super.toObject(),
      attributes: this.attributes.map(a => a.toObject()),
      ports: this.ports.map(p => p.toObject()),
      position: this.position,
      size: this.size,
      stereotype: this.stereotype,
      isAbstract: this.isAbstract,
      isSingleton: this.isSingleton
    };
  }
}