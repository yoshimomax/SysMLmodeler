import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { Definition } from './Definition';
import { SysML2_RenderingDefinition } from './interfaces';

/**
 * SysML v2のRenderingDefinitionクラス
 * システムモデル要素の表示方法を定義する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.23に準拠
 */
export class RenderingDefinition extends Definition {
  /** このRenderingDefinitionを使用するRenderingUsageのIDリスト */
  renderingUsages: string[];
  
  /** レンダリングする要素のIDリスト */
  renderedElements: string[];
  
  /** レンダリングするビューのIDリスト */
  renderedViews: string[];
  
  /**
   * RenderingDefinition コンストラクタ
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
    renderingUsages?: string[];
    renderedElements?: string[];
    renderedViews?: string[];
  }) {
    super(params);
    
    this.renderingUsages = params.renderingUsages || [];
    this.renderedElements = params.renderedElements || [];
    this.renderedViews = params.renderedViews || [];
  }
  
  /**
   * RenderingUsageへの参照を追加する
   * @param renderingUsageId 追加するRenderingUsageのID
   */
  addRenderingUsageReference(renderingUsageId: string): void {
    if (!this.renderingUsages.includes(renderingUsageId)) {
      this.renderingUsages.push(renderingUsageId);
    }
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
   * レンダリングするビューを追加する
   * @param viewId 追加するビューのID
   */
  addRenderedView(viewId: string): void {
    if (!this.renderedViews.includes(viewId)) {
      this.renderedViews.push(viewId);
    }
  }
  
  /**
   * レンダリングするビューを削除する
   * @param viewId 削除するビューのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeRenderedView(viewId: string): boolean {
    const index = this.renderedViews.indexOf(viewId);
    if (index !== -1) {
      this.renderedViews.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_RenderingDefinition形式のJSONオブジェクト
   */
  toJSON(): SysML2_RenderingDefinition {
    return {
      ...super.toJSON(),
      __type: 'RenderingDefinition',
      renderingUsages: this.renderingUsages,
      renderedElements: this.renderedElements,
      renderedViews: this.renderedViews
    };
  }
  
  /**
   * JSONオブジェクトからRenderingDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns RenderingDefinitionインスタンス
   */
  static fromJSON(json: SysML2_RenderingDefinition): RenderingDefinition {
    return new RenderingDefinition({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      ownedFeatures: json.ownedFeatures,
      renderingUsages: json.renderingUsages,
      renderedElements: json.renderedElements,
      renderedViews: json.renderedViews
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
      stereotype: this.stereotype || 'rendering_def',
      isAbstract: this.isAbstract,
      renderedElements: this.renderedElements,
      renderedViews: this.renderedViews
    };
  }
}