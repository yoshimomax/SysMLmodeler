import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { BlockDefinition } from './BlockDefinition';
import { PartDefinition } from './PartDefinition';

/**
 * SysML v2 PortDefinition クラス
 * SysML v2 言語仕様のポート定義を表現する
 * @see https://www.omg.org/spec/SysML/2.0/Beta1
 */
export class PortDefinition extends Feature {
  /** ポートの所有者となるブロック定義 */
  ownerBlock?: BlockDefinition;
  
  /** ポートの所有者となるパート定義 */
  ownerPart?: PartDefinition;
  
  /** ポートの型（インターフェース型など） */
  typeName: string;
  
  /** ポートの方向 (in, out, inout) */
  direction?: 'in' | 'out' | 'inout';
  
  /** ポートがプロキシかどうか（内部要素に転送するか） */
  isProxy: boolean = false;
  
  /** ポートが振る舞いポートかどうか */
  isBehavior: boolean = false;
  
  /** ポートが共役かどうか（互換ポートとの結合用） */
  isConjugated: boolean = false;
  
  /** ポートの多重度（数量）を表す文字列（例: '0..1', '1..*', '*'） */
  multiplicity?: string;
  
  /** UI上の位置情報（オプション） */
  position?: { x: number; y: number };
  
  /**
   * PortDefinition コンストラクタ
   * @param name ポート名
   * @param typeName ポートの型名
   * @param ownerBlock ポートの所有者となるブロック（オプション）
   * @param direction ポートの方向（オプション）
   * @param multiplicity 多重度（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    typeName: string,
    ownerBlock?: BlockDefinition,
    direction?: 'in' | 'out' | 'inout',
    multiplicity?: string,
    id?: string
  ) {
    // Featureクラスのコンストラクタ呼び出し
    super(name, undefined, undefined, id);
    
    this.typeName = typeName;
    this.ownerBlock = ownerBlock;
    this.direction = direction;
    this.multiplicity = multiplicity;
  }
  
  /**
   * ポートの情報をオブジェクトとして返す
   */
  override toObject() {
    return {
      ...super.toObject(),
      ownerBlockId: this.ownerBlock?.id,
      ownerBlockName: this.ownerBlock?.name,
      ownerPartId: this.ownerPart?.id,
      ownerPartName: this.ownerPart?.name,
      typeName: this.typeName,
      direction: this.direction,
      isProxy: this.isProxy,
      isBehavior: this.isBehavior,
      isConjugated: this.isConjugated,
      multiplicity: this.multiplicity,
      position: this.position
    };
  }
}