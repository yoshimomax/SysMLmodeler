import { v4 as uuidv4 } from 'uuid';
import { Definition } from './Definition';
import { Feature } from '../kerml/Feature';
import { AttributeDefinition } from './AttributeDefinition';
import { PortDefinition } from './PortDefinition';
import { validateKerMLClassifier } from '../kerml/validators';

/**
 * SysML v2 PartDefinition クラス （旧名称: BlockDefinition）
 * SysML v2 言語仕様のパート定義を表現する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.6, §8.2に準拠
 * 
 * 注意: SysML v2では「ブロック」の概念は「パート」に置き換えられました。
 * このクラスは後方互換性のために一時的にBlockDefinitionという名前を保持しています。
 * 
 * PartDefinitionは、システムの構造的な型を定義するクラスです。
 * SysML v2のPartDefinitionは、Definitionを基底とし、属性、ポート、接続、振る舞いを含めることができます。
 */
export class BlockDefinition extends Definition {
  /** このパートが持つ属性定義のリスト */
  attributes: AttributeDefinition[] = [];
  
  /** このパートが持つポート定義のリスト */
  ports: PortDefinition[] = [];
  
  /** パートの配置位置（レイアウト情報） */
  position?: { x: number; y: number };
  
  /** パートのサイズ（レイアウト情報） */
  size?: { width: number; height: number };
  
  /** 
   * 型の分類
   * 注意: SysML v2ではステレオタイプの概念は廃止されました
   * @deprecated このプロパティはSysML v1との互換性のために残されています
   */
  stereotype?: string;
  
  /** パートが抽象かどうか */
  isAbstract: boolean = false;
  
  /** パートがシングルトンかどうか */
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
      // SysML v2ではステレオタイプの概念は廃止されたが、後方互換性のために残している
      usageReferences: options.usageReferences
    });
    
    this.attributes = options.attributes || [];
    this.ports = options.ports || [];
    // 後方互換性のためにステレオタイプを設定（SysML v2では非推奨）
    this.stereotype = options.stereotype;
    
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
      // 属性はすでにFeatureのサブクラスなので直接特性として登録
      this.ownedFeatures.push(attr.id);
    });
    
    this.ports.forEach(port => {
      port.ownerId = this.id;
      // ポートが持つFeature型の特性をこのブロックの特性として登録
      this.ownedFeatures.push(port.id);
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
    
    // Definition基底クラスの特性としても追加
    this.ownedFeatures.push(attribute.id);
  }
  
  /**
   * ポートを追加する
   * @param port 追加するポート
   */
  addPort(port: PortDefinition): void {
    port.ownerId = this.id;
    this.ports.push(port);
    
    // Definition基底クラスの特性としても追加
    this.ownedFeatures.push(port.id);
  }
  
  /**
   * 属性を削除する
   * @param attributeId 削除する属性のID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeAttribute(attributeId: string): boolean {
    const initialLength = this.attributes.length;
    this.attributes = this.attributes.filter(a => a.id !== attributeId);
    
    // Definition基底クラスからも特性を削除
    this.removeFeature(attributeId);
    
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
    
    // Definition基底クラスからも特性を削除
    this.removeFeature(portId);
    
    return this.ports.length !== initialLength;
  }
  
  /**
   * KerML制約およびSysML v2の制約を検証する
   * SysML v2 Beta3 Part1 (ptc/2025-02-11) §8.2に準拠
   * @throws Error 制約違反がある場合
   */
  validate(): void {
    // 親クラス（Definition）の制約を検証
    super.validate();
    
    // SysML v2固有の制約を検証
    // ポートの所有関係の検証
    this.ports.forEach(port => {
      if (port.ownerId !== this.id) {
        console.warn(`警告: ポート(id=${port.id}, name=${port.name})の所有者IDが不正です。期待値: ${this.id}, 実際: ${port.ownerId}`);
      }
    });
    
    // 属性の所有関係の検証
    this.attributes.forEach(attr => {
      if (attr.ownerId !== this.id) {
        console.warn(`警告: 属性(id=${attr.id}, name=${attr.name})の所有者IDが不正です。期待値: ${this.id}, 実際: ${attr.ownerId}`);
      }
    });
  }
  
  /**
   * パート定義の情報をオブジェクトとして返す
   */
  override toObject() {
    const baseObject = super.toObject();
    return {
      ...baseObject,
      attributes: this.attributes.map(a => a.toObject()),
      ports: this.ports.map(p => p.toObject()),
      position: this.position,
      size: this.size,
      // 注意: stereotype はSysML v2では非推奨
      stereotype: this.stereotype,
      isAbstract: this.isAbstract,
      isSingleton: this.isSingleton
    };
  }
}