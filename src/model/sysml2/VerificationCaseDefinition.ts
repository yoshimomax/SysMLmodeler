import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { CaseDefinition } from './CaseDefinition';
import { SysML2_VerificationCaseDefinition } from './interfaces';

/**
 * SysML v2のVerificationCaseDefinitionクラス
 * システム検証ケースを定義する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.19に準拠
 */
export class VerificationCaseDefinition extends CaseDefinition {
  /** このVerificationCaseDefinitionを使用するVerificationCaseUsageのIDリスト */
  verificationCaseUsages: string[];
  
  /** 検証対象となる要求のIDリスト */
  verifiedRequirements: string[];
  
  /**
   * VerificationCaseDefinition コンストラクタ
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
    verificationCaseUsages?: string[];
    verifiedRequirements?: string[];
  }) {
    super(params);
    
    this.verificationCaseUsages = params.verificationCaseUsages || [];
    this.verifiedRequirements = params.verifiedRequirements || [];
  }
  
  /**
   * VerificationCaseUsageへの参照を追加する
   * @param verificationCaseUsageId 追加するVerificationCaseUsageのID
   */
  addVerificationCaseUsageReference(verificationCaseUsageId: string): void {
    if (!this.verificationCaseUsages.includes(verificationCaseUsageId)) {
      this.verificationCaseUsages.push(verificationCaseUsageId);
      
      // スーパークラスのcaseUsagesにも追加
      if (!this.caseUsages.includes(verificationCaseUsageId)) {
        this.caseUsages.push(verificationCaseUsageId);
      }
    }
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
   * @returns SysML2_VerificationCaseDefinition形式のJSONオブジェクト
   */
  toJSON(): SysML2_VerificationCaseDefinition {
    return {
      ...super.toJSON(),
      __type: 'VerificationCaseDefinition',
      verificationCaseUsages: this.verificationCaseUsages,
      verifiedRequirements: this.verifiedRequirements
    };
  }
  
  /**
   * JSONオブジェクトからVerificationCaseDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns VerificationCaseDefinitionインスタンス
   */
  static fromJSON(json: SysML2_VerificationCaseDefinition): VerificationCaseDefinition {
    return new VerificationCaseDefinition({
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
      verificationCaseUsages: json.verificationCaseUsages,
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
      stereotype: this.stereotype || 'verification_case_def',
      isAbstract: this.isAbstract,
      objectives: this.objectives,
      subjectParameterId: this.subjectParameterId,
      verifiedRequirements: this.verifiedRequirements
    };
  }
}