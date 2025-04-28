import { v4 as uuidv4 } from 'uuid';

/**
 * Property クラス
 * SysML v2 のプロパティ概念を表現する
 */
export class Property {
  /** プロパティの一意識別子 */
  readonly id: string;
  
  /** プロパティ名 */
  name: string;
  
  /** プロパティの型 */
  type: string;
  
  /** プロパティの値（任意） */
  value?: any;
  
  /** このプロパティを所有するブロックのID */
  ownerBlockId: string;
  
  /** 
   * 多重度 (例: "1", "0..1", "1..*", "*")
   * SysML v2 では要素の数量を表現するのに使用
   */
  multiplicity?: string;
  
  /** 既定値（プロパティのデフォルト値） */
  defaultValue?: any;
  
  /** プロパティの説明 */
  description?: string;

  /**
   * Property コンストラクタ
   * @param name プロパティ名
   * @param type プロパティの型
   * @param ownerBlockId 所有ブロックのID（未設定の場合は後で設定必要）
   * @param value プロパティの値（オプション）
   * @param multiplicity 多重度（オプション）
   * @param defaultValue 既定値（オプション）
   * @param description 説明（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    type: string,
    ownerBlockId: string = '',
    value?: any,
    multiplicity: string = '1',
    defaultValue?: any,
    description?: string,
    id?: string
  ) {
    this.id = id || uuidv4();
    this.name = name;
    this.type = type;
    this.ownerBlockId = ownerBlockId;
    this.value = value;
    this.multiplicity = multiplicity;
    this.defaultValue = defaultValue;
    this.description = description;
  }

  /**
   * プロパティの値を設定する
   * @param value 新しい値
   */
  setValue(value: any): void {
    this.value = value;
  }

  /**
   * プロパティの情報をオブジェクトとして返す
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      value: this.value,
      ownerBlockId: this.ownerBlockId,
      multiplicity: this.multiplicity,
      defaultValue: this.defaultValue,
      description: this.description
    };
  }
}