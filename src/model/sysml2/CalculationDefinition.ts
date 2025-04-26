import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { Definition } from './Definition';
import { SysML2_CalculationDefinition } from './interfaces';

/**
 * SysML v2のCalculationDefinitionクラス
 * システムの計算・演算を定義する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.13に準拠
 */
export class CalculationDefinition extends Definition {
  /** このCalculationDefinitionを使用するCalculationUsageのIDリスト */
  calculationUsages: string[];
  
  /** 計算のパラメータのIDリスト */
  parameters: string[];
  
  /** 計算結果を保持する特性のID */
  resultId?: string;
  
  /** 計算を表す式（数式、アルゴリズム等） */
  expression?: string;
  
  /**
   * CalculationDefinition コンストラクタ
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
    calculationUsages?: string[];
    parameters?: string[];
    resultId?: string;
    expression?: string;
  }) {
    super(params);
    
    this.calculationUsages = params.calculationUsages || [];
    this.parameters = params.parameters || [];
    this.resultId = params.resultId;
    this.expression = params.expression;
  }
  
  /**
   * CalculationUsageへの参照を追加する
   * @param calculationUsageId 追加するCalculationUsageのID
   */
  addCalculationUsageReference(calculationUsageId: string): void {
    if (!this.calculationUsages.includes(calculationUsageId)) {
      this.calculationUsages.push(calculationUsageId);
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
   * @returns SysML2_CalculationDefinition形式のJSONオブジェクト
   */
  toJSON(): SysML2_CalculationDefinition {
    return {
      ...super.toJSON(),
      __type: 'CalculationDefinition',
      calculationUsages: this.calculationUsages,
      parameters: this.parameters,
      result: this.resultId,
      expression: this.expression
    };
  }
  
  /**
   * JSONオブジェクトからCalculationDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns CalculationDefinitionインスタンス
   */
  static fromJSON(json: SysML2_CalculationDefinition): CalculationDefinition {
    return new CalculationDefinition({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      ownedFeatures: json.ownedFeatures,
      calculationUsages: json.calculationUsages,
      parameters: json.parameters,
      resultId: json.result,
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
      stereotype: this.stereotype || 'calculation_def',
      isAbstract: this.isAbstract,
      parameters: this.parameters,
      resultId: this.resultId,
      expression: this.expression
    };
  }
}