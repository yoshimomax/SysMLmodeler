import { v4 as uuidv4 } from 'uuid';
import { Usage } from './Usage';
import { SysML2_RequirementUsage } from './interfaces';

/**
 * SysML v2のRequirementUsageクラス
 * システム要素に対する要求の使用を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.15に準拠
 */
export class RequirementUsage extends Usage {
  /** 参照するRequirementDefinitionのID */
  requirementDefinitionId?: string;
  
  /** 要求テキスト（自然言語で記述された要求内容） */
  text?: string;
  
  /** 想定される制約のIDリスト */
  assumedConstraints: string[];
  
  /** 必須制約のIDリスト */
  requiredConstraints: string[];
  
  /** 要求の対象となるパラメータのID */
  subjectParameterId?: string;
  
  /** ステークホルダーのIDリスト */
  stakeholders: string[];
  
  /** この要求を満たす要素のIDリスト */
  satisfiedBy: string[];
  
  /** この要求を検証する要素のIDリスト */
  verifiedBy: string[];
  
  /**
   * RequirementUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    requirementDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    text?: string;
    assumedConstraints?: string[];
    requiredConstraints?: string[];
    subjectParameterId?: string;
    stakeholders?: string[];
    satisfiedBy?: string[];
    verifiedBy?: string[];
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.requirementDefinitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages
    });
    
    this.requirementDefinitionId = params.requirementDefinitionId || params.definitionId;
    this.text = params.text;
    this.assumedConstraints = params.assumedConstraints || [];
    this.requiredConstraints = params.requiredConstraints || [];
    this.subjectParameterId = params.subjectParameterId;
    this.stakeholders = params.stakeholders || [];
    this.satisfiedBy = params.satisfiedBy || [];
    this.verifiedBy = params.verifiedBy || [];
  }
  
  /**
   * 想定制約を追加する
   * @param constraintId 追加する制約のID
   */
  addAssumedConstraint(constraintId: string): void {
    if (!this.assumedConstraints.includes(constraintId)) {
      this.assumedConstraints.push(constraintId);
    }
  }
  
  /**
   * 必須制約を追加する
   * @param constraintId 追加する制約のID
   */
  addRequiredConstraint(constraintId: string): void {
    if (!this.requiredConstraints.includes(constraintId)) {
      this.requiredConstraints.push(constraintId);
    }
  }
  
  /**
   * ステークホルダーを追加する
   * @param stakeholderId 追加するステークホルダーのID
   */
  addStakeholder(stakeholderId: string): void {
    if (!this.stakeholders.includes(stakeholderId)) {
      this.stakeholders.push(stakeholderId);
    }
  }
  
  /**
   * 要求を満たす要素を追加する
   * @param elementId 追加する要素のID
   */
  addSatisfiedBy(elementId: string): void {
    if (!this.satisfiedBy.includes(elementId)) {
      this.satisfiedBy.push(elementId);
    }
  }
  
  /**
   * 要求を検証する要素を追加する
   * @param elementId 追加する要素のID
   */
  addVerifiedBy(elementId: string): void {
    if (!this.verifiedBy.includes(elementId)) {
      this.verifiedBy.push(elementId);
    }
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_RequirementUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_RequirementUsage {
    return {
      ...super.toJSON(),
      __type: 'RequirementUsage',
      requirementDefinition: this.requirementDefinitionId,
      text: this.text,
      assumedConstraints: this.assumedConstraints,
      requiredConstraints: this.requiredConstraints,
      subjectParameter: this.subjectParameterId,
      stakeholders: this.stakeholders,
      satisfiedBy: this.satisfiedBy,
      verifiedBy: this.verifiedBy
    };
  }
  
  /**
   * JSONオブジェクトからRequirementUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns RequirementUsageインスタンス
   */
  static fromJSON(json: SysML2_RequirementUsage): RequirementUsage {
    return new RequirementUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      requirementDefinitionId: json.requirementDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
      text: json.text,
      assumedConstraints: json.assumedConstraints,
      requiredConstraints: json.requiredConstraints,
      subjectParameterId: json.subjectParameter,
      stakeholders: json.stakeholders,
      satisfiedBy: json.satisfiedBy,
      verifiedBy: json.verifiedBy
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
      stereotype: this.stereotype || 'requirement',
      definitionId: this.requirementDefinitionId,
      text: this.text,
      assumedConstraints: this.assumedConstraints,
      requiredConstraints: this.requiredConstraints,
      subjectParameterId: this.subjectParameterId,
      stakeholders: this.stakeholders,
      satisfiedBy: this.satisfiedBy,
      verifiedBy: this.verifiedBy
    };
  }
}