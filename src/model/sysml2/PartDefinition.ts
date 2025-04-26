import { v4 as uuidv4 } from 'uuid';
import { Type } from '../kerml/Type';
import { Feature } from '../kerml/Feature';
import { AttributeDefinition } from './AttributeDefinition';
import { PortDefinition } from './PortDefinition';
import { BlockDefinition } from './BlockDefinition';

/**
 * SysML v2 PartDefinition クラス
 * SysML v2 言語仕様のパート定義を表現する
 * @see https://www.omg.org/spec/SysML/2.0/Beta1
 */
export class PartDefinition extends Type {
  /** パートが使用する（型として参照する）ブロック定義 */
  blockType?: BlockDefinition;
  
  /** このパートが持つ属性定義のリスト */
  attributes: AttributeDefinition[] = [];
  
  /** このパートが持つポート定義のリスト */
  ports: PortDefinition[] = [];
  
  /** パートの配置位置（レイアウト情報） */
  position?: { x: number; y: number };
  
  /** パートのサイズ（レイアウト情報） */
  size?: { width: number; height: number };
  
  /** パートが抽象かどうか */
  isAbstract: boolean = false;
  
  /** パートの多重度（数量、インスタンス数） */
  multiplicity?: string;
  
  /**
   * PartDefinition コンストラクタ
   * @param name パート名
   * @param blockType このパートの型となるブロック定義（オプション）
   * @param attributes 属性のリスト（オプション）
   * @param ports ポートのリスト（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    blockType?: BlockDefinition,
    attributes: AttributeDefinition[] = [],
    ports: PortDefinition[] = [],
    id?: string
  ) {
    // Typeクラスのコンストラクタ呼び出し
    super(name, [], id);
    
    this.blockType = blockType;
    this.attributes = attributes;
    this.ports = ports;
    
    // 属性とポートの親設定
    this.attributes.forEach(attr => {
      attr.ownerPart = this;
    });
    
    this.ports.forEach(port => {
      port.ownerPart = this;
    });
  }
  
  /**
   * 属性を追加する
   * @param attribute 追加する属性
   */
  addAttribute(attribute: AttributeDefinition): void {
    attribute.ownerPart = this;
    this.attributes.push(attribute);
  }
  
  /**
   * ポートを追加する
   * @param port 追加するポート
   */
  addPort(port: PortDefinition): void {
    port.ownerPart = this;
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
   * パート定義の情報をオブジェクトとして返す
   */
  override toObject() {
    return {
      ...super.toObject(),
      blockTypeId: this.blockType?.id,
      blockTypeName: this.blockType?.name,
      attributes: this.attributes.map(a => a.toObject()),
      ports: this.ports.map(p => p.toObject()),
      position: this.position,
      size: this.size,
      isAbstract: this.isAbstract,
      multiplicity: this.multiplicity
    };
  }
}