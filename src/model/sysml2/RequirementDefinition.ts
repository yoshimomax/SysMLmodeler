import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { Definition } from './Definition';
import { SysML2_RequirementDefinition } from './interfaces';

/**
 * SysML v2のRequirementDefinitionクラス
 * システム要素に対する要求を定義する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.15に準拠
 */
export class RequirementDefinition extends Definition {
  /** このRequirementDefinitionを使用するRequirementUsageのIDリスト */
  requirementUsages: string[];
  
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
   * RequirementDefinition コンストラクタ
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
    requirementUsages?: string[];
    text?: string;
    assumedConstraints?: string[];
    requiredConstraints?: string[];
    subjectParameterId?: string;
    stakeholders?: string[];
    satisfiedBy?: string[];
    verifiedBy?: string[];
  }) {
    super(params);
    
    this.requirementUsages = params.requirementUsages || [];
    this.text = params.text;
    this.assumedConstraints = params.assumedConstraints || [];
    this.requiredConstraints = params.requiredConstraints || [];
    this.subjectParameterId = params.subjectParameterId;
    this.stakeholders = params.stakeholders || [];
    this.satisfiedBy = params.satisfiedBy || [];
    this.verifiedBy = params.verifiedBy || [];
  }
  
  /**
   * RequirementUsageへの参照を追加する
   * @param requirementUsageId 追加するRequirementUsageのID
   */
  addRequirementUsageReference(requirementUsageId: string): void {
    if (!this.requirementUsages.includes(requirementUsageId)) {
      this.requirementUsages.push(requirementUsageId);
    }
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
   * @returns SysML2_RequirementDefinition形式のJSONオブジェクト
   */
  toJSON(): SysML2_RequirementDefinition {
    return {
      ...super.toJSON(),
      __type: 'RequirementDefinition',
      requirementUsages: this.requirementUsages,
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
   * JSONオブジェクトからRequirementDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns RequirementDefinitionインスタンス
   */
  static fromJSON(json: SysML2_RequirementDefinition): RequirementDefinition {
    return new RequirementDefinition({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      ownedFeatures: json.ownedFeatures,
      requirementUsages: json.requirementUsages,
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
      stereotype: this.stereotype || 'requirement_def',
      isAbstract: this.isAbstract,
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