import { v4 as uuidv4 } from 'uuid';
import { PartUsage } from './PartUsage';
import { Usage } from './Usage';
import { SysML2_ActorUsage, SysML2_PartUsage } from './interfaces';

/**
 * SysML v2のActorUsageクラス
 * システムと対話するアクターの使用を表す
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.17に準拠
 */
export class ActorUsage extends PartUsage {
  /** 参照するActorDefinitionのID */
  actorDefinitionId?: string;
  
  /** このアクターが参加するユースケースのIDリスト */
  participatedUseCases: string[];
  
  /**
   * ActorUsage コンストラクタ
   * @param params 初期化パラメータ
   */
  constructor(params: {
    id?: string;
    ownerId?: string;
    name?: string;
    definitionId?: string;
    partDefinitionId?: string;
    actorDefinitionId?: string;
    isVariation?: boolean;
    stereotype?: string;
    nestedUsages?: string[] | Usage[];
    participatedUseCases?: string[];
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name,
      definitionId: params.definitionId || params.partDefinitionId || params.actorDefinitionId,
      partDefinitionId: params.partDefinitionId || params.actorDefinitionId || params.definitionId,
      isVariation: params.isVariation,
      stereotype: params.stereotype,
      nestedUsages: params.nestedUsages
    });
    
    this.actorDefinitionId = params.actorDefinitionId || params.partDefinitionId || params.definitionId;
    this.participatedUseCases = params.participatedUseCases || [];
  }
  
  /**
   * 参加するユースケースを追加する
   * @param useCaseId 追加するユースケースのID
   */
  addParticipatedUseCase(useCaseId: string): void {
    if (!this.participatedUseCases.includes(useCaseId)) {
      this.participatedUseCases.push(useCaseId);
    }
  }
  
  /**
   * 参加するユースケースを削除する
   * @param useCaseId 削除するユースケースのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeParticipatedUseCase(useCaseId: string): boolean {
    const index = this.participatedUseCases.indexOf(useCaseId);
    if (index !== -1) {
      this.participatedUseCases.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_ActorUsage形式のJSONオブジェクト
   */
  toJSON(): SysML2_ActorUsage {
    return {
      ...super.toJSON(),
      __type: 'ActorUsage',
      actorDefinition: this.actorDefinitionId,
      participatedUseCases: this.participatedUseCases
    };
  }
  
  /**
   * JSONオブジェクトからActorUsageインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns ActorUsageインスタンス
   */
  static fromJSON(json: SysML2_ActorUsage): ActorUsage {
    return new ActorUsage({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      definitionId: json.definition,
      partDefinitionId: json.partDefinition,
      actorDefinitionId: json.actorDefinition,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      nestedUsages: json.nestedUsages,
      participatedUseCases: json.participatedUseCases
    });
  }
  
  /**
   * オブジェクトをプレーンなJavaScriptオブジェクトに変換する（UI表示用）
   * @returns プレーンなJavaScriptオブジェクト
   */
  toObject() {
    const baseObject = super.toObject();
    return {
      ...baseObject,
      stereotype: this.stereotype || 'actor',
      definitionId: this.actorDefinitionId,
      participatedUseCases: this.participatedUseCases
    };
  }
}