import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { PartDefinition } from './PartDefinition';
import { SysML2_StakeholderDefinition } from './interfaces';

/**
 * SysML v2のStakeholderDefinitionクラス
 * システムに利害関係を持つステークホルダーを定義する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.18に準拠
 */
export class StakeholderDefinition extends PartDefinition {
  /** このStakeholderDefinitionを使用するStakeholderUsageのIDリスト */
  stakeholderUsages: string[];
  
  /** このステークホルダーが持つ関心事のIDリスト */
  concerns: string[];
  
  /** このステークホルダーに関連するビューポイントのIDリスト */
  viewpoints: string[];
  
  /**
   * StakeholderDefinition コンストラクタ
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
    partUsages?: string[];
    stakeholderUsages?: string[];
    concerns?: string[];
    viewpoints?: string[];
  }) {
    super(params);
    
    this.stakeholderUsages = params.stakeholderUsages || [];
    this.concerns = params.concerns || [];
    this.viewpoints = params.viewpoints || [];
    
    // partUsagesにstakeholderUsagesも追加
    if (params.stakeholderUsages) {
      params.stakeholderUsages.forEach(stakeholderUsage => {
        if (!this.partUsages.includes(stakeholderUsage)) {
          this.partUsages.push(stakeholderUsage);
        }
      });
    }
  }
  
  /**
   * StakeholderUsageへの参照を追加する
   * @param stakeholderUsageId 追加するStakeholderUsageのID
   */
  addStakeholderUsageReference(stakeholderUsageId: string): void {
    if (!this.stakeholderUsages.includes(stakeholderUsageId)) {
      this.stakeholderUsages.push(stakeholderUsageId);
      
      // スーパークラスのpartUsagesにも追加
      if (!this.partUsages.includes(stakeholderUsageId)) {
        this.partUsages.push(stakeholderUsageId);
      }
    }
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
   * @returns SysML2_StakeholderDefinition形式のJSONオブジェクト
   */
  toJSON(): SysML2_StakeholderDefinition {
    return {
      ...super.toJSON(),
      __type: 'StakeholderDefinition',
      stakeholderUsages: this.stakeholderUsages,
      concerns: this.concerns,
      viewpoints: this.viewpoints
    };
  }
  
  /**
   * JSONオブジェクトからStakeholderDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns StakeholderDefinitionインスタンス
   */
  static fromJSON(json: SysML2_StakeholderDefinition): StakeholderDefinition {
    return new StakeholderDefinition({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      ownedFeatures: json.ownedFeatures,
      partUsages: json.partUsages,
      stakeholderUsages: json.stakeholderUsages,
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
      stereotype: this.stereotype || 'stakeholder_def',
      isAbstract: this.isAbstract,
      concerns: this.concerns,
      viewpoints: this.viewpoints
    };
  }
}