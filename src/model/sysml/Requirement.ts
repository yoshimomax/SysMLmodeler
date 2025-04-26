import { v4 as uuidv4 } from 'uuid';
import { Type } from '../kerml/Type';
import { Feature } from '../kerml/Feature';
import { SysML_Requirement } from './interfaces';

/**
 * SysML Requirement クラス
 * SysML v2の要件を表現する
 * OMG仕様：PTC/2023-02-02、SysML v2 Beta1
 */
export class Requirement extends Type {
  /** SysMLステレオタイプ - 常に'requirement'に設定 */
  readonly stereotype: string = 'requirement';
  
  /** 要件テキスト */
  text: string;
  
  /** 根拠 */
  rationale?: string;
  
  /** 重要度 */
  criticality?: string;
  
  /** ステータス */
  status?: string;
  
  /** 検証する要素のID配列 */
  private _verifiedBy: string[] = [];
  
  /** 満足する要素のID配列 */
  private _satisfiedBy: string[] = [];
  
  /** 洗練する要素のID配列 */
  private _refinedBy: string[] = [];
  
  /** トレースする要素のID配列 */
  private _tracedTo: string[] = [];
  
  /**
   * Requirement コンストラクタ
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
    features?: Feature[];
    text: string;
    rationale?: string;
    criticality?: string;
    status?: string;
    verifiedBy?: string[];
    satisfiedBy?: string[];
    refinedBy?: string[];
    tracedTo?: string[];
  }) {
    // 親クラスのコンストラクタを呼び出し
    super({
      id: options.id || uuidv4(),
      ownerId: options.ownerId,
      name: options.name,
      shortName: options.shortName,
      qualifiedName: options.qualifiedName,
      description: options.description,
      isAbstract: options.isAbstract,
      isConjugated: options.isConjugated,
      features: options.features
    });
    
    this.text = options.text;
    this.rationale = options.rationale;
    this.criticality = options.criticality;
    this.status = options.status;
    
    if (options.verifiedBy) {
      this._verifiedBy = [...options.verifiedBy];
    }
    
    if (options.satisfiedBy) {
      this._satisfiedBy = [...options.satisfiedBy];
    }
    
    if (options.refinedBy) {
      this._refinedBy = [...options.refinedBy];
    }
    
    if (options.tracedTo) {
      this._tracedTo = [...options.tracedTo];
    }
  }
  
  /**
   * 検証する要素のID配列を取得
   */
  get verifiedBy(): string[] {
    return [...this._verifiedBy];
  }
  
  /**
   * 満足する要素のID配列を取得
   */
  get satisfiedBy(): string[] {
    return [...this._satisfiedBy];
  }
  
  /**
   * 洗練する要素のID配列を取得
   */
  get refinedBy(): string[] {
    return [...this._refinedBy];
  }
  
  /**
   * トレースする要素のID配列を取得
   */
  get tracedTo(): string[] {
    return [...this._tracedTo];
  }
  
  /**
   * 検証する要素を追加
   * @param elementId 追加する要素のID
   */
  addVerifiedBy(elementId: string): void {
    if (!this._verifiedBy.includes(elementId)) {
      this._verifiedBy.push(elementId);
    }
  }
  
  /**
   * 満足する要素を追加
   * @param elementId 追加する要素のID
   */
  addSatisfiedBy(elementId: string): void {
    if (!this._satisfiedBy.includes(elementId)) {
      this._satisfiedBy.push(elementId);
    }
  }
  
  /**
   * 洗練する要素を追加
   * @param elementId 追加する要素のID
   */
  addRefinedBy(elementId: string): void {
    if (!this._refinedBy.includes(elementId)) {
      this._refinedBy.push(elementId);
    }
  }
  
  /**
   * トレースする要素を追加
   * @param elementId 追加する要素のID
   */
  addTracedTo(elementId: string): void {
    if (!this._tracedTo.includes(elementId)) {
      this._tracedTo.push(elementId);
    }
  }
  
  /**
   * 検証する要素を削除
   * @param elementId 削除する要素のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeVerifiedBy(elementId: string): boolean {
    const initialLength = this._verifiedBy.length;
    this._verifiedBy = this._verifiedBy.filter(id => id !== elementId);
    return this._verifiedBy.length !== initialLength;
  }
  
  /**
   * 満足する要素を削除
   * @param elementId 削除する要素のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeSatisfiedBy(elementId: string): boolean {
    const initialLength = this._satisfiedBy.length;
    this._satisfiedBy = this._satisfiedBy.filter(id => id !== elementId);
    return this._satisfiedBy.length !== initialLength;
  }
  
  /**
   * 洗練する要素を削除
   * @param elementId 削除する要素のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeRefinedBy(elementId: string): boolean {
    const initialLength = this._refinedBy.length;
    this._refinedBy = this._refinedBy.filter(id => id !== elementId);
    return this._refinedBy.length !== initialLength;
  }
  
  /**
   * トレースする要素を削除
   * @param elementId 削除する要素のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeTracedTo(elementId: string): boolean {
    const initialLength = this._tracedTo.length;
    this._tracedTo = this._tracedTo.filter(id => id !== elementId);
    return this._tracedTo.length !== initialLength;
  }
  
  /**
   * JSON形式に変換
   * @returns 要件のJSON表現
   */
  toJSON(): SysML_Requirement {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'Requirement',
      stereotype: this.stereotype,
      text: this.text,
      rationale: this.rationale,
      criticality: this.criticality,
      status: this.status,
      verifiedBy: this._verifiedBy,
      satisfiedBy: this._satisfiedBy,
      refinedBy: this._refinedBy,
      tracedTo: this._tracedTo
    };
  }
  
  /**
   * JSON形式から要件を作成
   * @param json JSON表現
   * @returns 要件インスタンス
   */
  static fromJSON(json: SysML_Requirement, featureInstances: Feature[] = []): Requirement {
    // 基本的なType情報でRequirementを初期化
    const requirement = new Requirement({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      isAbstract: json.isAbstract,
      isConjugated: json.isConjugated,
      text: json.text,
      rationale: json.rationale,
      criticality: json.criticality,
      status: json.status,
      verifiedBy: json.verifiedBy,
      satisfiedBy: json.satisfiedBy,
      refinedBy: json.refinedBy,
      tracedTo: json.tracedTo
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === requirement.id) {
          requirement.addFeature(feature);
        }
      });
    }
    
    return requirement;
  }
}