import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { SysML_Part } from './interfaces';

/**
 * SysML Part クラス
 * SysML v2の部品（システム構成要素）を表現する
 * OMG仕様：PTC/2023-02-02、SysML v2 Beta1
 */
export class Part extends Feature {
  /** SysMLステレオタイプ - 常に'part'に設定 */
  readonly stereotype: string = 'part';
  
  /** コンポジション関係かどうか */
  isComposite: boolean;
  
  /** 参照する部品のID（代替表現の場合） */
  referencedPartId?: string;
  
  /** ポートのIDリスト */
  private _ports: string[] = [];
  
  /**
   * Part コンストラクタ
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
    isComposite?: boolean;
    multiplicity?: string;
    referencedPartId?: string;
    ports?: string[];
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
      isUnique: options.isUnique,
      isOrdered: options.isOrdered,
      direction: options.direction,
      typeId: options.typeId,
      features: options.features
    });
    
    this.isComposite = options.isComposite ?? true;
    this.referencedPartId = options.referencedPartId;
    
    if (options.ports) {
      this._ports = [...options.ports];
    }
  }
  
  /**
   * ポートのIDリストを取得
   */
  get ports(): string[] {
    return [...this._ports];
  }
  
  /**
   * ポートを追加
   * @param portId 追加するポートのID
   */
  addPort(portId: string): void {
    if (!this._ports.includes(portId)) {
      this._ports.push(portId);
    }
  }
  
  /**
   * ポートを削除
   * @param portId 削除するポートのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removePort(portId: string): boolean {
    const initialLength = this._ports.length;
    this._ports = this._ports.filter(id => id !== portId);
    return this._ports.length !== initialLength;
  }
  
  /**
   * JSON形式に変換
   * @returns 部品のJSON表現
   */
  toJSON(): SysML_Part {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'Part',
      stereotype: this.stereotype,
      isComposite: this.isComposite,
      referencedPartId: this.referencedPartId,
      ports: this._ports
    };
  }
  
  /**
   * JSON形式から部品を作成
   * @param json JSON表現
   * @returns 部品インスタンス
   */
  static fromJSON(json: SysML_Part, featureInstances: Feature[] = []): Part {
    // 基本的なFeature情報でPartを初期化
    const part = new Part({
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
      isComposite: json.isComposite,
      referencedPartId: json.referencedPartId,
      ports: json.ports
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === part.id) {
          part.addFeature(feature);
        }
      });
    }
    
    return part;
  }
}