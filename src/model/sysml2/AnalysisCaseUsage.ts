import { v4 as uuidv4 } from 'uuid';
import { CaseUsage } from './CaseUsage';
import { Usage } from './Usage';
import { SysML2_AnalysisCaseUsage } from './interfaces';

/**
 * SysML v2のAnalysisCaseUsageクラス
 * システム分析ケースの使用を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.18に準拠
 */
export class AnalysisCaseUsage extends CaseUsage {
  /** 参照するAnalysisCaseDefinitionのID */
  analysisCaseDefinitionId?: string;
  
  /** 分析結果を保持するパラメータのIDリスト */
  resultParameters: string[];
  
  /**
   * AnalysisCaseUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    caseDefinitionId?: string;
    analysisCaseDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    objectives?: string[];
    subjectParameterId?: string;
    resultParameters?: string[];
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.caseDefinitionId || params.analysisCaseDefinitionId,
      caseDefinitionId: params.caseDefinitionId || params.analysisCaseDefinitionId || params.definitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages,
      objectives: params.objectives,
      subjectParameterId: params.subjectParameterId
    });
    
    this.analysisCaseDefinitionId = params.analysisCaseDefinitionId || params.caseDefinitionId || params.definitionId;
    this.resultParameters = params.resultParameters || [];
  }
  
  /**
   * 結果パラメータを追加する
   * @param parameterId 追加するパラメータのID
   */
  addResultParameter(parameterId: string): void {
    if (!this.resultParameters.includes(parameterId)) {
      this.resultParameters.push(parameterId);
    }
  }
  
  /**
   * 結果パラメータを削除する
   * @param parameterId 削除するパラメータのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeResultParameter(parameterId: string): boolean {
    const index = this.resultParameters.indexOf(parameterId);
    if (index !== -1) {
      this.resultParameters.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_AnalysisCaseUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_AnalysisCaseUsage {
    return {
      ...super.toJSON(),
      __type: 'AnalysisCaseUsage',
      analysisCaseDefinition: this.analysisCaseDefinitionId,
      resultParameters: this.resultParameters
    };
  }
  
  /**
   * JSONオブジェクトからAnalysisCaseUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns AnalysisCaseUsageインスタンス
   */
  static fromJSON(json: SysML2_AnalysisCaseUsage): AnalysisCaseUsage {
    return new AnalysisCaseUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      caseDefinitionId: json.caseDefinition,
      analysisCaseDefinitionId: json.analysisCaseDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
      objectives: json.objectives,
      subjectParameterId: json.subjectParameter,
      resultParameters: json.resultParameters
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
      stereotype: this.stereotype || 'analysis_case',
      definitionId: this.analysisCaseDefinitionId,
      objectives: this.objectives,
      subjectParameterId: this.subjectParameterId,
      resultParameters: this.resultParameters
    };
  }
}