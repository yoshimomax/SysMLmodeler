import { v4 as uuidv4 } from 'uuid';
import { Type } from '../kerml/Type';
import { Feature } from '../kerml/Feature';
import { SysML_ViewDefinition } from './interfaces';

/**
 * SysML ViewDefinition クラス
 * SysML v2のビュー定義を表現する
 * OMG仕様：PTC/2023-02-02、SysML v2 Beta1
 */
export class ViewDefinition extends Type {
  /** SysMLステレオタイプ - 常に'viewDefinition'に設定 */
  readonly stereotype: string = 'viewDefinition';
  
  /** 表示する要素のID配列 */
  private _renderedElements: string[] = [];
  
  /** 関連するビューポイントのID */
  viewpointId?: string;
  
  /**
   * ViewDefinition コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    ownerId?: string;
    name?: string;
    shortName?: string;
    qualifiedName?: string;
    description?: string;
    isAbstract?: boolean;
    isConjugated?: boolean;
    features?: Feature[];
    renderedElements?: string[];
    viewpointId?: string;
  } = {}) {
    // 親クラスのコンストラクタを呼び出し
    super({
      id: options.id || uuidv4(),
      ownerId: options.ownerId,
      name: options.name,
      shortName: options.shortName,
      qualifiedName: options.qualifiedName,
      description: options.description,
      isAbstract: options.isAbstract,
      isConjugated: options.isConjugated,
      features: options.features
    });
    
    if (options.renderedElements) {
      this._renderedElements = [...options.renderedElements];
    }
    
    this.viewpointId = options.viewpointId;
  }
  
  /**
   * 表示する要素のID配列を取得
   */
  get renderedElements(): string[] {
    return [...this._renderedElements];
  }
  
  /**
   * 表示する要素を追加
   * @param elementId 追加する要素のID
   */
  addRenderedElement(elementId: string): void {
    if (!this._renderedElements.includes(elementId)) {
      this._renderedElements.push(elementId);
    }
  }
  
  /**
   * 表示する要素を削除
   * @param elementId 削除する要素のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeRenderedElement(elementId: string): boolean {
    const initialLength = this._renderedElements.length;
    this._renderedElements = this._renderedElements.filter(id => id !== elementId);
    return this._renderedElements.length !== initialLength;
  }
  
  /**
   * JSON形式に変換
   * @returns ビュー定義のJSON表現
   */
  toJSON(): SysML_ViewDefinition {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'ViewDefinition',
      stereotype: this.stereotype,
      renderedElements: this._renderedElements,
      viewpointId: this.viewpointId
    };
  }
  
  /**
   * JSON形式からビュー定義を作成
   * @param json JSON表現
   * @returns ビュー定義インスタンス
   */
  static fromJSON(json: SysML_ViewDefinition, featureInstances: Feature[] = []): ViewDefinition {
    // 基本的なType情報でViewDefinitionを初期化
    const viewDefinition = new ViewDefinition({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      isAbstract: json.isAbstract,
      isConjugated: json.isConjugated,
      renderedElements: json.renderedElements,
      viewpointId: json.viewpointId
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === viewDefinition.id) {
          viewDefinition.addFeature(feature);
        }
      });
    }
    
    return viewDefinition;
  }
}