import { v4 as uuidv4 } from 'uuid';
import { KerML_BindingConnector } from './interfaces';
import { Connector } from './Connector';
import { Feature } from './Feature';

/**
 * KerML BindingConnector クラス
 * KerML メタモデルの特性間の等価性を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class BindingConnector extends Connector {
  /**
   * BindingConnector コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    ownerId?: string;
    name?: string;
    shortName?: string;
    qualifiedName?: string;
    description?: string;
    isAbstract?: boolean;
    isConjugated?: boolean;
    isUnique?: boolean;
    isOrdered?: boolean;
    direction?: 'in' | 'out' | 'inout';
    typeId?: string;
    features?: Feature[];
    connectedFeatures?: string[];
  } = {}) {
    // 親クラスのコンストラクタを呼び出し
    super(options);
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_BindingConnector {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'BindingConnector'
    } as KerML_BindingConnector;
  }
  
  /**
   * JSON形式からバインディングコネクタを作成
   * @param json JSON表現
   * @returns バインディングコネクタインスタンス
   */
  static fromJSON(json: KerML_BindingConnector, featureInstances: Feature[] = []): BindingConnector {
    // 基本的なConnector情報でBindingConnectorを初期化
    const bindingConnector = new BindingConnector({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      isAbstract: json.isAbstract,
      isConjugated: json.isConjugated,
      isUnique: json.isUnique,
      isOrdered: json.isOrdered,
      direction: json.direction,
      typeId: json.type,
      connectedFeatures: json.connectedFeatures
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === bindingConnector.id) {
          bindingConnector.addFeature(feature);
        }
      });
    }
    
    return bindingConnector;
  }
}