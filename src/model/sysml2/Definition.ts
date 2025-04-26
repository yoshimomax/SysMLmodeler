import { v4 as uuidv4 } from 'uuid';
import { Classifier } from '../kerml/Classifier';
import { Feature } from '../kerml/Feature';
import { SysML2_Definition } from './interfaces';
import { validateKerMLClassifier } from '../kerml/validators';

/**
 * SysML v2のDefinition基底クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.6に準拠
 * 
 * Definitionは、システム要素の型を定義するクラスです。
 * SysML v2のDefinitionは、KerMLのClassifierを基底とし、対応するUsageと関連付けられます。
 */
export class Definition extends Classifier {
  /** 抽象要素かどうか - 直接インスタンス化できない型を示す */
  isAbstract: boolean;
  
  /** バリエーション要素かどうか - 変化点・選択肢を表現するために使用 */
  isVariation: boolean;
  
  /** ステレオタイプ (SysML v2 Profile適用情報) */
  stereotype?: string;
  
  /** 所有する特性（Feature）のID配列 */
  ownedFeatures: string[];
  
  /** このDefinitionを参照するUsageのIDリスト - 双方向リンク用 */
  usageReferences: string[];
  
  /**
   * Definition コンストラクタ
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
    usageReferences?: string[];
  }) {
    super({
      id: params.id || uuidv4(),
      ownerId: params.ownerId,
      name: params.name
    });
    
    this.isAbstract = params.isAbstract ?? false;
    this.isVariation = params.isVariation ?? false;
    this.stereotype = params.stereotype;
    this.ownedFeatures = [];
    this.usageReferences = params.usageReferences || [];
    
    // 所有特性の設定
    if (params.ownedFeatures) {
      params.ownedFeatures.forEach(feature => {
        if (typeof feature === 'string') {
          this.ownedFeatures.push(feature);
        } else {
          feature.ownerId = this.id;
          this.ownedFeatures.push(feature.id);
        }
      });
    }
    
    // KerML制約の検証
    try {
      this.validate();
    } catch (error) {
      console.warn(`警告: Definition(id=${this.id}, name=${this.name}) の検証中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 特性を追加する
   * @param feature 追加する特性
   */
  addFeature(feature: Feature): void {
    feature.ownerId = this.id;
    this.ownedFeatures.push(feature.id);
  }
  
  /**
   * 特性を削除する
   * @param featureId 削除する特性のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeFeature(featureId: string): boolean {
    const index = this.ownedFeatures.indexOf(featureId);
    if (index !== -1) {
      this.ownedFeatures.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * Usage参照を追加する - 双方向リンク管理用
   * @param usageId 追加するUsageのID
   */
  addUsageReference(usageId: string): void {
    if (!this.usageReferences.includes(usageId)) {
      this.usageReferences.push(usageId);
    }
  }
  
  /**
   * Usage参照を削除する - 双方向リンク管理用
   * @param usageId 削除するUsageのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeUsageReference(usageId: string): boolean {
    const index = this.usageReferences.indexOf(usageId);
    if (index !== -1) {
      this.usageReferences.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * KerML制約およびSysML v2の制約を検証する
   * @throws Error 制約違反がある場合
   */
  validate(): void {
    // 基底クラス（KerML Classifier）の制約を検証
    validateKerMLClassifier(this);
    
    // SysML v2固有の制約を検証
    if (this.isAbstract && this.usageReferences.length > 0) {
      console.warn(`警告: 抽象Definition(id=${this.id}, name=${this.name})に直接Usageが関連付けられています`);
    }
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_Definition形式のJSONオブジェクト
   */
  toJSON(): SysML2_Definition {
    return {
      ...super.toJSON(),
      __type: 'Definition',
      isAbstract: this.isAbstract,
      isVariation: this.isVariation,
      stereotype: this.stereotype,
      ownedFeatures: this.ownedFeatures
    };
  }
  
  /**
   * JSONオブジェクトからDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns Definitionインスタンス
   */
  static fromJSON(json: SysML2_Definition): Definition {
    return new Definition({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      ownedFeatures: json.ownedFeatures || []
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
      stereotype: this.stereotype || 'definition',
      isAbstract: this.isAbstract,
      isVariation: this.isVariation,
      ownedFeatures: this.ownedFeatures,
      usageReferences: this.usageReferences
    };
  }
}