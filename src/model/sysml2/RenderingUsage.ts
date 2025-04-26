import { v4 as uuidv4 } from 'uuid';
import { Usage } from './Usage';
import { SysML2_RenderingUsage } from './interfaces';

/**
 * SysML v2のRenderingUsageクラス
 * システムモデル要素の表示方法の使用を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.23に準拠
 */
export class RenderingUsage extends Usage {
  /** 参照するRenderingDefinitionのID */
  renderingDefinitionId?: string;
  
  /** レンダリングする要素のIDリスト */
  renderedElements: string[];
  
  /** レンダリングするビューのIDリスト */
  renderedViews: string[];
  
  /**
   * RenderingUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    renderingDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    renderedElements?: string[];
    renderedViews?: string[];
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.renderingDefinitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages
    });
    
    this.renderingDefinitionId = params.renderingDefinitionId || params.definitionId;
    this.renderedElements = params.renderedElements || [];
    this.renderedViews = params.renderedViews || [];
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
   * @returns SysML2_RenderingUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_RenderingUsage {
    return {
      ...super.toJSON(),
      __type: 'RenderingUsage',
      renderingDefinition: this.renderingDefinitionId,
      renderedElements: this.renderedElements,
      renderedViews: this.renderedViews
    };
  }
  
  /**
   * JSONオブジェクトからRenderingUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns RenderingUsageインスタンス
   */
  static fromJSON(json: SysML2_RenderingUsage): RenderingUsage {
    return new RenderingUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      renderingDefinitionId: json.renderingDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
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
      stereotype: this.stereotype || 'rendering',
      definitionId: this.renderingDefinitionId,
      renderedElements: this.renderedElements,
      renderedViews: this.renderedViews
    };
  }
}