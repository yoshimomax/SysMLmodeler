import { v4 as uuidv4 } from 'uuid';
import { Usage } from './Usage';
import { SysML2_ViewUsage } from './interfaces';

/**
 * SysML v2のViewUsageクラス
 * システムモデルのビューの使用を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.21に準拠
 */
export class ViewUsage extends Usage {
  /** 参照するViewDefinitionのID */
  viewDefinitionId?: string;
  
  /** 関連するViewpointDefinitionのID */
  viewpointDefinitionId?: string;
  
  /** 満たすビューポイントのIDリスト */
  satisfiedViewpoints: string[];
  
  /** レンダリングする要素のIDリスト */
  renderedElements: string[];
  
  /**
   * ViewUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    viewDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    viewpointDefinitionId?: string;
    satisfiedViewpoints?: string[];
    renderedElements?: string[];
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.viewDefinitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages
    });
    
    this.viewDefinitionId = params.viewDefinitionId || params.definitionId;
    this.viewpointDefinitionId = params.viewpointDefinitionId;
    this.satisfiedViewpoints = params.satisfiedViewpoints || [];
    this.renderedElements = params.renderedElements || [];
  }
  
  /**
   * 満たすビューポイントを追加する
   * @param viewpointId 追加するビューポイントのID
   */
  addSatisfiedViewpoint(viewpointId: string): void {
    if (!this.satisfiedViewpoints.includes(viewpointId)) {
      this.satisfiedViewpoints.push(viewpointId);
    }
  }
  
  /**
   * 満たすビューポイントを削除する
   * @param viewpointId 削除するビューポイントのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeSatisfiedViewpoint(viewpointId: string): boolean {
    const index = this.satisfiedViewpoints.indexOf(viewpointId);
    if (index !== -1) {
      this.satisfiedViewpoints.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * レンダリングする要素を追加する
   * @param elementId 追加する要素のID
   */
  addRenderedElement(elementId: string): void {
    if (!this.renderedElements.includes(elementId)) {
      this.renderedElements.push(elementId);
    }
  }
  
  /**
   * レンダリングする要素を削除する
   * @param elementId 削除する要素のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeRenderedElement(elementId: string): boolean {
    const index = this.renderedElements.indexOf(elementId);
    if (index !== -1) {
      this.renderedElements.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_ViewUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_ViewUsage {
    return {
      ...super.toJSON(),
      __type: 'ViewUsage',
      viewDefinition: this.viewDefinitionId,
      viewpointDefinition: this.viewpointDefinitionId,
      satisfiedViewpoints: this.satisfiedViewpoints,
      renderedElements: this.renderedElements
    };
  }
  
  /**
   * JSONオブジェクトからViewUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns ViewUsageインスタンス
   */
  static fromJSON(json: SysML2_ViewUsage): ViewUsage {
    return new ViewUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      viewDefinitionId: json.viewDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
      viewpointDefinitionId: json.viewpointDefinition,
      satisfiedViewpoints: json.satisfiedViewpoints,
      renderedElements: json.renderedElements
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
      stereotype: this.stereotype || 'view',
      definitionId: this.viewDefinitionId,
      viewpointDefinitionId: this.viewpointDefinitionId,
      satisfiedViewpoints: this.satisfiedViewpoints,
      renderedElements: this.renderedElements
    };
  }
}