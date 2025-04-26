import { v4 as uuidv4 } from 'uuid';
import { Usage } from './Usage';
import { SysML2_ConcernUsage } from './interfaces';

/**
 * SysML v2のConcernUsageクラス
 * ステークホルダーの関心事の使用を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.16に準拠
 */
export class ConcernUsage extends Usage {
  /** 参照するConcernDefinitionのID */
  concernDefinitionId?: string;
  
  /** 関心事に関連するステークホルダーのIDリスト */
  stakeholders: string[];
  
  /**
   * ConcernUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    concernDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    stakeholders?: string[];
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.concernDefinitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages
    });
    
    this.concernDefinitionId = params.concernDefinitionId || params.definitionId;
    this.stakeholders = params.stakeholders || [];
  }
  
  /**
   * ステークホルダーを追加する
   * @param stakeholderId 追加するステークホルダーのID
   */
  addStakeholder(stakeholderId: string): void {
    if (!this.stakeholders.includes(stakeholderId)) {
      this.stakeholders.push(stakeholderId);
    }
  }
  
  /**
   * ステークホルダーを削除する
   * @param stakeholderId 削除するステークホルダーのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeStakeholder(stakeholderId: string): boolean {
    const index = this.stakeholders.indexOf(stakeholderId);
    if (index !== -1) {
      this.stakeholders.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_ConcernUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_ConcernUsage {
    return {
      ...super.toJSON(),
      __type: 'ConcernUsage',
      concernDefinition: this.concernDefinitionId,
      stakeholders: this.stakeholders
    };
  }
  
  /**
   * JSONオブジェクトからConcernUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns ConcernUsageインスタンス
   */
  static fromJSON(json: SysML2_ConcernUsage): ConcernUsage {
    return new ConcernUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      concernDefinitionId: json.concernDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
      stakeholders: json.stakeholders
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
      stereotype: this.stereotype || 'concern',
      definitionId: this.concernDefinitionId,
      stakeholders: this.stakeholders
    };
  }
}