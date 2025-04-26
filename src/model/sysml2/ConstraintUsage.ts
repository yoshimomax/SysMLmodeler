import { v4 as uuidv4 } from 'uuid';
import { Usage } from './Usage';
import { SysML2_ConstraintUsage } from './interfaces';

/**
 * SysML v2のConstraintUsageクラス
 * システム要素に対する制約の使用を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.14に準拠
 */
export class ConstraintUsage extends Usage {
  /** 参照するConstraintDefinitionのID */
  constraintDefinitionId?: string;
  
  /** 制約のパラメータのIDリスト */
  parameters: string[];
  
  /** 制約を表す式（論理式、数式等） */
  expression?: string;
  
  /**
   * ConstraintUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    constraintDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    parameters?: string[];
    expression?: string;
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.constraintDefinitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages
    });
    
    this.constraintDefinitionId = params.constraintDefinitionId || params.definitionId;
    this.parameters = params.parameters || [];
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
   * @returns SysML2_ConstraintUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_ConstraintUsage {
    return {
      ...super.toJSON(),
      __type: 'ConstraintUsage',
      constraintDefinition: this.constraintDefinitionId,
      parameters: this.parameters,
      expression: this.expression
    };
  }
  
  /**
   * JSONオブジェクトからConstraintUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns ConstraintUsageインスタンス
   */
  static fromJSON(json: SysML2_ConstraintUsage): ConstraintUsage {
    return new ConstraintUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      constraintDefinitionId: json.constraintDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
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
      stereotype: this.stereotype || 'constraint',
      definitionId: this.constraintDefinitionId,
      parameters: this.parameters,
      expression: this.expression
    };
  }
}