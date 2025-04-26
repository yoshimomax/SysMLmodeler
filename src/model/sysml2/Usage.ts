import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { SysML2_Usage } from './interfaces';
import { validateKerMLFeature } from '../kerml/validators';

/**
 * SysML v2のUsage基底クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.6に準拠
 * 
 * Usageは、システム要素のインスタンス使用を表すクラスです。
 * SysML v2のUsageは、KerMLのFeatureを基底とし、対応するDefinitionと関連付けられます。
 */
export class Usage extends Feature {
  /** 参照するDefinitionのID */
  definitionId?: string;
  
  /** バリエーション要素かどうか */
  isVariation: boolean;

  /** 抽象要素かどうか */
  isAbstract: boolean;
  
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
    isAbstract?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      isAbstract: params.isAbstract
    });
    
    this.definitionId = params.definitionId;
    this.isVariation = params.isVariation ?? false;
    this.isAbstract = params.isAbstract ?? false;
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
    
    // KerML制約の検証
    try {
      this.validate();
    } catch (error) {
      console.warn(`警告: Usage(id=${this.id}, name=${this.name}) の検証中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`);
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
   * 関連付けられたDefinitionを変更する
   * @param definitionId 新しいDefinitionのID
   */
  setDefinition(definitionId: string): void {
    this.definitionId = definitionId;
  }
  
  /**
   * KerML制約およびSysML v2の制約を検証する
   * @throws Error 制約違反がある場合
   */
  validate(): void {
    // 基底クラス（KerML Feature）の制約を検証
    validateKerMLFeature(this);
    
    // SysML v2固有の制約を検証
    if (this.isAbstract && !this.definitionId) {
      console.warn(`警告: 抽象Usage(id=${this.id}, name=${this.name})にDefinitionが関連付けられていません`);
    }
    
    // 型チェック
    if (!this.definitionId && !this.isAbstract) {
      console.warn(`警告: Usage(id=${this.id}, name=${this.name})はDefinitionと関連付けられていません`);
    }
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
      isAbstract: this.isAbstract,
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
      isAbstract: json.isAbstract,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages || []
    });
  }
  
  /**
   * オブジェクトをプレーンなJavaScriptオブジェクトに変換する（UI表示用）
   * @returns プレーンなJavaScriptオブジェクト
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      stereotype: this.stereotype || 'usage',
      isAbstract: this.isAbstract,
      isVariation: this.isVariation,
      definitionId: this.definitionId,
      nestedUsages: this.nestedUsages
    };
  }
}