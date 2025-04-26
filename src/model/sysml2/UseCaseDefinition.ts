import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { CaseDefinition } from './CaseDefinition';
import { SysML2_UseCaseDefinition } from './interfaces';

/**
 * SysML v2のUseCaseDefinitionクラス
 * システムのユースケースを定義する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.20に準拠
 */
export class UseCaseDefinition extends CaseDefinition {
  /** このUseCaseDefinitionを使用するUseCaseUsageのIDリスト */
  useCaseUsages: string[];
  
  /** 含まれる（インクルードされる）ユースケースのIDリスト */
  includedUseCases: string[];
  
  /** ユースケースに関わるアクターのIDリスト */
  actors: string[];
  
  /**
   * UseCaseDefinition コンストラクタ
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
    useCaseUsages?: string[];
    includedUseCases?: string[];
    actors?: string[];
  }) {
    super(params);
    
    this.useCaseUsages = params.useCaseUsages || [];
    this.includedUseCases = params.includedUseCases || [];
    this.actors = params.actors || [];
  }
  
  /**
   * UseCaseUsageへの参照を追加する
   * @param useCaseUsageId 追加するUseCaseUsageのID
   */
  addUseCaseUsageReference(useCaseUsageId: string): void {
    if (!this.useCaseUsages.includes(useCaseUsageId)) {
      this.useCaseUsages.push(useCaseUsageId);
      
      // スーパークラスのcaseUsagesにも追加
      if (!this.caseUsages.includes(useCaseUsageId)) {
        this.caseUsages.push(useCaseUsageId);
      }
    }
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
   * @returns SysML2_UseCaseDefinition形式のJSONオブジェクト
   */
  toJSON(): SysML2_UseCaseDefinition {
    return {
      ...super.toJSON(),
      __type: 'UseCaseDefinition',
      useCaseUsages: this.useCaseUsages,
      includedUseCases: this.includedUseCases,
      actors: this.actors
    };
  }
  
  /**
   * JSONオブジェクトからUseCaseDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns UseCaseDefinitionインスタンス
   */
  static fromJSON(json: SysML2_UseCaseDefinition): UseCaseDefinition {
    return new UseCaseDefinition({
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
      useCaseUsages: json.useCaseUsages,
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
      stereotype: this.stereotype || 'use_case_def',
      isAbstract: this.isAbstract,
      objectives: this.objectives,
      subjectParameterId: this.subjectParameterId,
      includedUseCases: this.includedUseCases,
      actors: this.actors
    };
  }
}