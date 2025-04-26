import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { PartDefinition } from './PartDefinition';
import { SysML2_ActorDefinition } from './interfaces';

/**
 * SysML v2のActorDefinitionクラス
 * システムと対話するアクターを定義する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.17に準拠
 */
export class ActorDefinition extends PartDefinition {
  /** このActorDefinitionを使用するActorUsageのIDリスト */
  actorUsages: string[];
  
  /** このアクターが参加するユースケースのIDリスト */
  participatedUseCases: string[];
  
  /**
   * ActorDefinition コンストラクタ
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
    partUsages?: string[];
    actorUsages?: string[];
    participatedUseCases?: string[];
  }) {
    super(params);
    
    this.actorUsages = params.actorUsages || [];
    this.participatedUseCases = params.participatedUseCases || [];
    
    // partUsagesにactorUsagesも追加
    if (params.actorUsages) {
      params.actorUsages.forEach(actorUsage => {
        if (!this.partUsages.includes(actorUsage)) {
          this.partUsages.push(actorUsage);
        }
      });
    }
  }
  
  /**
   * ActorUsageへの参照を追加する
   * @param actorUsageId 追加するActorUsageのID
   */
  addActorUsageReference(actorUsageId: string): void {
    if (!this.actorUsages.includes(actorUsageId)) {
      this.actorUsages.push(actorUsageId);
      
      // スーパークラスのpartUsagesにも追加
      if (!this.partUsages.includes(actorUsageId)) {
        this.partUsages.push(actorUsageId);
      }
    }
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
   * @returns SysML2_ActorDefinition形式のJSONオブジェクト
   */
  toJSON(): SysML2_ActorDefinition {
    return {
      ...super.toJSON(),
      __type: 'ActorDefinition',
      actorUsages: this.actorUsages,
      participatedUseCases: this.participatedUseCases
    };
  }
  
  /**
   * JSONオブジェクトからActorDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns ActorDefinitionインスタンス
   */
  static fromJSON(json: SysML2_ActorDefinition): ActorDefinition {
    return new ActorDefinition({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      ownedFeatures: json.ownedFeatures,
      partUsages: json.partUsages,
      actorUsages: json.actorUsages,
      participatedUseCases: json.participatedUseCases
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
      stereotype: this.stereotype || 'actor_def',
      isAbstract: this.isAbstract,
      participatedUseCases: this.participatedUseCases
    };
  }
}