import { v4 as uuidv4 } from 'uuid';
import { SysML_Connector } from './interfaces';

/**
 * SysML Connector クラス
 * SysML v2のコネクタ（要素間の接続）を表現する
 * OMG仕様：PTC/2023-02-02、SysML v2 Beta1
 */
export class Connector {
  /** コネクタの一意識別子 */
  readonly id: string;
  
  /** SysMLステレオタイプ */
  readonly stereotype: string;
  
  /** コネクタ名 */
  name?: string;
  
  /** 説明 */
  description?: string;
  
  /** 接続元のID */
  sourceId: string;
  
  /** 接続先のID */
  targetId: string;
  
  /** 接続元ポートのID（オプション） */
  sourcePortId?: string;
  
  /** 接続先ポートのID（オプション） */
  targetPortId?: string;
  
  /** コネクタの型（関連）のID */
  typeId?: string;
  
  /** 親要素のID */
  parentId: string;
  
  /**
   * Connector コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    stereotype?: string;
    name?: string;
    description?: string;
    sourceId: string;
    targetId: string;
    sourcePortId?: string;
    targetPortId?: string;
    typeId?: string;
    parentId: string;
  }) {
    this.id = options.id || uuidv4();
    this.stereotype = options.stereotype || 'connector';
    this.name = options.name;
    this.description = options.description;
    this.sourceId = options.sourceId;
    this.targetId = options.targetId;
    this.sourcePortId = options.sourcePortId;
    this.targetPortId = options.targetPortId;
    this.typeId = options.typeId;
    this.parentId = options.parentId;
  }
  
  /**
   * JSON形式に変換
   * @returns コネクタのJSON表現
   */
  toJSON(): SysML_Connector {
    return {
      __type: 'Connector',
      id: this.id,
      stereotype: this.stereotype,
      name: this.name,
      description: this.description,
      sourceId: this.sourceId,
      targetId: this.targetId,
      sourcePortId: this.sourcePortId,
      targetPortId: this.targetPortId,
      typeId: this.typeId,
      parentId: this.parentId
    };
  }
  
  /**
   * JSON形式からコネクタを作成
   * @param json JSON表現
   * @returns コネクタインスタンス
   */
  static fromJSON(json: SysML_Connector): Connector {
    return new Connector({
      id: json.id,
      stereotype: json.stereotype,
      name: json.name,
      description: json.description,
      sourceId: json.sourceId,
      targetId: json.targetId,
      sourcePortId: json.sourcePortId,
      targetPortId: json.targetPortId,
      typeId: json.typeId,
      parentId: json.parentId
    });
  }
}