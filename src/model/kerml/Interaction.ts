import { v4 as uuidv4 } from 'uuid';
import { KerML_Interaction } from './interfaces';
import { Behavior } from './Behavior';
import { Feature } from './Feature';

/**
 * KerML Interaction クラス
 * KerML メタモデルの相互作用を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class Interaction extends Behavior {
  /** 参加者のID配列 */
  private _participants: string[] = [];
  
  /**
   * Interaction コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    ownerId?: string;
    name?: string;
    shortName?: string;
    qualifiedName?: string;
    description?: string;
    isAbstract?: boolean;
    isConjugated?: boolean;
    isFinal?: boolean;
    isIndividual?: boolean;
    features?: Feature[];
    steps?: string[];
    participants?: string[];
  } = {}) {
    // 親クラスのコンストラクタを呼び出し
    super({
      id: options.id,
      ownerId: options.ownerId,
      name: options.name,
      shortName: options.shortName,
      qualifiedName: options.qualifiedName,
      description: options.description,
      isAbstract: options.isAbstract,
      isConjugated: options.isConjugated,
      isFinal: options.isFinal,
      isIndividual: options.isIndividual,
      features: options.features,
      steps: options.steps
    });
    
    if (options.participants) {
      this._participants = [...options.participants];
    }
  }
  
  /**
   * 参加者を取得
   */
  get participants(): string[] {
    return [...this._participants];
  }
  
  /**
   * 参加者を追加
   * @param participantId 追加する参加者のID
   */
  addParticipant(participantId: string): void {
    if (!this._participants.includes(participantId)) {
      this._participants.push(participantId);
    }
  }
  
  /**
   * 参加者を削除
   * @param participantId 削除する参加者のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeParticipant(participantId: string): boolean {
    const initialLength = this._participants.length;
    this._participants = this._participants.filter(id => id !== participantId);
    return this._participants.length !== initialLength;
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_Interaction {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'Interaction',
      participants: this._participants
    } as KerML_Interaction;
  }
  
  /**
   * JSON形式から相互作用を作成
   * @param json JSON表現
   * @returns 相互作用インスタンス
   */
  static fromJSON(json: KerML_Interaction, featureInstances: Feature[] = []): Interaction {
    // 基本的なBehavior情報でInteractionを初期化
    const interaction = new Interaction({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      isAbstract: json.isAbstract,
      isConjugated: json.isConjugated,
      isFinal: json.isFinal,
      isIndividual: json.isIndividual,
      steps: json.steps,
      participants: json.participants
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === interaction.id) {
          interaction.addFeature(feature);
        }
      });
    }
    
    return interaction;
  }
}