import { v4 as uuidv4 } from 'uuid';

/**
 * Connection クラス
 * SysML v2 の接続概念を表現する
 */
export class Connection {
  /** 接続の一意識別子 */
  readonly id: string;
  
  /** 接続元ポートのID */
  sourcePortId: string;
  
  /** 接続先ポートのID */
  targetPortId: string;
  
  /** 
   * ステレオタイプ (例: flow, item flow, connector)
   * SysML v2 では接続の種類を表現するのに使用
   */
  stereotype: string;
  
  /** 接続の名前（オプション） */
  name?: string;
  
  /** 接続の説明（オプション） */
  description?: string;
  
  /** 
   * 転送アイテム（フローの場合）
   * 接続を通じて流れる情報やアイテムの型
   */
  itemType?: string;
  
  /** 接続パス上の中間点（UI表示用） */
  vertices?: { x: number; y: number }[];

  /**
   * Connection コンストラクタ
   * @param sourcePortId 接続元ポートのID
   * @param targetPortId 接続先ポートのID
   * @param stereotype 接続の種類/ステレオタイプ
   * @param name 接続の名前（オプション）
   * @param description 接続の説明（オプション）
   * @param itemType 転送アイテムの型（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    sourcePortId: string,
    targetPortId: string,
    stereotype: string = 'connector',
    name?: string,
    description?: string,
    itemType?: string,
    id?: string
  ) {
    this.id = id || uuidv4();
    this.sourcePortId = sourcePortId;
    this.targetPortId = targetPortId;
    this.stereotype = stereotype;
    this.name = name;
    this.description = description;
    this.itemType = itemType;
  }

  /**
   * 中間点を設定する
   * @param vertices 中間点の配列
   */
  setVertices(vertices: { x: number; y: number }[]): void {
    this.vertices = vertices;
  }

  /**
   * 接続の情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      sourcePortId: this.sourcePortId,
      targetPortId: this.targetPortId,
      stereotype: this.stereotype,
      name: this.name,
      description: this.description,
      itemType: this.itemType,
      vertices: this.vertices
    };
  }
}