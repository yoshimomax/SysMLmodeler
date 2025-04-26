import { v4 as uuidv4 } from 'uuid';

/**
 * Port クラス
 * SysML v2 のポート概念を表現する
 */
export class Port {
  /** ポートの一意識別子 */
  readonly id: string;
  
  /** ポート名 */
  name: string;
  
  /** ポートの型 */
  type: string;
  
  /** このポートを所有するブロックのID */
  ownerBlockId: string;
  
  /** ポートの向き (in, out, inout) */
  direction?: 'in' | 'out' | 'inout';
  
  /** ポートの説明 */
  description?: string;
  
  /** UI上の位置情報（オプション） */
  position?: { x: number; y: number };

  /**
   * Port コンストラクタ
   * @param name ポート名
   * @param type ポートの型
   * @param ownerBlockId 所有ブロックのID（未設定の場合は後で設定必要）
   * @param direction ポートの向き
   * @param description ポートの説明
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    type: string,
    ownerBlockId: string = '',
    direction: 'in' | 'out' | 'inout' = 'inout',
    description?: string,
    id?: string
  ) {
    this.id = id || uuidv4();
    this.name = name;
    this.type = type;
    this.ownerBlockId = ownerBlockId;
    this.direction = direction;
    this.description = description;
  }

  /**
   * ポートの情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      ownerBlockId: this.ownerBlockId,
      direction: this.direction,
      description: this.description,
      position: this.position
    };
  }
}