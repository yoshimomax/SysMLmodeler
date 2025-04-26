/**
 * SysML v2 LoopActionUsage クラス
 * 繰り返しアクションの使用を表す
 * OMG SysML v2 Beta3 Part1 §7.17準拠
 */

import { v4 as uuid } from 'uuid';
import { ActionUsage, ActionUsageParams } from '../ActionUsage';
import { SysML2_ActionUsage } from '../interfaces';
import { ValidationError } from '../validator';

/**
 * ループ種別の定義
 */
export type LoopType = 'while' | 'until' | 'for' | 'forEach';

/**
 * LoopActionUsage コンストラクタパラメータ
 */
export interface LoopActionUsageParams extends ActionUsageParams {
  loopType?: LoopType;             // ループの種類
  condition?: string;              // ループ条件
  initActions?: string[];          // 初期化アクション
  bodyActions?: string[];          // ループ本体アクション
  updateActions?: string[];        // 更新アクション
  collection?: string;             // 繰り返し対象コレクション
  iteratorName?: string;           // イテレータ変数名
  maxIterations?: number;          // 最大繰り返し回数
  isParallel?: boolean;            // 並列実行かどうか
}

/**
 * LoopActionUsage クラス
 * 繰り返し制御を表すアクション
 */
export class LoopActionUsage extends ActionUsage {
  /** クラス識別子 */
  __type: 'LoopActionUsage' = 'LoopActionUsage';

  /** ループの種類 */
  loopType: LoopType = 'while';
  
  /** ループ条件 */
  condition?: string;
  
  /** 初期化アクション */
  initActions: string[] = [];
  
  /** ループ本体アクション */
  bodyActions: string[] = [];
  
  /** 更新アクション */
  updateActions: string[] = [];
  
  /** 繰り返し対象コレクション */
  collection?: string;
  
  /** イテレータ変数名 */
  iteratorName?: string;
  
  /** 最大繰り返し回数 */
  maxIterations?: number;
  
  /** 並列実行かどうか */
  isParallel: boolean = false;

  /**
   * LoopActionUsage コンストラクタ
   * @param params LoopActionUsageのプロパティ
   */
  constructor(params: LoopActionUsageParams = {}) {
    super(params);
    
    if (params.loopType) this.loopType = params.loopType;
    this.condition = params.condition;
    if (params.initActions) this.initActions = [...params.initActions];
    if (params.bodyActions) this.bodyActions = [...params.bodyActions];
    if (params.updateActions) this.updateActions = [...params.updateActions];
    this.collection = params.collection;
    this.iteratorName = params.iteratorName;
    this.maxIterations = params.maxIterations;
    if (params.isParallel !== undefined) this.isParallel = params.isParallel;
  }

  /**
   * アクションの検証
   * @throws ValidationError 検証エラー
   */
  validate(): void {
    super.validate();
    
    // ループタイプに応じた必須項目チェック
    switch (this.loopType) {
      case 'while':
      case 'until':
        if (!this.condition) {
          throw new ValidationError(`${this.loopType}タイプのLoopActionUsage (id=${this.id}, name=${this.name})は` +
            `condition属性を持つ必要があります`);
        }
        break;
        
      case 'for':
        // for ループは初期化、条件、更新が必要
        if (this.initActions.length === 0) {
          throw new ValidationError(`forタイプのLoopActionUsage (id=${this.id}, name=${this.name})は` +
            `少なくとも1つのinitActionを持つ必要があります`);
        }
        if (!this.condition) {
          throw new ValidationError(`forタイプのLoopActionUsage (id=${this.id}, name=${this.name})は` +
            `condition属性を持つ必要があります`);
        }
        if (this.updateActions.length === 0) {
          throw new ValidationError(`forタイプのLoopActionUsage (id=${this.id}, name=${this.name})は` +
            `少なくとも1つのupdateActionを持つ必要があります`);
        }
        break;
        
      case 'forEach':
        // forEach ループはコレクションとイテレータが必要
        if (!this.collection) {
          throw new ValidationError(`forEachタイプのLoopActionUsage (id=${this.id}, name=${this.name})は` +
            `collection属性を持つ必要があります`);
        }
        if (!this.iteratorName) {
          throw new ValidationError(`forEachタイプのLoopActionUsage (id=${this.id}, name=${this.name})は` +
            `iteratorName属性を持つ必要があります`);
        }
        break;
    }
    
    // ループ本体は必須
    if (this.bodyActions.length === 0) {
      throw new ValidationError(`LoopActionUsage (id=${this.id}, name=${this.name})は` +
        `少なくとも1つのbodyActionを持つ必要があります`);
    }
    
    // 最大繰り返し回数が指定されている場合は正の数であることを確認
    if (this.maxIterations !== undefined && this.maxIterations <= 0) {
      throw new ValidationError(`LoopActionUsage (id=${this.id}, name=${this.name})の` +
        `maxIterations属性は正の数でなければなりません`);
    }
  }

  /**
   * 初期化アクションを追加
   * @param actionId 追加するアクションのID
   */
  addInitAction(actionId: string): void {
    if (!this.initActions.includes(actionId)) {
      this.initActions.push(actionId);
    }
  }

  /**
   * 初期化アクションを削除
   * @param actionId 削除するアクションのID
   * @returns 削除に成功した場合はtrue
   */
  removeInitAction(actionId: string): boolean {
    const index = this.initActions.indexOf(actionId);
    if (index >= 0) {
      this.initActions.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * ループ本体アクションを追加
   * @param actionId 追加するアクションのID
   */
  addBodyAction(actionId: string): void {
    if (!this.bodyActions.includes(actionId)) {
      this.bodyActions.push(actionId);
    }
  }

  /**
   * ループ本体アクションを削除
   * @param actionId 削除するアクションのID
   * @returns 削除に成功した場合はtrue
   */
  removeBodyAction(actionId: string): boolean {
    const index = this.bodyActions.indexOf(actionId);
    if (index >= 0) {
      this.bodyActions.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 更新アクションを追加
   * @param actionId 追加するアクションのID
   */
  addUpdateAction(actionId: string): void {
    if (!this.updateActions.includes(actionId)) {
      this.updateActions.push(actionId);
    }
  }

  /**
   * 更新アクションを削除
   * @param actionId 削除するアクションのID
   * @returns 削除に成功した場合はtrue
   */
  removeUpdateAction(actionId: string): boolean {
    const index = this.updateActions.indexOf(actionId);
    if (index >= 0) {
      this.updateActions.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * JSON形式に変換
   * @returns JSONオブジェクト
   */
  toJSON(): SysML2_ActionUsage & { 
    loopType: LoopType;
    condition?: string;
    initActions: string[];
    bodyActions: string[];
    updateActions: string[];
    collection?: string;
    iteratorName?: string;
    maxIterations?: number;
    isParallel: boolean;
  } {
    return {
      ...super.toJSON(),
      __type: this.__type,
      loopType: this.loopType,
      condition: this.condition,
      initActions: [...this.initActions],
      bodyActions: [...this.bodyActions],
      updateActions: [...this.updateActions],
      collection: this.collection,
      iteratorName: this.iteratorName,
      maxIterations: this.maxIterations,
      isParallel: this.isParallel
    };
  }

  /**
   * JSONからLoopActionUsageを復元
   * @param json JSONオブジェクト
   * @returns 復元されたLoopActionUsage
   */
  static fromJSON(json: ReturnType<LoopActionUsage['toJSON']>): LoopActionUsage {
    const actionUsage = new LoopActionUsage({
      id: json.id,
      name: json.name,
      description: json.description,
      actionDefinition: json.actionDefinition,
      isReference: json.isReference,
      guard: json.guard,
      loopType: json.loopType,
      condition: json.condition,
      collection: json.collection,
      iteratorName: json.iteratorName,
      maxIterations: json.maxIterations,
      isParallel: json.isParallel
    });
    
    if (json.parameters) actionUsage.parameters = [...json.parameters];
    if (json.bodies) actionUsage.bodies = [...json.bodies];
    if (json.successions) actionUsage.successions = [...json.successions];
    if (json.preconditions) actionUsage.preconditions = [...json.preconditions];
    if (json.postconditions) actionUsage.postconditions = [...json.postconditions];
    if (json.initActions) actionUsage.initActions = [...json.initActions];
    if (json.bodyActions) actionUsage.bodyActions = [...json.bodyActions];
    if (json.updateActions) actionUsage.updateActions = [...json.updateActions];

    return actionUsage;
  }
}