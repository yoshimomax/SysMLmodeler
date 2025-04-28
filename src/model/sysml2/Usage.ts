/**
 * SysML v2 Usage クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.7に準拠
 * 
 * Usageは、Definitionのインスタンスを表現する基底クラスです。
 * SysML v2のUsageは、KerMLのFeatureを基底とし、対応するDefinitionと関連付けられます。
 */

import { v4 as uuid } from 'uuid';
import { Feature } from '../kerml/Feature';
import { SysML2_Usage } from './interfaces';
import { validateKerMLFeature } from '../kerml/validators';
import { validateSysMLUsage, ValidationError } from './validator';

/**
 * Usage クラス
 * SysML v2の使用を表現する基底クラス
 */
export class Usage extends Feature {
  /** 変化点・選択肢を表現 */
  isVariation: boolean;
  
  /** 参照する定義のID */
  definitionId?: string;
  
  /** ネストされた使用（Usage）のID配列 */
  nestedUsages: string[];
  
  /**
   * Usage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    description?: string;
    isVariation?: boolean;
    definitionId?: string;
    nestedUsages?: string[] | Feature[];
  }) {
    super({
      id: params.id || uuid(),
      ownerId: params.ownerId,
      name: params.name,
      description: params.description
    });
    
    this.isVariation = params.isVariation ?? false;
    this.definitionId = params.definitionId;
    this.nestedUsages = [];
    
    // ネストされた使用の設定
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
   * ネストされた使用を追加する
   * @param usage 追加する使用
   */
  addNestedUsage(usage: Feature): void {
    usage.ownerId = this.id;
    this.nestedUsages.push(usage.id);
  }
  
  /**
   * ネストされた使用を削除する
   * @param usageId 削除する使用のID
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
   * 定義の参照を設定する
   * @param definitionId 参照する定義のID
   */
  setDefinition(definitionId: string): void {
    this.definitionId = definitionId;
  }
  
  /**
   * KerML制約およびSysML v2の制約を検証する
   * @throws ValidationError 制約違反がある場合
   */
  validate(): void {
    // 基底クラス（KerML Feature）の制約を検証
    validateKerMLFeature(this);
    
    // SysML v2固有の使用要素共通制約を検証
    validateSysMLUsage(this);
    
    // サブクラス固有の制約は、各サブクラスでオーバーライドして追加
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_Usage形式のJSONオブジェクト
   */
  override toJSON(): SysML2_Usage {
    return {
      ...super.toJSON(),
      __type: 'Usage',
      isVariation: this.isVariation,
      definition: this.definitionId,
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
      description: json.description,
      isVariation: json.isVariation,
      definitionId: json.definition,
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
      type: 'usage',
      isVariation: this.isVariation,
      definitionId: this.definitionId,
      nestedUsages: this.nestedUsages
    };
  }
}