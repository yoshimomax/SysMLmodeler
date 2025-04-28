import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { Definition } from './Definition';
import { SysML2_PortDefinition } from './interfaces';
import { PortUsage } from './PortUsage';

/**
 * SysML v2 PortDefinition クラス
 * SysML v2 言語仕様のポート定義を表現する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §8.8に準拠
 * 
 * PortDefinitionは、システム間のインタフェース接続点を定義するクラスです。
 * SysML v2では、PortDefinitionはFeatureを継承するDefinitionです。
 */
export class PortDefinition extends Feature {
  /** ポートの型名（インターフェース型など） */
  typeName?: string;
  
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
  
  /** このポート定義を使用するポート使用のIDリスト */
  portUsages: string[] = [];
  
  /** 内部で保持するPortUsageインスタンスのコレクション */
  usages: PortUsage[] = [];
  
  /**
   * PortDefinition コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    name?: string;
    typeName?: string;
    direction?: 'in' | 'out' | 'inout';
    isProxy?: boolean;
    isBehavior?: boolean;
    isConjugated?: boolean;
    multiplicity?: string;
    portUsages?: string[];
    usages?: PortUsage[];
    id?: string;
    ownerId?: string;
    isAbstract?: boolean;
    isVariation?: boolean;
  }) {
    // Definitionクラスのコンストラクタ呼び出し
    super({
      id: options.id,
      name: options.name,
      ownerId: options.ownerId,
      isAbstract: options.isAbstract,
      isVariation: options.isVariation
    });
    
    this.typeName = options.typeName;
    this.direction = options.direction;
    this.multiplicity = options.multiplicity;
    this.portUsages = options.portUsages || [];
    this.usages = options.usages || [];
    
    if (options.isProxy !== undefined) {
      this.isProxy = options.isProxy;
    }
    
    if (options.isBehavior !== undefined) {
      this.isBehavior = options.isBehavior;
    }
    
    if (options.isConjugated !== undefined) {
      this.isConjugated = options.isConjugated;
    }
    
    // 既存のusagesにdefinitionIdが設定されていることを確認
    this.usages.forEach(usage => {
      this.registerPortUsage(usage);
    });
  }
  
  /**
   * PortUsageインスタンスを登録する
   * @param usage 登録するPortUsageインスタンス
   */
  registerPortUsage(usage: PortUsage): void {
    // usageのdefinitionIdを自身のIDに設定
    usage.definitionId = this.id;
    
    // portUsagesリストにIDが未登録なら追加
    if (!this.portUsages.includes(usage.id)) {
      this.portUsages.push(usage.id);
    }
    
    // usagesコレクションにインスタンスが未登録なら追加
    if (!this.usages.some(u => u.id === usage.id)) {
      this.usages.push(usage);
    }
  }
  
  /**
   * ポート使用を追加する
   * @param portUsageId 追加するポート使用のID
   */
  addPortUsage(portUsageId: string): void {
    if (!this.portUsages.includes(portUsageId)) {
      this.portUsages.push(portUsageId);
    }
  }
  
  /**
   * ポート使用を削除する
   * @param portUsageId 削除するポート使用のID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removePortUsage(portUsageId: string): boolean {
    const initialLength = this.portUsages.length;
    this.portUsages = this.portUsages.filter(id => id !== portUsageId);
    
    // usagesコレクションからも削除
    this.usages = this.usages.filter(usage => usage.id !== portUsageId);
    
    return this.portUsages.length !== initialLength;
  }
  
  /**
   * 指定されたIDを持つPortUsageを取得する
   * @param id 取得するPortUsageのID
   * @returns 見つかったPortUsageまたはundefined
   */
  getUsageById(id: string): PortUsage | undefined {
    return this.usages.find(usage => usage.id === id);
  }
  
  /**
   * JSON形式から変換
   * @param json JSON表現
   * @returns PortDefinitionインスタンス
   */
  static fromJSON(json: SysML2_PortDefinition): PortDefinition {
    // まずPortDefinitionインスタンスを作成
    const portDefinition = new PortDefinition({
      id: json.id,
      name: json.name,
      ownerId: json.ownerId,
      typeName: json.typeName,
      direction: json.direction,
      isProxy: json.isProxy,
      isBehavior: json.isBehavior,
      isConjugated: json.isConjugated,
      multiplicity: json.multiplicity,
      portUsages: json.portUsages,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation
    });
    
    // この時点では、usagesコレクションは空です
    // 後続処理でjson.portUsages配列の各IDに対応するPortUsageを生成・登録する必要があります
    // ※一般的にはこの処理はシリアライズ/デシリアライズを管理する上位のクラスやファクトリが行います
    
    return portDefinition;
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): SysML2_PortDefinition {
    return {
      ...super.toJSON(),
      __type: 'PortDefinition',
      typeName: this.typeName,
      direction: this.direction,
      isProxy: this.isProxy,
      isBehavior: this.isBehavior,
      isConjugated: this.isConjugated,
      multiplicity: this.multiplicity,
      portUsages: this.portUsages
    };
  }
  
  /**
   * オブジェクトをプレーンなJavaScriptオブジェクトに変換する（UI表示用）
   * @returns プレーンなJavaScriptオブジェクト
   */
  override toObject() {
    return {
      ...super.toObject(),
      typeName: this.typeName,
      direction: this.direction,
      isProxy: this.isProxy,
      isBehavior: this.isBehavior,
      isConjugated: this.isConjugated,
      multiplicity: this.multiplicity,
      portUsages: this.portUsages,
      stereotype: 'port_def'
    };
  }
}