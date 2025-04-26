import { v4 as uuidv4 } from 'uuid';
import { Property } from './Property';
import { Port } from './Port';

/**
 * Block クラス
 * SysML v2 のブロック概念を表現する
 */
export class Block {
  /** ブロックの一意識別子 */
  readonly id: string;
  
  /** ブロック名 */
  name: string;
  
  /** ブロックが持つプロパティのリスト */
  properties: Property[];
  
  /** ブロックが持つポートのリスト */
  ports: Port[];
  
  /** 
   * ステレオタイプ（block, part_def など）
   * SysML v2 では型の分類に使用
   */
  stereotype?: string;
  
  /** ブロックの説明 */
  description?: string;

  /**
   * Block コンストラクタ
   * @param name ブロック名
   * @param properties プロパティのリスト（オプション）
   * @param ports ポートのリスト（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    properties: Property[] = [],
    ports: Port[] = [],
    stereotype?: string,
    description?: string,
    id?: string
  ) {
    this.id = id || uuidv4();
    this.name = name;
    this.properties = properties;
    this.ports = ports;
    this.stereotype = stereotype;
    this.description = description;
    
    // プロパティとポートの所有者IDを設定
    this.properties.forEach(property => {
      property.ownerBlockId = this.id;
    });
    
    this.ports.forEach(port => {
      port.ownerBlockId = this.id;
    });
  }

  /**
   * プロパティを追加する
   * @param property 追加するプロパティ
   */
  addProperty(property: Property): void {
    property.ownerBlockId = this.id;
    this.properties.push(property);
  }

  /**
   * ポートを追加する
   * @param port 追加するポート
   */
  addPort(port: Port): void {
    port.ownerBlockId = this.id;
    this.ports.push(port);
  }

  /**
   * プロパティを削除する
   * @param propertyId 削除するプロパティのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeProperty(propertyId: string): boolean {
    const initialLength = this.properties.length;
    this.properties = this.properties.filter(p => p.id !== propertyId);
    return this.properties.length !== initialLength;
  }

  /**
   * ポートを削除する
   * @param portId 削除するポートのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removePort(portId: string): boolean {
    const initialLength = this.ports.length;
    this.ports = this.ports.filter(p => p.id !== portId);
    return this.ports.length !== initialLength;
  }

  /**
   * ブロックの情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      properties: this.properties.map(p => p.toObject()),
      ports: this.ports.map(p => p.toObject()),
      stereotype: this.stereotype,
      description: this.description
    };
  }
}