import { v4 as uuidv4 } from 'uuid';
import { SysML_ItemFlow } from './interfaces';

/**
 * SysML ItemFlow クラス
 * SysML v2のアイテムフロー（コネクタを通じて流れるアイテム）を表現する
 * OMG仕様：PTC/2023-02-02、SysML v2 Beta1
 */
export class ItemFlow {
  /** アイテムフローの一意識別子 */
  readonly id: string;
  
  /** SysMLステレオタイプ */
  readonly stereotype: string;
  
  /** アイテムフロー名 */
  name?: string;
  
  /** 説明 */
  description?: string;
  
  /** 関連するコネクタのID */
  connectorId: string;
  
  /** アイテムの型のID */
  itemTypeId: string;
  
  /** 送信元のID */
  sourceId: string;
  
  /** 送信先のID */
  targetId: string;
  
  /**
   * ItemFlow コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    stereotype?: string;
    name?: string;
    description?: string;
    connectorId: string;
    itemTypeId: string;
    sourceId: string;
    targetId: string;
  }) {
    this.id = options.id || uuidv4();
    this.stereotype = options.stereotype || 'itemFlow';
    this.name = options.name;
    this.description = options.description;
    this.connectorId = options.connectorId;
    this.itemTypeId = options.itemTypeId;
    this.sourceId = options.sourceId;
    this.targetId = options.targetId;
  }
  
  /**
   * JSON形式に変換
   * @returns アイテムフローのJSON表現
   */
  toJSON(): SysML_ItemFlow {
    return {
      __type: 'ItemFlow',
      id: this.id,
      stereotype: this.stereotype,
      name: this.name,
      description: this.description,
      connectorId: this.connectorId,
      itemTypeId: this.itemTypeId,
      sourceId: this.sourceId,
      targetId: this.targetId
    };
  }
  
  /**
   * JSON形式からアイテムフローを作成
   * @param json JSON表現
   * @returns アイテムフローインスタンス
   */
  static fromJSON(json: SysML_ItemFlow): ItemFlow {
    return new ItemFlow({
      id: json.id,
      stereotype: json.stereotype,
      name: json.name,
      description: json.description,
      connectorId: json.connectorId,
      itemTypeId: json.itemTypeId,
      sourceId: json.sourceId,
      targetId: json.targetId
    });
  }
}