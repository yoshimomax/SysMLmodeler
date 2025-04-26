import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../kerml/Feature';
import { Definition } from './Definition';
import { SysML2_ConcernDefinition } from './interfaces';

/**
 * SysML v2のConcernDefinitionクラス
 * システムに関する関心事を定義する
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.16に準拠
 */
export class ConcernDefinition extends Definition {
  /** このConcernDefinitionを使用するConcernUsageのIDリスト */
  concernUsages: string[];
  
  /** この関心事に関連するステークホルダーのIDリスト */
  stakeholders: string[];
  
  /**
   * ConcernDefinition コンストラクタ
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
    concernUsages?: string[];
    stakeholders?: string[];
  }) {
    super(params);
    
    this.concernUsages = params.concernUsages || [];
    this.stakeholders = params.stakeholders || [];
  }
  
  /**
   * ConcernUsageへの参照を追加する
   * @param concernUsageId 追加するConcernUsageのID
   */
  addConcernUsageReference(concernUsageId: string): void {
    if (!this.concernUsages.includes(concernUsageId)) {
      this.concernUsages.push(concernUsageId);
    }
  }
  
  /**
   * ステークホルダーを追加する
   * @param stakeholderId 追加するステークホルダーのID
   */
  addStakeholder(stakeholderId: string): void {
    if (!this.stakeholders.includes(stakeholderId)) {
      this.stakeholders.push(stakeholderId);
    }
  }
  
  /**
   * ステークホルダーを削除する
   * @param stakeholderId 削除するステークホルダーのID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeStakeholder(stakeholderId: string): boolean {
    const index = this.stakeholders.indexOf(stakeholderId);
    if (index !== -1) {
      this.stakeholders.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns SysML2_ConcernDefinition形式のJSONオブジェクト
   */
  toJSON(): SysML2_ConcernDefinition {
    return {
      ...super.toJSON(),
      __type: 'ConcernDefinition',
      concernUsages: this.concernUsages,
      stakeholders: this.stakeholders
    };
  }
  
  /**
   * JSONオブジェクトからConcernDefinitionインスタンスを生成する
   * @param json 変換元のJSONオブジェクト
   * @returns ConcernDefinitionインスタンス
   */
  static fromJSON(json: SysML2_ConcernDefinition): ConcernDefinition {
    return new ConcernDefinition({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      isAbstract: json.isAbstract,
      isVariation: json.isVariation,
      stereotype: json.stereotype,
      ownedFeatures: json.ownedFeatures,
      concernUsages: json.concernUsages,
      stakeholders: json.stakeholders
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
      stereotype: this.stereotype || 'concern_def',
      isAbstract: this.isAbstract,
      stakeholders: this.stakeholders
    };
  }
}