/**
 * SysML v2 IfActionUsage クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §10.4.7に準拠
 * 
 * IfActionUsageは、条件分岐を表現するアクションクラスです。
 */

import { v4 as uuid } from 'uuid';
import { ActionUsage } from '../ActionUsage';
import { FeatureObject } from '../../kerml/Feature';

/**
 * アクション分岐を表現するインターフェース
 */
export interface ActionBranch {
  /** 分岐のID */
  id: string;
  
  /** 分岐の条件（else分岐の場合は不要） */
  condition?: string;
  
  /** 分岐内のアクションID配列 */
  actions: string[];
  
  /** else分岐かどうか */
  isElse: boolean;
}

/**
 * IfActionUsage クラス
 * SysML v2の条件分岐アクションを表現するクラス
 */
export class IfActionUsage extends ActionUsage {
  /** 条件分岐配列 */
  branches: ActionBranch[] = [];
  
  /** 分岐の種類（if-then, if-then-else, etc.） */
  branchType: 'if-then' | 'if-then-else' = 'if-then';
  
  /**
   * IfActionUsage コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    loopType?: string;
    condition?: string;
    branches?: ActionBranch[];
    ownerId?: string;
    description?: string;
    isAbstract?: boolean;
  } = {}) {
    super({
      id: options.id,
      name: options.name,
      actionDefinitionId: 'action.control.if',
      ownerId: options.ownerId,
      description: options.description,
      isAbstract: options.isAbstract
    });
    
    if (options.branches && options.branches.length > 0) {
      this.branches = [...options.branches];
      // else分岐があるかどうかチェック
      const hasElse = this.branches.some(branch => branch.isElse);
      this.branchType = hasElse ? 'if-then-else' : 'if-then';
    } else {
      // デフォルト分岐を作成
      this.branches = [
        {
          id: uuid(),
          condition: options.condition || 'true',
          actions: [],
          isElse: false
        }
      ];
    }
  }
  
  /**
   * 分岐を追加する
   * @param condition 条件式
   * @param isElse else分岐かどうか
   * @returns 作成された分岐ID
   */
  addBranch(condition?: string, isElse: boolean = false): string {
    // else分岐が既にある場合は追加できない
    if (isElse && this.branches.some(branch => branch.isElse)) {
      throw new Error('else分岐は1つしか追加できません');
    }
    
    const branch: ActionBranch = {
      id: uuid(),
      condition: isElse ? undefined : (condition || 'true'),
      actions: [],
      isElse
    };
    
    this.branches.push(branch);
    
    // 分岐の種類を更新
    if (isElse) {
      this.branchType = 'if-then-else';
    }
    
    return branch.id;
  }
  
  /**
   * 分岐を削除する
   * @param branchId 削除する分岐のID
   */
  removeBranch(branchId: string): void {
    this.branches = this.branches.filter(branch => branch.id !== branchId);
    
    // 分岐の種類を更新
    const hasElse = this.branches.some(branch => branch.isElse);
    this.branchType = hasElse ? 'if-then-else' : 'if-then';
  }
  
  /**
   * 分岐にアクションを追加する
   * @param branchId 分岐ID
   * @param actionId アクションID
   */
  addActionToBranch(branchId: string, actionId: string): void {
    const branch = this.branches.find(b => b.id === branchId);
    if (branch) {
      if (!branch.actions.includes(actionId)) {
        branch.actions.push(actionId);
      }
    }
  }
  
  /**
   * 分岐からアクションを削除する
   * @param branchId 分岐ID
   * @param actionId アクションID
   */
  removeActionFromBranch(branchId: string, actionId: string): void {
    const branch = this.branches.find(b => b.id === branchId);
    if (branch) {
      branch.actions = branch.actions.filter(id => id !== actionId);
    }
  }
  
  /**
   * 条件式を更新する
   * @param branchId 分岐ID
   * @param condition 新しい条件式
   */
  updateCondition(branchId: string, condition: string): void {
    const branch = this.branches.find(b => b.id === branchId);
    if (branch && !branch.isElse) {
      branch.condition = condition;
    }
  }
  
  /**
   * アクションの情報をオブジェクトとして返す
   * @returns FeatureObject 構造
   */
  override toObject(): FeatureObject {
    const baseObject = super.toObject();
    return {
      ...baseObject,
      type: 'IfActionUsage',
      properties: {
        ...baseObject.properties,
        branches: this.branches.map(branch => ({...branch})),
        branchType: this.branchType
      }
    };
  }
  
  /**
   * JSONシリアライズ用のメソッド
   * @returns JSON形式のオブジェクト
   */
  override toJSON(): any {
    const obj = this.toObject();
    // obj.properties内のすべてのプロパティをトップレベルに移動
    const result = {
      ...obj,
      ...obj.properties,
      __type: 'IfActionUsage'
    };
    // propertiesプロパティを除外した新しいオブジェクトを作成
    const { properties, ...resultWithoutProperties } = result;
    return resultWithoutProperties;
  }
  
  /**
   * JSONデータからIfActionUsageインスタンスを作成する
   * @param json JSON形式のデータ
   * @returns 新しいIfActionUsageインスタンス
   */
  static fromJSON(json: any): IfActionUsage {
    if (!json || typeof json !== 'object') {
      throw new Error('有効なJSONオブジェクトではありません');
    }
    
    const ifAction = new IfActionUsage({
      id: json.id || uuid(),
      name: json.name,
      ownerId: json.ownerId,
      description: json.description,
      isAbstract: json.isAbstract,
      branches: json.branches
    });
    
    if (json.branchType) {
      ifAction.branchType = json.branchType;
    }
    
    return ifAction;
  }
}