import { v4 as uuidv4 } from 'uuid';
import { CaseUsage } from './CaseUsage';
import { Usage } from './Usage';
import { SysML2_UseCaseUsage } from './interfaces';

/**
 * SysML v2のUseCaseUsageクラス
 * システムのユースケースの使用を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.20に準拠
 */
export class UseCaseUsage extends CaseUsage {
  /** 参照するUseCaseDefinitionのID */
  useCaseDefinitionId?: string;
  
  /** 含まれる（インクルードされる）ユースケースのIDリスト */
  includedUseCases: string[];
  
  /** ユースケースに関わるアクターのIDリスト */
  actors: string[];
  
  /**
   * UseCaseUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    caseDefinitionId?: string;
    useCaseDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    objectives?: string[];
    subjectParameterId?: string;
    includedUseCases?: string[];
    actors?: string[];
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.caseDefinitionId || params.useCaseDefinitionId,
      caseDefinitionId: params.caseDefinitionId || params.useCaseDefinitionId || params.definitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages,
      objectives: params.objectives,
      subjectParameterId: params.subjectParameterId
    });
    
    this.useCaseDefinitionId = params.useCaseDefinitionId || params.caseDefinitionId || params.definitionId;
    this.includedUseCases = params.includedUseCases || [];
    this.actors = params.actors || [];
  }
  
  /**
   * 含まれるユースケースを追加する
   * @param useCaseId 追加するユースケースのID
   */
  addIncludedUseCase(useCaseId: string): void {
    if (!this.includedUseCases.includes(useCaseId)) {
      this.includedUseCases.push(useCaseId);
    }
  }
  
  /**
   * 含まれるユースケースを削除する
   * @param useCaseId 削除するユースケースのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeIncludedUseCase(useCaseId: string): boolean {
    const index = this.includedUseCases.indexOf(useCaseId);
    if (index !== -1) {
      this.includedUseCases.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * アクターを追加する
   * @param actorId 追加するアクターのID
   */
  addActor(actorId: string): void {
    if (!this.actors.includes(actorId)) {
      this.actors.push(actorId);
    }
  }
  
  /**
   * アクターを削除する
   * @param actorId 削除するアクターのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeActor(actorId: string): boolean {
    const index = this.actors.indexOf(actorId);
    if (index !== -1) {
      this.actors.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_UseCaseUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_UseCaseUsage {
    return {
      ...super.toJSON(),
      __type: 'UseCaseUsage',
      useCaseDefinition: this.useCaseDefinitionId,
      includedUseCases: this.includedUseCases,
      actors: this.actors
    };
  }
  
  /**
   * JSONオブジェクトからUseCaseUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns UseCaseUsageインスタンス
   */
  static fromJSON(json: SysML2_UseCaseUsage): UseCaseUsage {
    return new UseCaseUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      caseDefinitionId: json.caseDefinition,
      useCaseDefinitionId: json.useCaseDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
      objectives: json.objectives,
      subjectParameterId: json.subjectParameter,
      includedUseCases: json.includedUseCases,
      actors: json.actors
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
      stereotype: this.stereotype || 'use_case',
      definitionId: this.useCaseDefinitionId,
      objectives: this.objectives,
      subjectParameterId: this.subjectParameterId,
      includedUseCases: this.includedUseCases,
      actors: this.actors
    };
  }
}