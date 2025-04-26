import { v4 as uuidv4 } from 'uuid';
import { Usage } from './Usage';
import { SysML2_CalculationUsage } from './interfaces';

/**
 * SysML v2のCalculationUsageクラス
 * システムの計算・演算の使用を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.13に準拠
 */
export class CalculationUsage extends Usage {
  /** 参照するCalculationDefinitionのID */
  calculationDefinitionId?: string;
  
  /** 計算のパラメータのIDリスト */
  parameters: string[];
  
  /** 計算結果を保持する特性のID */
  resultId?: string;
  
  /** 計算を表す式（数式、アルゴリズム等） */
  expression?: string;
  
  /**
   * CalculationUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    calculationDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    parameters?: string[];
    resultId?: string;
    expression?: string;
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.calculationDefinitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages
    });
    
    this.calculationDefinitionId = params.calculationDefinitionId || params.definitionId;
    this.parameters = params.parameters || [];
    this.resultId = params.resultId;
    this.expression = params.expression;
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
   * @returns SysML2_CalculationUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_CalculationUsage {
    return {
      ...super.toJSON(),
      __type: 'CalculationUsage',
      calculationDefinition: this.calculationDefinitionId,
      parameters: this.parameters,
      result: this.resultId,
      expression: this.expression
    };
  }
  
  /**
   * JSONオブジェクトからCalculationUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns CalculationUsageインスタンス
   */
  static fromJSON(json: SysML2_CalculationUsage): CalculationUsage {
    return new CalculationUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      calculationDefinitionId: json.calculationDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
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
      stereotype: this.stereotype || 'calculation',
      definitionId: this.calculationDefinitionId,
      parameters: this.parameters,
      resultId: this.resultId,
      expression: this.expression
    };
  }
}