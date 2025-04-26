import { v4 as uuidv4 } from 'uuid';
import { Usage } from './Usage';
import { SysML2_InterfaceUsage } from './interfaces';

/**
 * SysML v2のInterfaceUsageクラス
 * システム間のインターフェースの使用を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.8に準拠
 */
export class InterfaceUsage extends Usage {
  /** 参照するInterfaceDefinitionのID */
  interfaceDefinitionId?: string;
  
  /** 終端特性のIDリスト */
  endFeatures: string[];
  
  /**
   * InterfaceUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    interfaceDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    endFeatures?: string[];
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.interfaceDefinitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages
    });
    
    this.interfaceDefinitionId = params.interfaceDefinitionId || params.definitionId;
    this.endFeatures = params.endFeatures || [];
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
   * @returns SysML2_InterfaceUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_InterfaceUsage {
    return {
      ...super.toJSON(),
      __type: 'InterfaceUsage',
      interfaceDefinition: this.interfaceDefinitionId,
      endFeatures: this.endFeatures
    };
  }
  
  /**
   * JSONオブジェクトからInterfaceUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns InterfaceUsageインスタンス
   */
  static fromJSON(json: SysML2_InterfaceUsage): InterfaceUsage {
    return new InterfaceUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      interfaceDefinitionId: json.interfaceDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
      endFeatures: json.endFeatures
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
      stereotype: this.stereotype || 'interface',
      definitionId: this.interfaceDefinitionId,
      endFeatures: this.endFeatures
    };
  }
}