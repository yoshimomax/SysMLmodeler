import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { CaseDefinition } from './CaseDefinition';
import { SysML2_AnalysisCaseDefinition } from './interfaces';

/**
 * SysML v2のAnalysisCaseDefinitionクラス
 * システム分析ケースを定義する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.18に準拠
 */
export class AnalysisCaseDefinition extends CaseDefinition {
  /** このAnalysisCaseDefinitionを使用するAnalysisCaseUsageのIDリスト */
  analysisCaseUsages: string[];
  
  /** 分析結果を保持するパラメータのIDリスト */
  resultParameters: string[];
  
  /**
   * AnalysisCaseDefinition コンストラクタ
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
    caseUsages?: string[];
    objectives?: string[];
    subjectParameterId?: string;
    analysisCaseUsages?: string[];
    resultParameters?: string[];
  }) {
    super(params);
    
    this.analysisCaseUsages = params.analysisCaseUsages || [];
    this.resultParameters = params.resultParameters || [];
  }
  
  /**
   * AnalysisCaseUsageへの参照を追加する
   * @param analysisCaseUsageId 追加するAnalysisCaseUsageのID
   */
  addAnalysisCaseUsageReference(analysisCaseUsageId: string): void {
    if (!this.analysisCaseUsages.includes(analysisCaseUsageId)) {
      this.analysisCaseUsages.push(analysisCaseUsageId);
      
      // スーパークラスのcaseUsagesにも追加
      if (!this.caseUsages.includes(analysisCaseUsageId)) {
        this.caseUsages.push(analysisCaseUsageId);
      }
    }
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
   * @returns SysML2_AnalysisCaseDefinition形式のJSONオブジェクト
   */
  toJSON(): SysML2_AnalysisCaseDefinition {
    return {
      ...super.toJSON(),
      __type: 'AnalysisCaseDefinition',
      analysisCaseUsages: this.analysisCaseUsages,
      resultParameters: this.resultParameters
    };
  }
  
  /**
   * JSONオブジェクトからAnalysisCaseDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns AnalysisCaseDefinitionインスタンス
   */
  static fromJSON(json: SysML2_AnalysisCaseDefinition): AnalysisCaseDefinition {
    return new AnalysisCaseDefinition({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      ownedFeatures: json.ownedFeatures,
      caseUsages: json.caseUsages,
      objectives: json.objectives,
      subjectParameterId: json.subjectParameter,
      analysisCaseUsages: json.analysisCaseUsages,
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
      stereotype: this.stereotype || 'analysis_case_def',
      isAbstract: this.isAbstract,
      objectives: this.objectives,
      subjectParameterId: this.subjectParameterId,
      resultParameters: this.resultParameters
    };
  }
}