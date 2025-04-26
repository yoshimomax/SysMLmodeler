/**
 * SysML v2 IfActionUsage クラス
 * 条件分岐アクションの使用を表す
 * OMG SysML v2 Beta3 Part1 §7.17準拠
 */

import { v4 as uuid } from 'uuid';
import { ActionUsage, ActionUsageParams } from '../ActionUsage';
import { SysML2_ActionUsage } from '../interfaces';
import { ValidationError } from '../validator';

/**
 * 条件分岐（then/else）の構造
 */
export interface Branch {
  /** 分岐ID */
  id: string;
  /** 分岐の条件式 */
  condition?: string;
  /** 分岐内のアクションID配列 */
  actions: string[];
  /** この分岐がelse節かどうか */
  isElse?: boolean;
}

/**
 * IfActionUsage コンストラクタパラメータ
 */
export interface IfActionUsageParams extends ActionUsageParams {
  branches?: Branch[];      // 分岐のリスト
  condition?: string;       // メイン条件式
}

/**
 * IfActionUsage クラス
 * 条件分岐を表すアクション
 */
export class IfActionUsage extends ActionUsage {
  /** クラス識別子 */
  __type: 'IfActionUsage' = 'IfActionUsage';

  /** 分岐のリスト */
  branches: Branch[] = [];
  
  /** メイン条件式 */
  condition?: string;

  /**
   * IfActionUsage コンストラクタ
   * @param params IfActionUsageのプロパティ
   */
  constructor(params: IfActionUsageParams = {}) {
    super(params);
    
    this.condition = params.condition;
    
    if (params.branches) {
      // ディープコピーを作成
      this.branches = params.branches.map(branch => ({
        id: branch.id || uuid(),
        condition: branch.condition,
        actions: [...branch.actions],
        isElse: branch.isElse
      }));
    }
  }

  /**
   * アクションの検証
   * @throws ValidationError 検証エラー
   */
  validate(): void {
    super.validate();
    
    // 分岐が少なくとも1つ以上あることを確認
    if (this.branches.length === 0) {
      throw new ValidationError(`IfActionUsage (id=${this.id}, name=${this.name})は` +
        `少なくとも1つの分岐を持つ必要があります`);
    }
    
    // else分岐の確認（最大1つまで）
    const elseBranches = this.branches.filter(branch => branch.isElse);
    if (elseBranches.length > 1) {
      throw new ValidationError(`IfActionUsage (id=${this.id}, name=${this.name})は` +
        `最大1つのelse分岐を持つことができます`);
    }
    
    // else以外の分岐は条件式が必要
    const nonElseBranches = this.branches.filter(branch => !branch.isElse);
    for (const branch of nonElseBranches) {
      if (!branch.condition && !this.condition) {
        throw new ValidationError(`IfActionUsage (id=${this.id}, name=${this.name})の` +
          `分岐(id=${branch.id})はcondition属性を持つ必要があります`);
      }
    }
    
    // 各分岐に少なくとも1つのアクションがあることを確認
    for (const branch of this.branches) {
      if (branch.actions.length === 0) {
        throw new ValidationError(`IfActionUsage (id=${this.id}, name=${this.name})の` +
          `分岐(id=${branch.id})は少なくとも1つのアクションを持つ必要があります`);
      }
    }
  }

  /**
   * 分岐を追加
   * @param branch 追加する分岐
   */
  addBranch(branch: Omit<Branch, 'id'>): string {
    const id = uuid();
    this.branches.push({
      id,
      condition: branch.condition,
      actions: [...branch.actions],
      isElse: branch.isElse
    });
    return id;
  }

  /**
   * 分岐を削除
   * @param branchId 削除する分岐のID
   * @returns 削除に成功した場合はtrue
   */
  removeBranch(branchId: string): boolean {
    const index = this.branches.findIndex(branch => branch.id === branchId);
    if (index >= 0) {
      this.branches.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 分岐にアクションを追加
   * @param branchId 分岐のID
   * @param actionId 追加するアクションのID
   * @returns 追加に成功した場合はtrue
   */
  addActionToBranch(branchId: string, actionId: string): boolean {
    const branch = this.branches.find(branch => branch.id === branchId);
    if (branch) {
      if (!branch.actions.includes(actionId)) {
        branch.actions.push(actionId);
      }
      return true;
    }
    return false;
  }

  /**
   * 分岐からアクションを削除
   * @param branchId 分岐のID
   * @param actionId 削除するアクションのID
   * @returns 削除に成功した場合はtrue
   */
  removeActionFromBranch(branchId: string, actionId: string): boolean {
    const branch = this.branches.find(branch => branch.id === branchId);
    if (branch) {
      const index = branch.actions.indexOf(actionId);
      if (index >= 0) {
        branch.actions.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * JSON形式に変換
   * @returns JSONオブジェクト
   */
  toJSON(): SysML2_ActionUsage & { 
    branches: Branch[];
    condition?: string;
  } {
    return {
      ...super.toJSON(),
      __type: this.__type,
      branches: this.branches.map(branch => ({
        id: branch.id,
        condition: branch.condition,
        actions: [...branch.actions],
        isElse: branch.isElse
      })),
      condition: this.condition
    };
  }

  /**
   * JSONからIfActionUsageを復元
   * @param json JSONオブジェクト
   * @returns 復元されたIfActionUsage
   */
  static fromJSON(json: ReturnType<IfActionUsage['toJSON']>): IfActionUsage {
    const actionUsage = new IfActionUsage({
      id: json.id,
      name: json.name,
      description: json.description,
      actionDefinition: json.actionDefinition,
      isReference: json.isReference,
      guard: json.guard,
      condition: json.condition
    });
    
    if (json.parameters) actionUsage.parameters = [...json.parameters];
    if (json.bodies) actionUsage.bodies = [...json.bodies];
    if (json.successions) actionUsage.successions = [...json.successions];
    if (json.preconditions) actionUsage.preconditions = [...json.preconditions];
    if (json.postconditions) actionUsage.postconditions = [...json.postconditions];
    
    if (json.branches) {
      actionUsage.branches = json.branches.map(branch => ({
        id: branch.id,
        condition: branch.condition,
        actions: [...branch.actions],
        isElse: branch.isElse
      }));
    }

    return actionUsage;
  }
}