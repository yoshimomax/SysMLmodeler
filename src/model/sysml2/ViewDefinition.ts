import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { Definition } from './Definition';
import { SysML2_ViewDefinition } from './interfaces';

/**
 * SysML v2のViewDefinitionクラス
 * システムモデルのビューを定義する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.21に準拠
 */
export class ViewDefinition extends Definition {
  /** このViewDefinitionを使用するViewUsageのIDリスト */
  viewUsages: string[];
  
  /** 関連するViewpointDefinitionのID */
  viewpointDefinitionId?: string;
  
  /** 満たすビューポイントのIDリスト */
  satisfiedViewpoints: string[];
  
  /** レンダリングする要素のIDリスト */
  renderedElements: string[];
  
  /**
   * ViewDefinition コンストラクタ
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
    viewUsages?: string[];
    viewpointDefinitionId?: string;
    satisfiedViewpoints?: string[];
    renderedElements?: string[];
  }) {
    super(params);
    
    this.viewUsages = params.viewUsages || [];
    this.viewpointDefinitionId = params.viewpointDefinitionId;
    this.satisfiedViewpoints = params.satisfiedViewpoints || [];
    this.renderedElements = params.renderedElements || [];
  }
  
  /**
   * ViewUsageへの参照を追加する
   * @param viewUsageId 追加するViewUsageのID
   */
  addViewUsageReference(viewUsageId: string): void {
    if (!this.viewUsages.includes(viewUsageId)) {
      this.viewUsages.push(viewUsageId);
    }
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
   * @returns SysML2_ViewDefinition形式のJSONオブジェクト
   */
  toJSON(): SysML2_ViewDefinition {
    return {
      ...super.toJSON(),
      __type: 'ViewDefinition',
      viewUsages: this.viewUsages,
      viewpointDefinition: this.viewpointDefinitionId,
      satisfiedViewpoints: this.satisfiedViewpoints,
      renderedElements: this.renderedElements
    };
  }
  
  /**
   * JSONオブジェクトからViewDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns ViewDefinitionインスタンス
   */
  static fromJSON(json: SysML2_ViewDefinition): ViewDefinition {
    return new ViewDefinition({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      ownedFeatures: json.ownedFeatures,
      viewUsages: json.viewUsages,
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
      stereotype: this.stereotype || 'view_def',
      isAbstract: this.isAbstract,
      viewpointDefinitionId: this.viewpointDefinitionId,
      satisfiedViewpoints: this.satisfiedViewpoints,
      renderedElements: this.renderedElements
    };
  }
}