import { v4 as uuidv4 } from 'uuid';
import { PartUsage } from './PartUsage';
import { Usage } from './Usage';
import { SysML2_StakeholderUsage } from './interfaces';

/**
 * SysML v2のStakeholderUsageクラス
 * システムに利害関係を持つステークホルダーの使用を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.18に準拠
 */
export class StakeholderUsage extends PartUsage {
  /** 参照するStakeholderDefinitionのID */
  stakeholderDefinitionId?: string;
  
  /** このステークホルダーが持つ関心事のIDリスト */
  concerns: string[];
  
  /** このステークホルダーに関連するビューポイントのIDリスト */
  viewpoints: string[];
  
  /**
   * StakeholderUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    partDefinitionId?: string;
    stakeholderDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    concerns?: string[];
    viewpoints?: string[];
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.partDefinitionId || params.stakeholderDefinitionId,
      partDefinitionId: params.partDefinitionId || params.stakeholderDefinitionId || params.definitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages
    });
    
    this.stakeholderDefinitionId = params.stakeholderDefinitionId || params.partDefinitionId || params.definitionId;
    this.concerns = params.concerns || [];
    this.viewpoints = params.viewpoints || [];
  }
  
  /**
   * 関心事を追加する
   * @param concernId 追加する関心事のID
   */
  addConcern(concernId: string): void {
    if (!this.concerns.includes(concernId)) {
      this.concerns.push(concernId);
    }
  }
  
  /**
   * 関心事を削除する
   * @param concernId 削除する関心事のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeConcern(concernId: string): boolean {
    const index = this.concerns.indexOf(concernId);
    if (index !== -1) {
      this.concerns.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * ビューポイントを追加する
   * @param viewpointId 追加するビューポイントのID
   */
  addViewpoint(viewpointId: string): void {
    if (!this.viewpoints.includes(viewpointId)) {
      this.viewpoints.push(viewpointId);
    }
  }
  
  /**
   * ビューポイントを削除する
   * @param viewpointId 削除するビューポイントのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeViewpoint(viewpointId: string): boolean {
    const index = this.viewpoints.indexOf(viewpointId);
    if (index !== -1) {
      this.viewpoints.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_StakeholderUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_StakeholderUsage {
    return {
      ...super.toJSON(),
      __type: 'StakeholderUsage',
      stakeholderDefinition: this.stakeholderDefinitionId,
      concerns: this.concerns,
      viewpoints: this.viewpoints
    };
  }
  
  /**
   * JSONオブジェクトからStakeholderUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns StakeholderUsageインスタンス
   */
  static fromJSON(json: SysML2_StakeholderUsage): StakeholderUsage {
    return new StakeholderUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      partDefinitionId: json.partDefinition,
      stakeholderDefinitionId: json.stakeholderDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
      concerns: json.concerns,
      viewpoints: json.viewpoints
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
      stereotype: this.stereotype || 'stakeholder',
      definitionId: this.stakeholderDefinitionId,
      concerns: this.concerns,
      viewpoints: this.viewpoints
    };
  }
}