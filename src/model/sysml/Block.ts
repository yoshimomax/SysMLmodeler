import { v4 as uuidv4 } from 'uuid';
import { Type } from '../kerml/Type';
import { Feature } from '../kerml/Feature';
import { SysML_Block } from './interfaces';

/**
 * SysML Block クラス
 * SysML v2のブロック概念を表現する
 * OMG仕様：PTC/2023-02-02、SysML v2 Beta1
 */
export class Block extends Type {
  /** SysMLステレオタイプ - 常に'block'に設定 */
  readonly stereotype: string = 'block';
  
  /** 特化関係のIDリスト */
  private _specializationIds: string[] = [];
  
  /** プロパティのIDリスト */
  private _propertyIds: string[] = [];
  
  /** ポートのIDリスト */
  private _portIds: string[] = [];
  
  /**
   * Block コンストラクタ
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
    features?: Feature[];
    specializationIds?: string[];
    propertyIds?: string[];
    portIds?: string[];
  } = {}) {
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
      features: options.features
    });
    
    if (options.specializationIds) {
      this._specializationIds = [...options.specializationIds];
    }
    
    if (options.propertyIds) {
      this._propertyIds = [...options.propertyIds];
    }
    
    if (options.portIds) {
      this._portIds = [...options.portIds];
    }
  }
  
  /**
   * 特化関係のIDリストを取得
   */
  get specializationIds(): string[] {
    return [...this._specializationIds];
  }
  
  /**
   * プロパティのIDリストを取得
   */
  get propertyIds(): string[] {
    return [...this._propertyIds];
  }
  
  /**
   * ポートのIDリストを取得
   */
  get portIds(): string[] {
    return [...this._portIds];
  }
  
  /**
   * 特化関係を追加
   * @param specializationId 追加する特化関係のID
   */
  addSpecialization(specializationId: string): void {
    if (!this._specializationIds.includes(specializationId)) {
      this._specializationIds.push(specializationId);
    }
  }
  
  /**
   * プロパティを追加
   * @param propertyId 追加するプロパティのID
   */
  addProperty(propertyId: string): void {
    if (!this._propertyIds.includes(propertyId)) {
      this._propertyIds.push(propertyId);
    }
  }
  
  /**
   * ポートを追加
   * @param portId 追加するポートのID
   */
  addPort(portId: string): void {
    if (!this._portIds.includes(portId)) {
      this._portIds.push(portId);
    }
  }
  
  /**
   * 特化関係を削除
   * @param specializationId 削除する特化関係のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeSpecialization(specializationId: string): boolean {
    const initialLength = this._specializationIds.length;
    this._specializationIds = this._specializationIds.filter(id => id !== specializationId);
    return this._specializationIds.length !== initialLength;
  }
  
  /**
   * プロパティを削除
   * @param propertyId 削除するプロパティのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeProperty(propertyId: string): boolean {
    const initialLength = this._propertyIds.length;
    this._propertyIds = this._propertyIds.filter(id => id !== propertyId);
    return this._propertyIds.length !== initialLength;
  }
  
  /**
   * ポートを削除
   * @param portId 削除するポートのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removePort(portId: string): boolean {
    const initialLength = this._portIds.length;
    this._portIds = this._portIds.filter(id => id !== portId);
    return this._portIds.length !== initialLength;
  }
  
  /**
   * JSON形式に変換
   * @returns ブロックのJSON表現
   */
  toJSON(): SysML_Block {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'Block',
      stereotype: this.stereotype,
      isAbstract: this.isAbstract,
      specializationIds: this._specializationIds,
      propertyIds: this._propertyIds,
      portIds: this._portIds
    };
  }
  
  /**
   * JSON形式からブロックを作成
   * @param json JSON表現
   * @returns ブロックインスタンス
   */
  static fromJSON(json: SysML_Block, featureInstances: Feature[] = []): Block {
    // 基本的なType情報でBlockを初期化
    const block = new Block({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      isAbstract: json.isAbstract,
      isConjugated: json.isConjugated,
      specializationIds: json.specializationIds,
      propertyIds: json.propertyIds,
      portIds: json.portIds
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === block.id) {
          block.addFeature(feature);
        }
      });
    }
    
    return block;
  }
}