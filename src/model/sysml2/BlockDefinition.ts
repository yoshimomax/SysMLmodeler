import { v4 as uuidv4 } from 'uuid';
import { Definition } from './Definition';
import { Feature } from '../kerml/Feature';
import { AttributeDefinition } from './AttributeDefinition';
import { PortDefinition } from './PortDefinition';
import { validateKerMLClassifier } from '../kerml/validators';

/**
 * SysML v2 BlockDefinition クラス
 * SysML v2 言語仕様のブロック定義を表現する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.6, §8.2に準拠
 * 
 * BlockDefinitionは、システムの構造的な型を定義するクラスです。
 * SysML v2のBlockDefinitionは、Definitionを基底とし、属性、ポート、接続、振る舞いを含めることができます。
 */
export class BlockDefinition extends Definition {
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
   * @param options 初期化オプション
   */
  constructor(options: {
    name?: string;
    attributes?: AttributeDefinition[];
    ports?: PortDefinition[];
    stereotype?: string;
    id?: string;
    isAbstract?: boolean;
    isSingleton?: boolean;
    isVariation?: boolean;
    ownerId?: string;
    usageReferences?: string[];
  }) {
    // Definitionクラスのコンストラクタ呼び出し
    super({
      id: options.id,
      name: options.name,
      ownerId: options.ownerId,
      isAbstract: options.isAbstract,
      isVariation: options.isVariation,
      stereotype: options.stereotype || 'block',
      usageReferences: options.usageReferences
    });
    
    this.attributes = options.attributes || [];
    this.ports = options.ports || [];
    this.stereotype = options.stereotype || 'block';
    
    if (options.isAbstract !== undefined) {
      this.isAbstract = options.isAbstract;
    }
    
    if (options.isSingleton !== undefined) {
      this.isSingleton = options.isSingleton;
    }
    
    // 属性とポートの親設定
    this.attributes.forEach(attr => {
      if ('ownerBlock' in attr) {
        (attr as any).ownerBlock = this;
      }
      attr.ownerId = this.id;
      // 特性として登録
      this.addFeature(attr);
    });
    
    this.ports.forEach(port => {
      port.ownerId = this.id;
      // 特性として登録
      this.addFeature(port);
    });
    
    // KerML制約の検証
    try {
      this.validate();
    } catch (error) {
      console.warn(`警告: BlockDefinition(id=${this.id}, name=${this.name}) の検証中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 属性を追加する
   * @param attribute 追加する属性
   */
  addAttribute(attribute: AttributeDefinition): void {
    if ('ownerBlock' in attribute) {
      (attribute as any).ownerBlock = this;
    }
    attribute.ownerId = this.id;
    this.attributes.push(attribute);
  }
  
  /**
   * ポートを追加する
   * @param port 追加するポート
   */
  addPort(port: PortDefinition): void {
    port.ownerId = this.id;
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
    const baseObject = super.toObject();
    return {
      ...baseObject,
      attributes: this.attributes.map(a => a.toObject()),
      ports: this.ports.map(p => p.toObject()),
      position: this.position,
      size: this.size,
      stereotype: this.stereotype || 'block', // デフォルト値を設定
      isAbstract: this.isAbstract,
      isSingleton: this.isSingleton
    };
  }
}