import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { Definition } from './Definition';
import { SysML2_ViewpointDefinition } from './interfaces';

/**
 * SysML v2のViewpointDefinitionクラス
 * システムモデルのビューポイントを定義する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.22に準拠
 */
export class ViewpointDefinition extends Definition {
  /** このViewpointDefinitionを使用するViewpointUsageのIDリスト */
  viewpointUsages: string[];
  
  /** このビューポイントで対処する関心事のIDリスト */
  concernsAddressed: string[];
  
  /** このビューポイントに関連するステークホルダーのIDリスト */
  stakeholders: string[];
  
  /**
   * ViewpointDefinition コンストラクタ
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
    viewpointUsages?: string[];
    concernsAddressed?: string[];
    stakeholders?: string[];
  }) {
    super(params);
    
    this.viewpointUsages = params.viewpointUsages || [];
    this.concernsAddressed = params.concernsAddressed || [];
    this.stakeholders = params.stakeholders || [];
  }
  
  /**
   * ViewpointUsageへの参照を追加する
   * @param viewpointUsageId 追加するViewpointUsageのID
   */
  addViewpointUsageReference(viewpointUsageId: string): void {
    if (!this.viewpointUsages.includes(viewpointUsageId)) {
      this.viewpointUsages.push(viewpointUsageId);
    }
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
   * @returns SysML2_ViewpointDefinition形式のJSONオブジェクト
   */
  toJSON(): SysML2_ViewpointDefinition {
    return {
      ...super.toJSON(),
      __type: 'ViewpointDefinition',
      viewpointUsages: this.viewpointUsages,
      concernsAddressed: this.concernsAddressed,
      stakeholders: this.stakeholders
    };
  }
  
  /**
   * JSONオブジェクトからViewpointDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns ViewpointDefinitionインスタンス
   */
  static fromJSON(json: SysML2_ViewpointDefinition): ViewpointDefinition {
    return new ViewpointDefinition({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      ownedFeatures: json.ownedFeatures,
      viewpointUsages: json.viewpointUsages,
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
      stereotype: this.stereotype || 'viewpoint_def',
      isAbstract: this.isAbstract,
      concernsAddressed: this.concernsAddressed,
      stakeholders: this.stakeholders
    };
  }
}