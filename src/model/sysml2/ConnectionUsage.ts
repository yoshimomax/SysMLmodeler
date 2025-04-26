import { v4 as uuidv4 } from 'uuid';
import { Usage } from './Usage';
import { SysML2_ConnectionUsage } from './interfaces';

/**
 * SysML v2のConnectionUsageクラス
 * システム要素間の接続の使用を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.9に準拠
 */
export class ConnectionUsage extends Usage {
  /** 参照するConnectionDefinitionのID */
  connectionDefinitionId?: string;
  
  /** 終端特性のIDリスト */
  endFeatures: string[];
  
  /** 接続元の型ID */
  sourceTypeId?: string;
  
  /** 接続先の型ID */
  targetTypeId?: string;
  
  /**
   * ConnectionUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    connectionDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    endFeatures?: string[];
    sourceTypeId?: string;
    targetTypeId?: string;
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.connectionDefinitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages
    });
    
    this.connectionDefinitionId = params.connectionDefinitionId || params.definitionId;
    this.endFeatures = params.endFeatures || [];
    this.sourceTypeId = params.sourceTypeId;
    this.targetTypeId = params.targetTypeId;
  }
  
  /**
   * 終端特性を追加する
   * @param featureId 追加する特性のID
   */
  addEndFeature(featureId: string): void {
    if (!this.endFeatures.includes(featureId)) {
      this.endFeatures.push(featureId);
    }
  }
  
  /**
   * 終端特性を削除する
   * @param featureId 削除する特性のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeEndFeature(featureId: string): boolean {
    const index = this.endFeatures.indexOf(featureId);
    if (index !== -1) {
      this.endFeatures.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_ConnectionUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_ConnectionUsage {
    return {
      ...super.toJSON(),
      __type: 'ConnectionUsage',
      connectionDefinition: this.connectionDefinitionId,
      endFeatures: this.endFeatures,
      sourceType: this.sourceTypeId,
      targetType: this.targetTypeId
    };
  }
  
  /**
   * JSONオブジェクトからConnectionUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns ConnectionUsageインスタンス
   */
  static fromJSON(json: SysML2_ConnectionUsage): ConnectionUsage {
    return new ConnectionUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      connectionDefinitionId: json.connectionDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
      endFeatures: json.endFeatures,
      sourceTypeId: json.sourceType,
      targetTypeId: json.targetType
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
      stereotype: this.stereotype || 'connection',
      definitionId: this.connectionDefinitionId,
      endFeatures: this.endFeatures,
      sourceTypeId: this.sourceTypeId,
      targetTypeId: this.targetTypeId
    };
  }
}