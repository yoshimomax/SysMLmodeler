/**
 * SysML v2 PerformActionUsage クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.17.3に準拠
 * 
 * PerformActionUsageは、他のアクションを実行するためのアクションを表現するクラスです。
 * 実行対象のアクションを参照し、そのアクションを実行するための手段を提供します。
 */

import { v4 as uuid } from 'uuid';
import { ActionUsage } from '../ActionUsage';
import { FeatureObject } from '../../kerml/Feature';

export class PerformActionUsage extends ActionUsage {
  /** 実行対象のアクションを参照するID */
  target: string;
  
  /** パラメータマッピング（実行対象のパラメータID -> 自身のパラメータID） */
  parameterMapping: Map<string, string> = new Map();
  
  /**
   * PerformActionUsage コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    target: string;
    parameterMapping?: Record<string, string>;
    actionDefinition?: string;
    successions?: string[];
    parameterValues?: Record<string, any>;
    parameters?: string[];
    guard?: string;
    ownerId?: string;
    isAbstract?: boolean;
  }) {
    // ActionUsage基底クラスのコンストラクタを呼び出し
    super({
      id: options.id,
      name: options.name,
      actionDefinition: options.actionDefinition,
      successions: options.successions,
      parameterValues: options.parameterValues,
      parameters: options.parameters,
      guard: options.guard,
      ownerId: options.ownerId,
      isAbstract: options.isAbstract
    });
    
    // 実行対象アクションの設定
    this.target = options.target;
    
    // パラメータマッピングの初期化
    if (options.parameterMapping) {
      Object.entries(options.parameterMapping).forEach(([targetParam, sourceParam]) => {
        this.parameterMapping.set(targetParam, sourceParam);
      });
    }
  }
  
  /**
   * 実行対象のアクションIDを設定する
   * @param targetId 実行対象アクションのID
   */
  setTarget(targetId: string): void {
    this.target = targetId;
  }
  
  /**
   * パラメータマッピングを追加する
   * @param targetParamId 実行対象のパラメータID
   * @param sourceParamId 自身のパラメータID
   */
  addParameterMapping(targetParamId: string, sourceParamId: string): void {
    this.parameterMapping.set(targetParamId, sourceParamId);
  }
  
  /**
   * パラメータマッピングを削除する
   * @param targetParamId 実行対象のパラメータID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeParameterMapping(targetParamId: string): boolean {
    return this.parameterMapping.delete(targetParamId);
  }
  
  /**
   * パラメータマッピングをすべてクリアする
   */
  clearParameterMappings(): void {
    this.parameterMapping.clear();
  }
  
  /**
   * 実行アクションの情報をオブジェクトとして返す
   * @returns FeatureObject 構造
   */
  override toObject(): FeatureObject {
    const baseObject = super.toObject();
    
    // パラメータマッピングをオブジェクトに変換
    const parameterMappingObj: Record<string, string> = {};
    this.parameterMapping.forEach((sourceParam, targetParam) => {
      parameterMappingObj[targetParam] = sourceParam;
    });
    
    return {
      ...baseObject,
      type: 'PerformActionUsage',
      properties: {
        ...baseObject.properties,
        target: this.target,
        parameterMapping: parameterMappingObj
      }
    };
  }
  
  /**
   * JSONデータからPerformActionUsageインスタンスを作成する
   * @param json JSON形式のデータ
   * @returns 新しいPerformActionUsageインスタンス
   */
  static fromJSON(json: any): PerformActionUsage {
    if (!json || typeof json !== 'object') {
      throw new Error('有効なJSONオブジェクトではありません');
    }
    
    // 必須のtarget属性を検証
    if (!json.target) {
      throw new Error('実行対象のアクション(target)が指定されていません');
    }
    
    // PerformActionUsageインスタンスを作成
    const performAction = new PerformActionUsage({
      id: json.id || uuid(),
      name: json.name,
      ownerId: json.ownerId,
      isAbstract: json.isAbstract,
      actionDefinition: json.actionDefinition,
      successions: Array.isArray(json.successions) ? [...json.successions] : [],
      parameters: Array.isArray(json.parameters) ? [...json.parameters] : [],
      parameterValues: json.parameterValues || {},
      guard: json.guard,
      target: json.target,
      parameterMapping: json.parameterMapping || {}
    });
    
    return performAction;
  }
  
  /**
   * JSONシリアライズ用のメソッド
   * @returns JSON形式のオブジェクト
   */
  toJSON(): any {
    const obj = this.toObject();
    // obj.properties内のすべてのプロパティをトップレベルに移動
    const result = {
      ...obj,
      ...obj.properties,
      __type: 'PerformActionUsage'
    };
    // propertiesプロパティを除外した新しいオブジェクトを作成
    const { properties, ...resultWithoutProperties } = result;
    return resultWithoutProperties;
  }
}