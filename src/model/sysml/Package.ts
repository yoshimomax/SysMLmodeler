import { v4 as uuidv4 } from 'uuid';
import { SysML_Package } from './interfaces';

/**
 * SysML Package クラス
 * SysML v2のモデル要素のグループ化を表現する
 * OMG仕様：PTC/2023-02-02、SysML v2 Beta1
 */
export class Package {
  /** パッケージの一意識別子 */
  readonly id: string;
  
  /** SysMLステレオタイプ - 常に'package'に設定 */
  readonly stereotype: string = 'package';
  
  /** パッケージ名 */
  name?: string;
  
  /** 説明 */
  description?: string;
  
  /** 含まれる要素のID配列 */
  private _elementIds: string[] = [];
  
  /** サブパッケージのID配列 */
  private _subpackageIds: string[] = [];
  
  /** 親パッケージのID */
  parentPackageId?: string;
  
  /**
   * Package コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    description?: string;
    elementIds?: string[];
    subpackageIds?: string[];
    parentPackageId?: string;
  } = {}) {
    this.id = options.id || uuidv4();
    this.name = options.name;
    this.description = options.description;
    this.parentPackageId = options.parentPackageId;
    
    if (options.elementIds) {
      this._elementIds = [...options.elementIds];
    }
    
    if (options.subpackageIds) {
      this._subpackageIds = [...options.subpackageIds];
    }
  }
  
  /**
   * 含まれる要素のID配列を取得
   */
  get elementIds(): string[] {
    return [...this._elementIds];
  }
  
  /**
   * サブパッケージのID配列を取得
   */
  get subpackageIds(): string[] {
    return [...this._subpackageIds];
  }
  
  /**
   * 要素を追加
   * @param elementId 追加する要素のID
   */
  addElement(elementId: string): void {
    if (!this._elementIds.includes(elementId)) {
      this._elementIds.push(elementId);
    }
  }
  
  /**
   * サブパッケージを追加
   * @param packageId 追加するパッケージのID
   */
  addSubpackage(packageId: string): void {
    if (!this._subpackageIds.includes(packageId)) {
      this._subpackageIds.push(packageId);
    }
  }
  
  /**
   * 要素を削除
   * @param elementId 削除する要素のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeElement(elementId: string): boolean {
    const initialLength = this._elementIds.length;
    this._elementIds = this._elementIds.filter(id => id !== elementId);
    return this._elementIds.length !== initialLength;
  }
  
  /**
   * サブパッケージを削除
   * @param packageId 削除するパッケージのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeSubpackage(packageId: string): boolean {
    const initialLength = this._subpackageIds.length;
    this._subpackageIds = this._subpackageIds.filter(id => id !== packageId);
    return this._subpackageIds.length !== initialLength;
  }
  
  /**
   * JSON形式に変換
   * @returns パッケージのJSON表現
   */
  toJSON(): SysML_Package {
    return {
      __type: 'Package',
      id: this.id,
      stereotype: this.stereotype,
      name: this.name,
      description: this.description,
      elementIds: this._elementIds,
      subpackageIds: this._subpackageIds,
      parentPackageId: this.parentPackageId
    };
  }
  
  /**
   * JSON形式からパッケージを作成
   * @param json JSON表現
   * @returns パッケージインスタンス
   */
  static fromJSON(json: SysML_Package): Package {
    return new Package({
      id: json.id,
      name: json.name,
      description: json.description,
      elementIds: json.elementIds,
      subpackageIds: json.subpackageIds,
      parentPackageId: json.parentPackageId
    });
  }
}