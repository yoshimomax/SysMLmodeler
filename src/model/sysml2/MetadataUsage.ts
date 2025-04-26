import { v4 as uuidv4 } from 'uuid';
import { Usage } from './Usage';
import { SysML2_MetadataUsage } from './interfaces';

/**
 * SysML v2のMetadataUsageクラス
 * システムモデル要素のメタデータの使用を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.24に準拠
 */
export class MetadataUsage extends Usage {
  /** 参照するMetadataDefinitionのID */
  metadataDefinitionId?: string;
  
  /** 注釈を付ける要素のIDリスト */
  annotatedElements: string[];
  
  /**
   * MetadataUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    metadataDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    annotatedElements?: string[];
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.metadataDefinitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages
    });
    
    this.metadataDefinitionId = params.metadataDefinitionId || params.definitionId;
    this.annotatedElements = params.annotatedElements || [];
  }
  
  /**
   * 注釈を付ける要素を追加する
   * @param elementId 追加する要素のID
   */
  addAnnotatedElement(elementId: string): void {
    if (!this.annotatedElements.includes(elementId)) {
      this.annotatedElements.push(elementId);
    }
  }
  
  /**
   * 注釈を付ける要素を削除する
   * @param elementId 削除する要素のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeAnnotatedElement(elementId: string): boolean {
    const index = this.annotatedElements.indexOf(elementId);
    if (index !== -1) {
      this.annotatedElements.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_MetadataUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_MetadataUsage {
    return {
      ...super.toJSON(),
      __type: 'MetadataUsage',
      metadataDefinition: this.metadataDefinitionId,
      annotatedElements: this.annotatedElements
    };
  }
  
  /**
   * JSONオブジェクトからMetadataUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns MetadataUsageインスタンス
   */
  static fromJSON(json: SysML2_MetadataUsage): MetadataUsage {
    return new MetadataUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      metadataDefinitionId: json.metadataDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
      annotatedElements: json.annotatedElements
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
      stereotype: this.stereotype || 'metadata',
      definitionId: this.metadataDefinitionId,
      annotatedElements: this.annotatedElements
    };
  }
}