import { v4 as uuidv4 } from 'uuid';
import { SysML_View } from './interfaces';

/**
 * SysML View クラス
 * SysML v2のビューインスタンスを表現する
 * OMG仕様：PTC/2023-02-02、SysML v2 Beta1
 */
export class View {
  /** ビューの一意識別子 */
  readonly id: string;
  
  /** SysMLステレオタイプ - 常に'view'に設定 */
  readonly stereotype: string = 'view';
  
  /** ビュー名 */
  name?: string;
  
  /** 説明 */
  description?: string;
  
  /** ビュー定義のID */
  viewDefinitionId: string;
  
  /** 実際に表示される要素のID配列 */
  private _renderedElements: string[] = [];
  
  /**
   * View コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    description?: string;
    viewDefinitionId: string;
    renderedElements?: string[];
  }) {
    this.id = options.id || uuidv4();
    this.name = options.name;
    this.description = options.description;
    this.viewDefinitionId = options.viewDefinitionId;
    
    if (options.renderedElements) {
      this._renderedElements = [...options.renderedElements];
    }
  }
  
  /**
   * 実際に表示される要素のID配列を取得
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
   * @returns ビューのJSON表現
   */
  toJSON(): SysML_View {
    return {
      __type: 'View',
      id: this.id,
      stereotype: this.stereotype,
      name: this.name,
      description: this.description,
      viewDefinitionId: this.viewDefinitionId,
      renderedElements: this._renderedElements
    };
  }
  
  /**
   * JSON形式からビューを作成
   * @param json JSON表現
   * @returns ビューインスタンス
   */
  static fromJSON(json: SysML_View): View {
    return new View({
      id: json.id,
      name: json.name,
      description: json.description,
      viewDefinitionId: json.viewDefinitionId,
      renderedElements: json.renderedElements
    });
  }
}