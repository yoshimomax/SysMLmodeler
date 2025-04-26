/**
 * SysML v2 JSONインターフェース定義
 * SysML v2メタモデルのシリアライズ／デシリアライズに使用する型定義
 * OMG仕様：ptc/2025-02-11, SysML v2 Beta3 Part 1
 */

import { KerML_Classifier, KerML_Feature, KerML_Element } from '../kerml/interfaces';

/**
 * SysML2 Element 基本インターフェース
 */
export interface SysML2_Element extends KerML_Element {
  stereotype?: string;
}

/**
 * SysML2 Definition 基本インターフェース
 * すべての Definition 要素の基底となる
 */
export interface SysML2_Definition extends SysML2_Element, KerML_Classifier {
  __type: any;       // サブクラスがオーバーライドできるよう any型に変更
  isAbstract?: boolean;
  isVariation?: boolean;
  ownedFeatures?: string[];
}

/**
 * SysML2 Usage 基本インターフェース
 * すべての Usage 要素の基底となる
 */
export interface SysML2_Usage extends SysML2_Element, KerML_Feature {
  __type: any;       // サブクラスがオーバーライドできるよう any型に変更
  definition?: string;  // 参照する Definition の ID
  isVariation?: boolean;
  nestedUsages?: string[];
}

/**
 * SysML2 PartDefinition インターフェース
 */
export interface SysML2_PartDefinition extends SysML2_Definition {
  __type: 'PartDefinition' | string;
  isHuman?: boolean;
  partUsages?: string[];
  interfaceDefinitions?: string[];
  connectionDefinitions?: string[];
  flowDefinitions?: string[];
  stateDefinitions?: string[];
  constraintDefinitions?: string[];
  requirementDefinitions?: string[];
  calculationDefinitions?: string[];
  metadataDefinitions?: string[];
  ports?: string[];
}

/**
 * SysML2 PartUsage インターフェース
 */
export interface SysML2_PartUsage extends SysML2_Usage {
  __type: 'PartUsage' | string;
  isHuman?: boolean;
  partDefinition?: string;
  nestedParts?: string[];
  nestedInterfaces?: string[];
  nestedConnections?: string[];
  nestedFlows?: string[];
  nestedStates?: string[];
  nestedConstraints?: string[];
  nestedRequirements?: string[];
  nestedCalculations?: string[];
  nestedMetadata?: string[];
  ports?: string[];
}

/**
 * SysML2 InterfaceDefinition インターフェース
 */
export interface SysML2_InterfaceDefinition extends SysML2_Definition {
  __type: 'InterfaceDefinition';
  endFeatures?: string[];
  interfaceUsages?: string[];
}

/**
 * SysML2 InterfaceUsage インターフェース
 */
export interface SysML2_InterfaceUsage extends SysML2_Usage {
  __type: 'InterfaceUsage';
  interfaceDefinition?: string;
  endFeatures?: string[];
}

/**
 * SysML2 ConnectionDefinition インターフェース
 */
export interface SysML2_ConnectionDefinition extends SysML2_Definition {
  __type: 'ConnectionDefinition';
  endFeatures?: string[];
  connectionUsages?: string[];
  sourceType?: string;
  targetType?: string;
}

/**
 * SysML2 ConnectionUsage インターフェース
 */
export interface SysML2_ConnectionUsage extends SysML2_Usage {
  __type: 'ConnectionUsage';
  connectionDefinition?: string;
  endFeatures?: string[];
  sourceType?: string;
  targetType?: string;
}

/**
 * SysML2 AllocationDefinition インターフェース
 */
export interface SysML2_AllocationDefinition extends SysML2_Definition {
  __type: 'AllocationDefinition';
  allocationUsages?: string[];
  sourceType?: string;
  targetType?: string;
}

/**
 * SysML2 AllocationUsage インターフェース
 */
export interface SysML2_AllocationUsage extends SysML2_Usage {
  __type: 'AllocationUsage';
  allocationDefinition?: string;
  sourceType?: string;
  targetType?: string;
}

/**
 * SysML2 FlowDefinition インターフェース
 */
export interface SysML2_FlowDefinition extends SysML2_Definition {
  __type: 'FlowDefinition';
  flowUsages?: string[];
  flowProperties?: string[];
  sourceType?: string;
  targetType?: string;
}

/**
 * SysML2 FlowUsage インターフェース
 */
export interface SysML2_FlowUsage extends SysML2_Usage {
  __type: 'FlowUsage';
  flowDefinition?: string;
  flowProperties?: string[];
  sourceType?: string;
  targetType?: string;
}

/**
 * SysML2 StateDefinition インターフェース
 */
export interface SysML2_StateDefinition extends SysML2_Definition {
  __type: 'StateDefinition';
  stateUsages?: string[];
  isInitial?: boolean;
  entryActions?: string[];
  doActions?: string[];
  exitActions?: string[];
  transitions?: string[];
  nestedStates?: string[];
}

/**
 * SysML2 TransitionDefinition インターフェース
 * 状態間の遷移を定義する
 */
export interface SysML2_TransitionDefinition extends SysML2_Definition {
  __type: 'TransitionDefinition';
  transitionUsages?: string[];
  sourceStateType?: string;  // 遷移元状態の型
  targetStateType?: string;  // 遷移先状態の型
  guardType?: string;        // ガード条件の型
  triggerType?: string;      // トリガーの型
  effectType?: string;       // エフェクトアクションの型
}

/**
 * SysML2 StateUsage インターフェース
 */
export interface SysML2_StateUsage extends SysML2_Usage {
  __type: 'StateUsage';
  stateDefinition?: string;
  isInitial?: boolean;
  entryActions?: string[];
  doActions?: string[];
  exitActions?: string[];
  transitions?: string[];
  nestedStates?: string[];
}

/**
 * SysML2 TransitionUsage インターフェース
 * 状態間の遷移を表す
 */
export interface SysML2_TransitionUsage extends SysML2_Usage {
  __type: 'TransitionUsage';
  transitionDefinition?: string;
  sourceStateId?: string;
  targetStateId?: string;
  guard?: string;        // 遷移条件
  trigger?: string;      // 遷移を引き起こすトリガー（イベント）
  effect?: string;       // 遷移時に実行するアクション
  priority?: number;     // 遷移の優先度
  isElse?: boolean;      // else遷移かどうか
}

/**
 * SysML2 ActionDefinition インターフェース
 * アクションの定義 (OMG SysML v2 Beta3 Part1 §7.17)
 */
export interface SysML2_ActionDefinition extends SysML2_Definition {
  __type: 'ActionDefinition';
  actionUsages?: string[];      // このActionDefinitionを使用するActionUsageのIDリスト
  parameters?: string[];        // パラメータのIDリスト
  isAbstract?: boolean;         // 抽象アクションかどうか
  bodies?: string[];            // アクション本体（Behavior）のIDリスト
  guardParams?: string[];       // ガード条件パラメータのIDリスト
  preconditions?: string[];     // 事前条件のIDリスト
  postconditions?: string[];    // 事後条件のIDリスト
}

/**
 * SysML2 ActionUsage インターフェース
 * アクションの使用 (OMG SysML v2 Beta3 Part1 §7.17)
 */
export interface SysML2_ActionUsage extends SysML2_Usage {
  __type: 'ActionUsage';
  actionDefinition?: string;    // 参照するActionDefinitionのID
  parameters?: string[];        // パラメータのIDリスト
  bodies?: string[];            // アクション本体（Behavior）のIDリスト
  isReference?: boolean;        // 他のActionUsageへの参照かどうか
  guard?: string;               // ガード条件
  successions?: string[];       // 後続アクション（succession関係）のIDリスト
  preconditions?: string[];     // 事前条件のIDリスト
  postconditions?: string[];    // 事後条件のIDリスト
}

/**
 * SysML2 CalculationDefinition インターフェース
 */
export interface SysML2_CalculationDefinition extends SysML2_Definition {
  __type: 'CalculationDefinition';
  calculationUsages?: string[];
  parameters?: string[];
  result?: string;
  expression?: string;
}

/**
 * SysML2 CalculationUsage インターフェース
 */
export interface SysML2_CalculationUsage extends SysML2_Usage {
  __type: 'CalculationUsage';
  calculationDefinition?: string;
  parameters?: string[];
  result?: string;
  expression?: string;
}

/**
 * SysML2 ConstraintDefinition インターフェース
 */
export interface SysML2_ConstraintDefinition extends SysML2_Definition {
  __type: 'ConstraintDefinition';
  constraintUsages?: string[];
  parameters?: string[];
  expression?: string;
}

/**
 * SysML2 ConstraintUsage インターフェース
 */
export interface SysML2_ConstraintUsage extends SysML2_Usage {
  __type: 'ConstraintUsage';
  constraintDefinition?: string;
  parameters?: string[];
  expression?: string;
}

/**
 * SysML2 RequirementDefinition インターフェース
 */
export interface SysML2_RequirementDefinition extends SysML2_Definition {
  __type: 'RequirementDefinition';
  requirementUsages?: string[];
  text?: string;
  assumedConstraints?: string[];
  requiredConstraints?: string[];
  subjectParameter?: string;
  stakeholders?: string[];
  satisfiedBy?: string[];
  verifiedBy?: string[];
}

/**
 * SysML2 RequirementUsage インターフェース
 */
export interface SysML2_RequirementUsage extends SysML2_Usage {
  __type: 'RequirementUsage';
  requirementDefinition?: string;
  text?: string;
  assumedConstraints?: string[];
  requiredConstraints?: string[];
  subjectParameter?: string;
  stakeholders?: string[];
  satisfiedBy?: string[];
  verifiedBy?: string[];
}

/**
 * SysML2 ConcernDefinition インターフェース
 */
export interface SysML2_ConcernDefinition extends SysML2_Definition {
  __type: 'ConcernDefinition';
  concernUsages?: string[];
  stakeholders?: string[];
}

/**
 * SysML2 ConcernUsage インターフェース
 */
export interface SysML2_ConcernUsage extends SysML2_Usage {
  __type: 'ConcernUsage';
  concernDefinition?: string;
  stakeholders?: string[];
}

/**
 * SysML2 ActorDefinition インターフェース
 */
export interface SysML2_ActorDefinition extends SysML2_PartDefinition {
  __type: 'ActorDefinition';
  actorUsages?: string[];
  participatedUseCases?: string[];
}

/**
 * SysML2 ActorUsage インターフェース
 */
export interface SysML2_ActorUsage extends SysML2_PartUsage {
  __type: 'ActorUsage';
  actorDefinition?: string;
  participatedUseCases?: string[];
}

/**
 * SysML2 StakeholderDefinition インターフェース
 */
export interface SysML2_StakeholderDefinition extends SysML2_PartDefinition {
  __type: 'StakeholderDefinition';
  stakeholderUsages?: string[];
  concerns?: string[];
  viewpoints?: string[];
}

/**
 * SysML2 StakeholderUsage インターフェース
 */
export interface SysML2_StakeholderUsage extends SysML2_PartUsage {
  __type: 'StakeholderUsage';
  stakeholderDefinition?: string;
  concerns?: string[];
  viewpoints?: string[];
}

/**
 * SysML2 CaseDefinition インターフェース
 */
export interface SysML2_CaseDefinition extends SysML2_Definition {
  __type: 'CaseDefinition' | string;
  caseUsages?: string[];
  objectives?: string[];
  subjectParameter?: string;
}

/**
 * SysML2 CaseUsage インターフェース
 */
export interface SysML2_CaseUsage extends SysML2_Usage {
  __type: 'CaseUsage' | string;
  caseDefinition?: string;
  objectives?: string[];
  subjectParameter?: string;
}

/**
 * SysML2 AnalysisCaseDefinition インターフェース
 */
export interface SysML2_AnalysisCaseDefinition extends SysML2_CaseDefinition {
  __type: 'AnalysisCaseDefinition';
  analysisCaseUsages?: string[];
  resultParameters?: string[];
}

/**
 * SysML2 AnalysisCaseUsage インターフェース
 */
export interface SysML2_AnalysisCaseUsage extends SysML2_CaseUsage {
  __type: 'AnalysisCaseUsage';
  analysisCaseDefinition?: string;
  resultParameters?: string[];
}

/**
 * SysML2 VerificationCaseDefinition インターフェース
 */
export interface SysML2_VerificationCaseDefinition extends SysML2_CaseDefinition {
  __type: 'VerificationCaseDefinition';
  verificationCaseUsages?: string[];
  verifiedRequirements?: string[];
}

/**
 * SysML2 VerificationCaseUsage インターフェース
 */
export interface SysML2_VerificationCaseUsage extends SysML2_CaseUsage {
  __type: 'VerificationCaseUsage';
  verificationCaseDefinition?: string;
  verifiedRequirements?: string[];
}

/**
 * SysML2 UseCaseDefinition インターフェース
 */
export interface SysML2_UseCaseDefinition extends SysML2_CaseDefinition {
  __type: 'UseCaseDefinition';
  useCaseUsages?: string[];
  includedUseCases?: string[];
  actors?: string[];
}

/**
 * SysML2 UseCaseUsage インターフェース
 */
export interface SysML2_UseCaseUsage extends SysML2_CaseUsage {
  __type: 'UseCaseUsage';
  useCaseDefinition?: string;
  includedUseCases?: string[];
  actors?: string[];
}

/**
 * SysML2 ViewDefinition インターフェース
 */
export interface SysML2_ViewDefinition extends SysML2_Definition {
  __type: 'ViewDefinition';
  viewUsages?: string[];
  viewpointDefinition?: string;
  satisfiedViewpoints?: string[];
  renderedElements?: string[];
}

/**
 * SysML2 ViewUsage インターフェース
 */
export interface SysML2_ViewUsage extends SysML2_Usage {
  __type: 'ViewUsage';
  viewDefinition?: string;
  viewpointDefinition?: string;
  satisfiedViewpoints?: string[];
  renderedElements?: string[];
}

/**
 * SysML2 ViewpointDefinition インターフェース
 */
export interface SysML2_ViewpointDefinition extends SysML2_Definition {
  __type: 'ViewpointDefinition';
  viewpointUsages?: string[];
  concernsAddressed?: string[];
  stakeholders?: string[];
}

/**
 * SysML2 ViewpointUsage インターフェース
 */
export interface SysML2_ViewpointUsage extends SysML2_Usage {
  __type: 'ViewpointUsage';
  viewpointDefinition?: string;
  concernsAddressed?: string[];
  stakeholders?: string[];
}

/**
 * SysML2 PortDefinition インターフェース
 */
export interface SysML2_PortDefinition extends SysML2_Definition {
  __type: 'PortDefinition';
  typeName?: string;
  direction?: 'in' | 'out' | 'inout';
  isProxy?: boolean;
  isBehavior?: boolean;
  isConjugated?: boolean;
  multiplicity?: string;
  portUsages?: string[];
}

/**
 * SysML2 PortUsage インターフェース
 */
export interface SysML2_PortUsage extends SysML2_Usage {
  __type: 'PortUsage';
  portDefinition?: string;
  direction?: 'in' | 'out' | 'inout';
  isConjugated?: boolean;
  flowSpecifications?: string[];
  interfaces?: string[];
}

/**
 * SysML2 RenderingDefinition インターフェース
 */
export interface SysML2_RenderingDefinition extends SysML2_Definition {
  __type: 'RenderingDefinition';
  renderingUsages?: string[];
  renderedElements?: string[];
  renderedViews?: string[];
}

/**
 * SysML2 RenderingUsage インターフェース
 */
export interface SysML2_RenderingUsage extends SysML2_Usage {
  __type: 'RenderingUsage';
  renderingDefinition?: string;
  renderedElements?: string[];
  renderedViews?: string[];
}

/**
 * SysML2 MetadataDefinition インターフェース
 */
export interface SysML2_MetadataDefinition extends SysML2_Definition {
  __type: 'MetadataDefinition';
  metadataUsages?: string[];
  annotatedElements?: string[];
}

/**
 * SysML2 MetadataUsage インターフェース
 */
export interface SysML2_MetadataUsage extends SysML2_Usage {
  __type: 'MetadataUsage';
  metadataDefinition?: string;
  annotatedElements?: string[];
}