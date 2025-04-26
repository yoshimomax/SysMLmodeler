import { v4 as uuidv4 } from 'uuid';
import { Type } from '../kerml/Type';
import { Feature } from '../kerml/Feature';
import { SysML_Viewpoint } from './interfaces';

/**
 * SysML Viewpoint クラス
 * SysML v2の関心事を表すビューポイントを表現する
 * OMG仕様：PTC/2023-02-02、SysML v2 Beta1
 */
export class Viewpoint extends Type {
  /** SysMLステレオタイプ - 常に'viewpoint'に設定 */
  readonly stereotype: string = 'viewpoint';
  
  /** 関心事 */
  private _concerns: string[] = [];
  
  /** ステークホルダー */
  private _stakeholders: string[] = [];
  
  /** メソッド */
  private _methods: string[] = [];
  
  /** 言語 */
  private _languages: string[] = [];
  
  /**
   * Viewpoint コンストラクタ
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
    concerns?: string[];
    stakeholders?: string[];
    methods?: string[];
    languages?: string[];
  } = {}) {
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
    
    if (options.concerns) {
      this._concerns = [...options.concerns];
    }
    
    if (options.stakeholders) {
      this._stakeholders = [...options.stakeholders];
    }
    
    if (options.methods) {
      this._methods = [...options.methods];
    }
    
    if (options.languages) {
      this._languages = [...options.languages];
    }
  }
  
  /**
   * 関心事を取得
   */
  get concerns(): string[] {
    return [...this._concerns];
  }
  
  /**
   * ステークホルダーを取得
   */
  get stakeholders(): string[] {
    return [...this._stakeholders];
  }
  
  /**
   * メソッドを取得
   */
  get methods(): string[] {
    return [...this._methods];
  }
  
  /**
   * 言語を取得
   */
  get languages(): string[] {
    return [...this._languages];
  }
  
  /**
   * 関心事を追加
   * @param concern 追加する関心事
   */
  addConcern(concern: string): void {
    if (!this._concerns.includes(concern)) {
      this._concerns.push(concern);
    }
  }
  
  /**
   * ステークホルダーを追加
   * @param stakeholder 追加するステークホルダー
   */
  addStakeholder(stakeholder: string): void {
    if (!this._stakeholders.includes(stakeholder)) {
      this._stakeholders.push(stakeholder);
    }
  }
  
  /**
   * メソッドを追加
   * @param method 追加するメソッド
   */
  addMethod(method: string): void {
    if (!this._methods.includes(method)) {
      this._methods.push(method);
    }
  }
  
  /**
   * 言語を追加
   * @param language 追加する言語
   */
  addLanguage(language: string): void {
    if (!this._languages.includes(language)) {
      this._languages.push(language);
    }
  }
  
  /**
   * 関心事を削除
   * @param concern 削除する関心事
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeConcern(concern: string): boolean {
    const initialLength = this._concerns.length;
    this._concerns = this._concerns.filter(c => c !== concern);
    return this._concerns.length !== initialLength;
  }
  
  /**
   * ステークホルダーを削除
   * @param stakeholder 削除するステークホルダー
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeStakeholder(stakeholder: string): boolean {
    const initialLength = this._stakeholders.length;
    this._stakeholders = this._stakeholders.filter(s => s !== stakeholder);
    return this._stakeholders.length !== initialLength;
  }
  
  /**
   * メソッドを削除
   * @param method 削除するメソッド
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeMethod(method: string): boolean {
    const initialLength = this._methods.length;
    this._methods = this._methods.filter(m => m !== method);
    return this._methods.length !== initialLength;
  }
  
  /**
   * 言語を削除
   * @param language 削除する言語
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeLanguage(language: string): boolean {
    const initialLength = this._languages.length;
    this._languages = this._languages.filter(l => l !== language);
    return this._languages.length !== initialLength;
  }
  
  /**
   * JSON形式に変換
   * @returns ビューポイントのJSON表現
   */
  toJSON(): SysML_Viewpoint {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'Viewpoint',
      stereotype: this.stereotype,
      concerns: this._concerns,
      stakeholders: this._stakeholders,
      methods: this._methods,
      languages: this._languages
    };
  }
  
  /**
   * JSON形式からビューポイントを作成
   * @param json JSON表現
   * @returns ビューポイントインスタンス
   */
  static fromJSON(json: SysML_Viewpoint, featureInstances: Feature[] = []): Viewpoint {
    // 基本的なType情報でViewpointを初期化
    const viewpoint = new Viewpoint({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      isAbstract: json.isAbstract,
      isConjugated: json.isConjugated,
      concerns: json.concerns,
      stakeholders: json.stakeholders,
      methods: json.methods,
      languages: json.languages
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === viewpoint.id) {
          viewpoint.addFeature(feature);
        }
      });
    }
    
    return viewpoint;
  }
}