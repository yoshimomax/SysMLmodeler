import { v4 as uuidv4 } from 'uuid';
import { Usage } from './Usage';
import { PortDefinition } from './PortDefinition';
import { SysML2_PortUsage } from './interfaces';

/**
 * SysML v2 PortUsage クラス
 * SysML v2 言語仕様のポート使用を表現する
 * @see https://www.omg.org/spec/SysML/2.0/Beta3
 */
export class PortUsage extends Usage {
  /** 参照するポート定義 */
  portDefinition?: PortDefinition;

  /** ポート定義のID */
  portDefinitionId?: string;

  /** ポートの配置位置（レイアウト情報） */
  position?: { x: number; y: number };

  /** ポートのサイズ（レイアウト情報） */
  size?: { width: number; height: number };

  /** ポートが持つフロー仕様 */
  flowSpecifications: string[] = [];

  /** ポートの接続点（インターフェース仕様） */
  interfaces: string[] = [];

  /** ポートの方向 (in, out, inout) */
  direction?: 'in' | 'out' | 'inout';

  /** ポートの互換性（コンジュゲート） */
  isConjugated: boolean = false;

  /**
   * PortUsage コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    name?: string;
    portDefinitionId?: string;
    portDefinition?: PortDefinition;
    direction?: 'in' | 'out' | 'inout';
    isConjugated?: boolean;
    position?: { x: number; y: number };
    size?: { width: number; height: number };
    flowSpecifications?: string[];
    interfaces?: string[];
    id?: string;
    ownerId?: string;
    isAbstract?: boolean;
  }) {
    // Usageクラスのコンストラクタ呼び出し
    super({
      id: options.id,
      name: options.name,
      definitionId: options.portDefinitionId,
      ownerId: options.ownerId,
      isAbstract: options.isAbstract
    });

    this.portDefinitionId = options.portDefinitionId;
    this.portDefinition = options.portDefinition;
    this.direction = options.direction;
    this.position = options.position;
    this.size = options.size;
    this.flowSpecifications = options.flowSpecifications || [];
    this.interfaces = options.interfaces || [];

    if (options.isConjugated !== undefined) {
      this.isConjugated = options.isConjugated;
    }
  }

  /**
   * フロー仕様を追加する
   * @param flowSpecId 追加するフロー仕様のID
   */
  addFlowSpecification(flowSpecId: string): void {
    if (!this.flowSpecifications.includes(flowSpecId)) {
      this.flowSpecifications.push(flowSpecId);
    }
  }

  /**
   * インターフェースを追加する
   * @param interfaceId 追加するインターフェースのID
   */
  addInterface(interfaceId: string): void {
    if (!this.interfaces.includes(interfaceId)) {
      this.interfaces.push(interfaceId);
    }
  }

  /**
   * フロー仕様を削除する
   * @param flowSpecId 削除するフロー仕様のID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeFlowSpecification(flowSpecId: string): boolean {
    const initialLength = this.flowSpecifications.length;
    this.flowSpecifications = this.flowSpecifications.filter(id => id !== flowSpecId);
    return this.flowSpecifications.length !== initialLength;
  }

  /**
   * インターフェースを削除する
   * @param interfaceId 削除するインターフェースのID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeInterface(interfaceId: string): boolean {
    const initialLength = this.interfaces.length;
    this.interfaces = this.interfaces.filter(id => id !== interfaceId);
    return this.interfaces.length !== initialLength;
  }

  /**
   * JSON形式から変換
   * @param json JSON表現
   * @returns PortUsageインスタンス
   */
  static fromJSON(json: SysML2_PortUsage): PortUsage {
    return new PortUsage({
      id: json.id,
      name: json.name,
      ownerId: json.ownerId,
      portDefinitionId: json.portDefinition,
      direction: json.direction,
      isConjugated: json.isConjugated,
      flowSpecifications: json.flowSpecifications,
      interfaces: json.interfaces,
      isAbstract: json.isAbstract
    });
  }

  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): SysML2_PortUsage {
    return {
      __type: 'PortUsage',
      id: this.id,
      name: this.name,
      ownerId: this.ownerId,
      portDefinition: this.portDefinitionId,
      direction: this.direction,
      isConjugated: this.isConjugated,
      flowSpecifications: this.flowSpecifications,
      interfaces: this.interfaces,
      isAbstract: this.isAbstract
    };
  }

  /**
   * オブジェクトをプレーンなJavaScriptオブジェクトに変換する（UI表示用）
   * @returns プレーンなJavaScriptオブジェクト
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      stereotype: 'port',
      definitionId: this.portDefinitionId,
      direction: this.direction,
      isConjugated: this.isConjugated,
      flowSpecifications: this.flowSpecifications,
      interfaces: this.interfaces,
      position: this.position,
      size: this.size,
      isAbstract: this.isAbstract
    };
  }
}