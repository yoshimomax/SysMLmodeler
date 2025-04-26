import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { PortDefinition } from './PortDefinition';

/**
 * SysML v2 ConnectionDefinition クラス
 * SysML v2 言語仕様の接続定義を表現する
 * @see https://www.omg.org/spec/SysML/2.0/Beta1
 */
export class ConnectionDefinition extends Feature {
  /** 接続元ポートのID */
  sourcePortId: string;
  
  /** 接続元ポートの参照 */
  sourcePort?: PortDefinition;
  
  /** 接続先ポートのID */
  targetPortId: string;
  
  /** 接続先ポートの参照 */
  targetPort?: PortDefinition;
  
  /** 
   * ステレオタイプ (例: flow, item flow, connector)
   * SysML v2 では接続の種類を表現するのに使用
   */
  stereotype: string;
  
  /** 接続の名前（オプション） */
  connectionName?: string;
  
  /** 
   * 転送アイテム（フローの場合）
   * 接続を通じて流れる情報やアイテムの型
   */
  itemType?: string;
  
  /** 接続パス上の中間点（UI表示用） */
  vertices?: { x: number; y: number }[];
  
  /**
   * ConnectionDefinition コンストラクタ
   * @param sourcePortId 接続元ポートのID
   * @param targetPortId 接続先ポートのID
   * @param stereotype 接続の種類/ステレオタイプ
   * @param connectionName 接続の名前（オプション）
   * @param itemType 転送アイテムの型（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    sourcePortId: string,
    targetPortId: string,
    stereotype: string,
    connectionName?: string,
    itemType?: string,
    id?: string
  ) {
    // 接続名が未指定の場合は生成する
    const name = connectionName || `connection_${sourcePortId.substring(0, 4)}_${targetPortId.substring(0, 4)}`;
    
    // Featureクラスのコンストラクタ呼び出し
    super(name, undefined, undefined, id);
    
    this.sourcePortId = sourcePortId;
    this.targetPortId = targetPortId;
    this.stereotype = stereotype;
    this.connectionName = connectionName;
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
   * ポート参照を設定する
   * @param sourcePort 接続元ポート
   * @param targetPort 接続先ポート
   */
  setPorts(sourcePort: PortDefinition, targetPort: PortDefinition): void {
    this.sourcePort = sourcePort;
    this.targetPort = targetPort;
  }
  
  /**
   * 接続の情報をオブジェクトとして返す
   */
  override toObject() {
    return {
      ...super.toObject(),
      sourcePortId: this.sourcePortId,
      sourcePortName: this.sourcePort?.name,
      targetPortId: this.targetPortId,
      targetPortName: this.targetPort?.name,
      stereotype: this.stereotype,
      connectionName: this.connectionName,
      itemType: this.itemType,
      vertices: this.vertices
    };
  }
}