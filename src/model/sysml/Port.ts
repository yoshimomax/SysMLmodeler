import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { SysML_Port } from './interfaces';

/**
 * SysML Port クラス
 * SysML v2のポート（システムの接続点）を表現する
 * OMG仕様：PTC/2023-02-02、SysML v2 Beta1
 */
export class Port extends Feature {
  /** SysMLステレオタイプ - 常に'port'に設定 */
  readonly stereotype: string = 'port';
  
  /** サービスポートかどうか */
  isService: boolean;
  
  /** 共役ポートかどうか */
  isConjugated: boolean;
  
  /** 親要素のID */
  parentId: string;
  
  /**
   * Port コンストラクタ
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
    direction?: 'in' | 'out' | 'inout' | 'none';
    typeId?: string;
    features?: Feature[];
    isService?: boolean;
    parentId: string;
  }) {
    // 親クラスのコンストラクタを呼び出し
    super({
      id: options.id || uuidv4(),
      ownerId: options.ownerId,
      name: options.name,
      shortName: options.shortName,
      qualifiedName: options.qualifiedName,
      description: options.description,
      isAbstract: options.isAbstract,
      isConjugated: options.isConjugated,
      isUnique: options.isUnique,
      isOrdered: options.isOrdered,
      direction: options.direction,
      typeId: options.typeId,
      features: options.features
    });
    
    this.isService = options.isService ?? false;
    this.isConjugated = options.isConjugated ?? false;
    this.parentId = options.parentId;
  }
  
  /**
   * JSON形式に変換
   * @returns ポートのJSON表現
   */
  toJSON(): SysML_Port {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'Port',
      stereotype: this.stereotype,
      isService: this.isService,
      isConjugated: this.isConjugated,
      parentId: this.parentId
    };
  }
  
  /**
   * JSON形式からポートを作成
   * @param json JSON表現
   * @returns ポートインスタンス
   */
  static fromJSON(json: SysML_Port, featureInstances: Feature[] = []): Port {
    // 基本的なFeature情報でPortを初期化
    const port = new Port({
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
      typeId: json.typeId,
      isService: json.isService,
      parentId: json.parentId
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === port.id) {
          port.addFeature(feature);
        }
      });
    }
    
    return port;
  }
}