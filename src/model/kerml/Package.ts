import { v4 as uuidv4 } from 'uuid';
import { KerML_Package, KerML_Element } from './interfaces';

/**
 * KerML Package クラス
 * KerML メタモデルの要素のグループ化を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class Package {
  /** パッケージの一意識別子 */
  readonly id: string;
  
  /** 所有者要素のID */
  ownerId?: string;
  
  /** パッケージ名 */
  name?: string;
  
  /** 短い名前 */
  shortName?: string;
  
  /** 完全修飾名 */
  qualifiedName?: string;
  
  /** 説明 */
  description?: string;
  
  /** パッケージに含まれる要素のリスト */
  private _elements: KerML_Element[] = [];
  
  /** インポートするパッケージのID配列 */
  private _imports: string[] = [];
  
  /**
   * Package コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    ownerId?: string;
    name?: string;
    shortName?: string;
    qualifiedName?: string;
    description?: string;
    elements?: KerML_Element[];
    imports?: string[];
  } = {}) {
    this.id = options.id || uuidv4();
    this.ownerId = options.ownerId;
    this.name = options.name;
    this.shortName = options.shortName;
    this.qualifiedName = options.qualifiedName;
    this.description = options.description;
    
    if (options.elements) {
      this._elements = [...options.elements];
    }
    
    if (options.imports) {
      this._imports = [...options.imports];
    }
  }
  
  /**
   * パッケージに含まれる要素のリストを取得
   */
  get elements(): KerML_Element[] {
    return [...this._elements];
  }
  
  /**
   * インポートするパッケージのID配列を取得
   */
  get imports(): string[] {
    return [...this._imports];
  }
  
  /**
   * 要素を追加
   * @param element 追加する要素
   */
  addElement(element: KerML_Element): void {
    // 重複を避けるために要素のIDでチェック
    const exists = this._elements.some(e => e.id === element.id);
    if (!exists) {
      this._elements.push(element);
    }
  }
  
  /**
   * インポートするパッケージを追加
   * @param packageId 追加するパッケージのID
   */
  addImport(packageId: string): void {
    if (!this._imports.includes(packageId)) {
      this._imports.push(packageId);
    }
  }
  
  /**
   * 要素を削除
   * @param elementId 削除する要素のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeElement(elementId: string): boolean {
    const initialLength = this._elements.length;
    this._elements = this._elements.filter(element => element.id !== elementId);
    return this._elements.length !== initialLength;
  }
  
  /**
   * インポートするパッケージを削除
   * @param packageId 削除するパッケージのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeImport(packageId: string): boolean {
    const initialLength = this._imports.length;
    this._imports = this._imports.filter(id => id !== packageId);
    return this._imports.length !== initialLength;
  }
  
  /**
   * IDで要素を検索
   * @param elementId 要素のID
   * @returns 見つかった要素、見つからない場合はundefined
   */
  getElementById(elementId: string): KerML_Element | undefined {
    return this._elements.find(element => element.id === elementId);
  }
  
  /**
   * JSON形式に変換
   * @returns パッケージのJSON表現
   */
  toJSON(): KerML_Package {
    return {
      __type: 'Package',
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      shortName: this.shortName,
      qualifiedName: this.qualifiedName,
      description: this.description,
      elements: this._elements,
      imports: this._imports
    };
  }
  
  /**
   * JSON形式からパッケージを作成
   * @param json JSON表現
   * @returns パッケージインスタンス
   */
  static fromJSON(json: KerML_Package): Package {
    return new Package({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      elements: json.elements,
      imports: json.imports
    });
  }
}