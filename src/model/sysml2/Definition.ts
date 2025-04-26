import { v4 as uuidv4 } from 'uuid';
import { Classifier } from '../kerml/Classifier';
import { Feature } from '../kerml/Feature';
import { SysML2_Definition } from './interfaces';

/**
 * SysML v2のDefinition基底クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.6に準拠
 */
export class Definition extends Classifier {
  /** 抽象要素かどうか */
  isAbstract: boolean;
  
  /** バリエーション要素かどうか */
  isVariation: boolean;
  
  /** ステレオタイプ (SysML v2 Profile適用情報) */
  stereotype?: string;
  
  /** 所有する特性（Feature）のID配列 */
  ownedFeatures: string[];
  
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
}