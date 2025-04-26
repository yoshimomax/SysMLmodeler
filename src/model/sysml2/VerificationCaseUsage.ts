import { v4 as uuidv4 } from 'uuid';
import { CaseUsage } from './CaseUsage';
import { Usage } from './Usage';
import { SysML2_VerificationCaseUsage } from './interfaces';

/**
 * SysML v2のVerificationCaseUsageクラス
 * システム検証ケースの使用を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.19に準拠
 */
export class VerificationCaseUsage extends CaseUsage {
  /** 参照するVerificationCaseDefinitionのID */
  verificationCaseDefinitionId?: string;
  
  /** 検証対象となる要求のIDリスト */
  verifiedRequirements: string[];
  
  /**
   * VerificationCaseUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    caseDefinitionId?: string;
    verificationCaseDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    objectives?: string[];
    subjectParameterId?: string;
    verifiedRequirements?: string[];
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.caseDefinitionId || params.verificationCaseDefinitionId,
      caseDefinitionId: params.caseDefinitionId || params.verificationCaseDefinitionId || params.definitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages,
      objectives: params.objectives,
      subjectParameterId: params.subjectParameterId
    });
    
    this.verificationCaseDefinitionId = params.verificationCaseDefinitionId || params.caseDefinitionId || params.definitionId;
    this.verifiedRequirements = params.verifiedRequirements || [];
  }
  
  /**
   * 検証対象要求を追加する
   * @param requirementId 追加する要求のID
   */
  addVerifiedRequirement(requirementId: string): void {
    if (!this.verifiedRequirements.includes(requirementId)) {
      this.verifiedRequirements.push(requirementId);
    }
  }
  
  /**
   * 検証対象要求を削除する
   * @param requirementId 削除する要求のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeVerifiedRequirement(requirementId: string): boolean {
    const index = this.verifiedRequirements.indexOf(requirementId);
    if (index !== -1) {
      this.verifiedRequirements.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_VerificationCaseUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_VerificationCaseUsage {
    return {
      ...super.toJSON(),
      __type: 'VerificationCaseUsage',
      verificationCaseDefinition: this.verificationCaseDefinitionId,
      verifiedRequirements: this.verifiedRequirements
    };
  }
  
  /**
   * JSONオブジェクトからVerificationCaseUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns VerificationCaseUsageインスタンス
   */
  static fromJSON(json: SysML2_VerificationCaseUsage): VerificationCaseUsage {
    return new VerificationCaseUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      caseDefinitionId: json.caseDefinition,
      verificationCaseDefinitionId: json.verificationCaseDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
      objectives: json.objectives,
      subjectParameterId: json.subjectParameter,
      verifiedRequirements: json.verifiedRequirements
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
      stereotype: this.stereotype || 'verification_case',
      definitionId: this.verificationCaseDefinitionId,
      objectives: this.objectives,
      subjectParameterId: this.subjectParameterId,
      verifiedRequirements: this.verifiedRequirements
    };
  }
}