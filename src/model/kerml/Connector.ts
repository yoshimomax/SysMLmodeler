import { v4 as uuidv4 } from 'uuid';
import { KerML_Connector } from './interfaces';
import { Feature } from './Feature';

/**
 * KerML Connector クラス
 * KerML メタモデルの要素間の接続を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class Connector extends Feature {
  /** 接続する特性のID配列 */
  private _connectedFeatures: string[] = [];
  
  /**
   * Connector コンストラクタ
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
    super({
      id: options.id,
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
    
    if (options.connectedFeatures) {
      this._connectedFeatures = [...options.connectedFeatures];
    }
  }
  
  /**
   * 接続する特性を取得
   */
  get connectedFeatures(): string[] {
    return [...this._connectedFeatures];
  }
  
  /**
   * 接続する特性を追加
   * @param featureId 追加する特性のID
   */
  addConnectedFeature(featureId: string): void {
    if (!this._connectedFeatures.includes(featureId)) {
      this._connectedFeatures.push(featureId);
    }
  }
  
  /**
   * 接続する特性を削除
   * @param featureId 削除する特性のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeConnectedFeature(featureId: string): boolean {
    const initialLength = this._connectedFeatures.length;
    this._connectedFeatures = this._connectedFeatures.filter(id => id !== featureId);
    return this._connectedFeatures.length !== initialLength;
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_Connector {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'Connector',
      connectedFeatures: this._connectedFeatures
    } as KerML_Connector;
  }
  
  /**
   * JSON形式からコネクタを作成
   * @param json JSON表現
   * @returns コネクタインスタンス
   */
  static fromJSON(json: KerML_Connector, featureInstances: Feature[] = []): Connector {
    // 基本的なFeature情報でConnectorを初期化
    const connector = new Connector({
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
        if (feature.ownerId === connector.id) {
          connector.addFeature(feature);
        }
      });
    }
    
    return connector;
  }
}