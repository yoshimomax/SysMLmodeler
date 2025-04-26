import { v4 as uuidv4 } from 'uuid';
import { Usage } from './Usage';
import { SysML2_ViewpointUsage } from './interfaces';

/**
 * SysML v2のViewpointUsageクラス
 * システムモデルのビューポイントの使用を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.22に準拠
 */
export class ViewpointUsage extends Usage {
  /** 参照するViewpointDefinitionのID */
  viewpointDefinitionId?: string;
  
  /** このビューポイントで対処する関心事のIDリスト */
  concernsAddressed: string[];
  
  /** このビューポイントに関連するステークホルダーのIDリスト */
  stakeholders: string[];
  
  /**
   * ViewpointUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    viewpointDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    concernsAddressed?: string[];
    stakeholders?: string[];
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.viewpointDefinitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages
    });
    
    this.viewpointDefinitionId = params.viewpointDefinitionId || params.definitionId;
    this.concernsAddressed = params.concernsAddressed || [];
    this.stakeholders = params.stakeholders || [];
  }
  
  /**
   * 対処する関心事を追加する
   * @param concernId 追加する関心事のID
   */
  addConcernAddressed(concernId: string): void {
    if (!this.concernsAddressed.includes(concernId)) {
      this.concernsAddressed.push(concernId);
    }
  }
  
  /**
   * 対処する関心事を削除する
   * @param concernId 削除する関心事のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeConcernAddressed(concernId: string): boolean {
    const index = this.concernsAddressed.indexOf(concernId);
    if (index !== -1) {
      this.concernsAddressed.splice(index, 1);
      return true;
    }
    return false;
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
   * @returns SysML2_ViewpointUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_ViewpointUsage {
    return {
      ...super.toJSON(),
      __type: 'ViewpointUsage',
      viewpointDefinition: this.viewpointDefinitionId,
      concernsAddressed: this.concernsAddressed,
      stakeholders: this.stakeholders
    };
  }
  
  /**
   * JSONオブジェクトからViewpointUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns ViewpointUsageインスタンス
   */
  static fromJSON(json: SysML2_ViewpointUsage): ViewpointUsage {
    return new ViewpointUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      viewpointDefinitionId: json.viewpointDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
      concernsAddressed: json.concernsAddressed,
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
      stereotype: this.stereotype || 'viewpoint',
      definitionId: this.viewpointDefinitionId,
      concernsAddressed: this.concernsAddressed,
      stakeholders: this.stakeholders
    };
  }
}