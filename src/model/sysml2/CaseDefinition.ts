import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { Definition } from './Definition';
import { SysML2_CaseDefinition } from './interfaces';

/**
 * SysML v2のCaseDefinitionクラス
 * システム分析・検証などのケースを定義する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.17に準拠
 */
export class CaseDefinition extends Definition {
  /** このCaseDefinitionを使用するCaseUsageのIDリスト */
  caseUsages: string[];
  
  /** ケースの目的となる要素のIDリスト */
  objectives: string[];
  
  /** ケースの対象となるパラメータのID */
  subjectParameterId?: string;
  
  /**
   * CaseDefinition コンストラクタ
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
  }) {
    super(params);
    
    this.caseUsages = params.caseUsages || [];
    this.objectives = params.objectives || [];
    this.subjectParameterId = params.subjectParameterId;
  }
  
  /**
   * CaseUsageへの参照を追加する
   * @param caseUsageId 追加するCaseUsageのID
   */
  addCaseUsageReference(caseUsageId: string): void {
    if (!this.caseUsages.includes(caseUsageId)) {
      this.caseUsages.push(caseUsageId);
    }
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
   * @returns SysML2_CaseDefinition形式のJSONオブジェクト
   */
  toJSON(): SysML2_CaseDefinition {
    return {
      ...super.toJSON(),
      __type: 'CaseDefinition',
      caseUsages: this.caseUsages,
      objectives: this.objectives,
      subjectParameter: this.subjectParameterId
    };
  }
  
  /**
   * JSONオブジェクトからCaseDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns CaseDefinitionインスタンス
   */
  static fromJSON(json: SysML2_CaseDefinition): CaseDefinition {
    return new CaseDefinition({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      ownedFeatures: json.ownedFeatures,
      caseUsages: json.caseUsages,
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
      stereotype: this.stereotype || 'case_def',
      isAbstract: this.isAbstract,
      objectives: this.objectives,
      subjectParameterId: this.subjectParameterId
    };
  }
}