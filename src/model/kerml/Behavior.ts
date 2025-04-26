import { v4 as uuidv4 } from 'uuid';
import { KerML_Behavior } from './interfaces';
import { Classifier } from './Classifier';
import { Feature } from './Feature';

/**
 * KerML Behavior クラス
 * KerML メタモデルの動的な振る舞いを表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class Behavior extends Classifier {
  /** ステップのID配列 */
  private _steps: string[] = [];
  
  /**
   * Behavior コンストラクタ
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
      features: options.features
    });
    
    if (options.steps) {
      this._steps = [...options.steps];
    }
  }
  
  /**
   * ステップを取得
   */
  get steps(): string[] {
    return [...this._steps];
  }
  
  /**
   * ステップを追加
   * @param stepId 追加するステップのID
   */
  addStep(stepId: string): void {
    if (!this._steps.includes(stepId)) {
      this._steps.push(stepId);
    }
  }
  
  /**
   * ステップを削除
   * @param stepId 削除するステップのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeStep(stepId: string): boolean {
    const initialLength = this._steps.length;
    this._steps = this._steps.filter(id => id !== stepId);
    return this._steps.length !== initialLength;
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_Behavior {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'Behavior',
      steps: this._steps
    } as KerML_Behavior;
  }
  
  /**
   * JSON形式から振る舞いを作成
   * @param json JSON表現
   * @returns 振る舞いインスタンス
   */
  static fromJSON(json: KerML_Behavior, featureInstances: Feature[] = []): Behavior {
    // 基本的なClassifier情報でBehaviorを初期化
    const behavior = new Behavior({
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
      steps: json.steps
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === behavior.id) {
          behavior.addFeature(feature);
        }
      });
    }
    
    return behavior;
  }
}