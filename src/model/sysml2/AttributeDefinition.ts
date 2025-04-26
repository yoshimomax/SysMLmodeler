import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { BlockDefinition } from './BlockDefinition';
import { PartDefinition } from './PartDefinition';

/**
 * SysML v2 AttributeDefinition クラス
 * SysML v2 言語仕様の属性定義を表現する
 * @see https://www.omg.org/spec/SysML/2.0/Beta1
 */
export class AttributeDefinition extends Feature {
  /** 属性の所有者となるブロック定義 */
  ownerBlock?: BlockDefinition;
  
  /** 属性の所有者となるパート定義 */
  ownerPart?: PartDefinition;
  
  /** 属性の型（基本型や複合型） */
  typeName: string;
  
  /** 属性の値（任意） */
  value?: any;
  
  /** 多重度（数量）を表す文字列（例: '0..1', '1..*', '*'） */
  multiplicity?: string;
  
  /** 属性のデフォルト値 */
  defaultValue?: any;
  
  /** 属性が読み取り専用かどうか */
  isReadOnly: boolean = false;
  
  /** 属性が派生的かどうか */
  isDerived: boolean = false;
  
  /** 属性の単位（例: 'kg', 'm/s'） */
  unit?: string;
  
  /**
   * AttributeDefinition コンストラクタ
   * @param name 属性名
   * @param typeName 属性の型名
   * @param ownerBlock 属性の所有者となるブロック（オプション）
   * @param value 属性の値（オプション）
   * @param multiplicity 多重度（オプション）
   * @param defaultValue デフォルト値（オプション）
   * @param id 明示的に指定する場合のID（省略時は自動生成）
   */
  constructor(
    name: string,
    typeName: string,
    ownerBlock?: BlockDefinition,
    value?: any,
    multiplicity?: string,
    defaultValue?: any,
    id?: string
  ) {
    // Featureクラスのコンストラクタ呼び出し
    super(name, undefined, undefined, id);
    
    this.typeName = typeName;
    this.ownerBlock = ownerBlock;
    this.value = value;
    this.multiplicity = multiplicity;
    this.defaultValue = defaultValue;
  }
  
  /**
   * 属性の値を設定する
   * @param value 新しい値
   */
  setValue(value: any): void {
    this.value = value;
  }
  
  /**
   * 属性の情報をオブジェクトとして返す
   */
  override toObject() {
    return {
      ...super.toObject(),
      ownerBlockId: this.ownerBlock?.id,
      ownerBlockName: this.ownerBlock?.name,
      ownerPartId: this.ownerPart?.id,
      ownerPartName: this.ownerPart?.name,
      typeName: this.typeName,
      value: this.value,
      multiplicity: this.multiplicity,
      defaultValue: this.defaultValue,
      isReadOnly: this.isReadOnly,
      isDerived: this.isDerived,
      unit: this.unit
    };
  }
}