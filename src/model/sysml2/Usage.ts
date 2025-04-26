import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { SysML2_Usage } from './interfaces';

/**
 * SysML v2のUsage基底クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.6に準拠
 */
export class Usage extends Feature {
  /** 参照するDefinitionのID */
  definitionId?: string;
  
  /** バリエーション要素かどうか */
  isVariation: boolean;
  
  /** ステレオタイプ (SysML v2 Profile適用情報) */
  stereotype?: string;
  
  /** ネストされたUsageのIDリスト */
  nestedUsages: string[];
  
  /**
   * Usage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name
    });
    
    this.definitionId = params.definitionId;
    this.isVariation = params.isVariation ?? false;
    this.stereotype = params.stereotype;
    this.nestedUsages = [];
    
    // ネストされたUsageの設定
    if (params.nestedUsages) {
      params.nestedUsages.forEach(usage => {
        if (typeof usage === 'string') {
          this.nestedUsages.push(usage);
        } else {
          usage.ownerId = this.id;
          this.nestedUsages.push(usage.id);
        }
      });
    }
  }
  
  /**
   * ネストされたUsageを追加する
   * @param usage 追加するUsage
   */
  addNestedUsage(usage: Usage): void {
    usage.ownerId = this.id;
    this.nestedUsages.push(usage.id);
  }
  
  /**
   * ネストされたUsageを削除する
   * @param usageId 削除するUsageのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeNestedUsage(usageId: string): boolean {
    const index = this.nestedUsages.indexOf(usageId);
    if (index !== -1) {
      this.nestedUsages.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_Usage形式のJSONオブジェクト
   */
  toJSON(): SysML2_Usage {
    return {
      ...super.toJSON(),
      __type: 'Usage',
      definition: this.definitionId,
      isVariation: this.isVariation,
      stereotype: this.stereotype,
      nestedUsages: this.nestedUsages
    };
  }
  
  /**
   * JSONオブジェクトからUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns Usageインスタンス
   */
  static fromJSON(json: SysML2_Usage): Usage {
    return new Usage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages || []
    });
  }
}