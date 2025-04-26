import { v4 as uuidv4 } from 'uuid';
import { SysML_Model, SysML_Element } from './interfaces';

/**
 * SysML Model クラス
 * SysML v2モデル全体を表現する
 * OMG仕様：PTC/2023-02-02、SysML v2 Beta1
 */
export class Model {
  /** モデルの一意識別子 */
  readonly id: string;
  
  /** SysMLステレオタイプ - 常に'model'に設定 */
  readonly stereotype: string = 'model';
  
  /** モデル名 */
  name: string;
  
  /** 説明 */
  description?: string;
  
  /** ルートパッケージのID配列 */
  private _rootPackageIds: string[] = [];
  
  /** すべてのモデル要素の配列 */
  private _elements: SysML_Element[] = [];
  
  /**
   * Model コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name: string;
    description?: string;
    rootPackageIds?: string[];
    elements?: SysML_Element[];
  }) {
    this.id = options.id || uuidv4();
    this.name = options.name;
    this.description = options.description;
    
    if (options.rootPackageIds) {
      this._rootPackageIds = [...options.rootPackageIds];
    }
    
    if (options.elements) {
      this._elements = [...options.elements];
    }
  }
  
  /**
   * ルートパッケージのID配列を取得
   */
  get rootPackageIds(): string[] {
    return [...this._rootPackageIds];
  }
  
  /**
   * すべてのモデル要素の配列を取得
   */
  get elements(): SysML_Element[] {
    return [...this._elements];
  }
  
  /**
   * ルートパッケージを追加
   * @param packageId 追加するパッケージのID
   */
  addRootPackage(packageId: string): void {
    if (!this._rootPackageIds.includes(packageId)) {
      this._rootPackageIds.push(packageId);
    }
  }
  
  /**
   * モデル要素を追加
   * @param element 追加する要素
   */
  addElement(element: SysML_Element): void {
    // IDが重複しない場合のみ追加（重複する場合は更新）
    const index = this._elements.findIndex(e => e.id === element.id);
    if (index === -1) {
      this._elements.push(element);
    } else {
      this._elements[index] = element;
    }
  }
  
  /**
   * ルートパッケージを削除
   * @param packageId 削除するパッケージのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeRootPackage(packageId: string): boolean {
    const initialLength = this._rootPackageIds.length;
    this._rootPackageIds = this._rootPackageIds.filter(id => id !== packageId);
    return this._rootPackageIds.length !== initialLength;
  }
  
  /**
   * モデル要素を削除
   * @param elementId 削除する要素のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeElement(elementId: string): boolean {
    const initialLength = this._elements.length;
    this._elements = this._elements.filter(element => element.id !== elementId);
    return this._elements.length !== initialLength;
  }
  
  /**
   * 要素をIDで検索
   * @param elementId 検索する要素のID
   * @returns 見つかった要素、見つからない場合はundefined
   */
  getElementById(elementId: string): SysML_Element | undefined {
    return this._elements.find(element => element.id === elementId);
  }
  
  /**
   * JSON形式に変換
   * @returns モデルのJSON表現
   */
  toJSON(): SysML_Model {
    return {
      __type: 'Model',
      id: this.id,
      stereotype: this.stereotype,
      name: this.name,
      description: this.description,
      rootPackageIds: this._rootPackageIds,
      elements: this._elements
    };
  }
  
  /**
   * JSON形式からモデルを作成
   * @param json JSON表現
   * @returns モデルインスタンス
   */
  static fromJSON(json: SysML_Model): Model {
    return new Model({
      id: json.id,
      name: json.name,
      description: json.description,
      rootPackageIds: json.rootPackageIds,
      elements: json.elements
    });
  }
}