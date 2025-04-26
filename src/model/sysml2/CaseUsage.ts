import { v4 as uuidv4 } from 'uuid';
import { Usage } from './Usage';
import { SysML2_CaseUsage } from './interfaces';

/**
 * SysML v2のCaseUsageクラス
 * システム分析・検証などのケースの使用を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.17に準拠
 */
export class CaseUsage extends Usage {
  /** 参照するCaseDefinitionのID */
  caseDefinitionId?: string;
  
  /** ケースの目的となる要素のIDリスト */
  objectives: string[];
  
  /** ケースの対象となるパラメータのID */
  subjectParameterId?: string;
  
  /**
   * CaseUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    caseDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    objectives?: string[];
    subjectParameterId?: string;
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.caseDefinitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages
    });
    
    this.caseDefinitionId = params.caseDefinitionId || params.definitionId;
    this.objectives = params.objectives || [];
    this.subjectParameterId = params.subjectParameterId;
  }
  
  /**
   * 目的要素を追加する
   * @param objectiveId 追加する目的要素のID
   */
  addObjective(objectiveId: string): void {
    if (!this.objectives.includes(objectiveId)) {
      this.objectives.push(objectiveId);
    }
  }
  
  /**
   * 目的要素を削除する
   * @param objectiveId 削除する目的要素のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeObjective(objectiveId: string): boolean {
    const index = this.objectives.indexOf(objectiveId);
    if (index !== -1) {
      this.objectives.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_CaseUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_CaseUsage {
    return {
      ...super.toJSON(),
      __type: 'CaseUsage',
      caseDefinition: this.caseDefinitionId,
      objectives: this.objectives,
      subjectParameter: this.subjectParameterId
    };
  }
  
  /**
   * JSONオブジェクトからCaseUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns CaseUsageインスタンス
   */
  static fromJSON(json: SysML2_CaseUsage): CaseUsage {
    return new CaseUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      caseDefinitionId: json.caseDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
      objectives: json.objectives,
      subjectParameterId: json.subjectParameter
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
      stereotype: this.stereotype || 'case',
      definitionId: this.caseDefinitionId,
      objectives: this.objectives,
      subjectParameterId: this.subjectParameterId
    };
  }
}