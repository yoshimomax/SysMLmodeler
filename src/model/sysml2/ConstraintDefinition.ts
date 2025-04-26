import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { Definition } from './Definition';
import { SysML2_ConstraintDefinition } from './interfaces';

/**
 * SysML v2のConstraintDefinitionクラス
 * システム要素に対する制約を定義する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.14に準拠
 */
export class ConstraintDefinition extends Definition {
  /** このConstraintDefinitionを使用するConstraintUsageのIDリスト */
  constraintUsages: string[];
  
  /** 制約のパラメータのIDリスト */
  parameters: string[];
  
  /** 制約を表す式（論理式、数式等） */
  expression?: string;
  
  /**
   * ConstraintDefinition コンストラクタ
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
    constraintUsages?: string[];
    parameters?: string[];
    expression?: string;
  }) {
    super(params);
    
    this.constraintUsages = params.constraintUsages || [];
    this.parameters = params.parameters || [];
    this.expression = params.expression;
  }
  
  /**
   * ConstraintUsageへの参照を追加する
   * @param constraintUsageId 追加するConstraintUsageのID
   */
  addConstraintUsageReference(constraintUsageId: string): void {
    if (!this.constraintUsages.includes(constraintUsageId)) {
      this.constraintUsages.push(constraintUsageId);
    }
  }
  
  /**
   * パラメータを追加する
   * @param parameterId 追加するパラメータのID
   */
  addParameter(parameterId: string): void {
    if (!this.parameters.includes(parameterId)) {
      this.parameters.push(parameterId);
    }
  }
  
  /**
   * パラメータを削除する
   * @param parameterId 削除するパラメータのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeParameter(parameterId: string): boolean {
    const index = this.parameters.indexOf(parameterId);
    if (index !== -1) {
      this.parameters.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_ConstraintDefinition形式のJSONオブジェクト
   */
  toJSON(): SysML2_ConstraintDefinition {
    return {
      ...super.toJSON(),
      __type: 'ConstraintDefinition',
      constraintUsages: this.constraintUsages,
      parameters: this.parameters,
      expression: this.expression
    };
  }
  
  /**
   * JSONオブジェクトからConstraintDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns ConstraintDefinitionインスタンス
   */
  static fromJSON(json: SysML2_ConstraintDefinition): ConstraintDefinition {
    return new ConstraintDefinition({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      ownedFeatures: json.ownedFeatures,
      constraintUsages: json.constraintUsages,
      parameters: json.parameters,
      expression: json.expression
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
      stereotype: this.stereotype || 'constraint_def',
      isAbstract: this.isAbstract,
      parameters: this.parameters,
      expression: this.expression
    };
  }
}