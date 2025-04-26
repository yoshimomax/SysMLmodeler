import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { Definition } from './Definition';
import { SysML2_MetadataDefinition } from './interfaces';

/**
 * SysML v2のMetadataDefinitionクラス
 * システムモデル要素のメタデータを定義する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.24に準拠
 */
export class MetadataDefinition extends Definition {
  /** このMetadataDefinitionを使用するMetadataUsageのIDリスト */
  metadataUsages: string[];
  
  /** 注釈を付ける要素のIDリスト */
  annotatedElements: string[];
  
  /**
   * MetadataDefinition コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    isAbstract?: boolean;
    isVariation?: boolean;
    stereotype?: string;
    ownedFeatures?: string[] | Feature[];
    metadataUsages?: string[];
    annotatedElements?: string[];
  }) {
    super(params);
    
    this.metadataUsages = params.metadataUsages || [];
    this.annotatedElements = params.annotatedElements || [];
  }
  
  /**
   * MetadataUsageへの参照を追加する
   * @param metadataUsageId 追加するMetadataUsageのID
   */
  addMetadataUsageReference(metadataUsageId: string): void {
    if (!this.metadataUsages.includes(metadataUsageId)) {
      this.metadataUsages.push(metadataUsageId);
    }
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
   * @returns SysML2_MetadataDefinition形式のJSONオブジェクト
   */
  toJSON(): SysML2_MetadataDefinition {
    return {
      ...super.toJSON(),
      __type: 'MetadataDefinition',
      metadataUsages: this.metadataUsages,
      annotatedElements: this.annotatedElements
    };
  }
  
  /**
   * JSONオブジェクトからMetadataDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns MetadataDefinitionインスタンス
   */
  static fromJSON(json: SysML2_MetadataDefinition): MetadataDefinition {
    return new MetadataDefinition({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      ownedFeatures: json.ownedFeatures,
      metadataUsages: json.metadataUsages,
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
      stereotype: this.stereotype || 'metadata_def',
      isAbstract: this.isAbstract,
      annotatedElements: this.annotatedElements
    };
  }
}