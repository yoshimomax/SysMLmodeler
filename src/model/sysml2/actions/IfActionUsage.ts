/**
 * SysML v2 IfActionUsage クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.17.4に準拠
 * 
 * IfActionUsageは、条件分岐アクションを表現するクラスです。
 * 条件に基づいて複数の分岐（ブランチ）からアクションを選択して実行します。
 */

import { v4 as uuid } from 'uuid';
import { ActionUsage } from '../ActionUsage';
import { FeatureObject } from '../../kerml/Feature';

/**
 * アクション分岐情報を表す型
 */
export interface ActionBranch {
  /** 分岐の一意識別子 */
  id: string;
  
  /** 分岐条件（else節の場合は不要） */
  condition?: string;
  
  /** この分岐で実行するアクションのID配列 */
  actions: string[];
  
  /** elseブランチかどうか */
  isElse: boolean;
}

export class IfActionUsage extends ActionUsage {
  /** 条件分岐のブランチリスト */
  branches: ActionBranch[] = [];
  
  /**
   * IfActionUsage コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    branches?: ActionBranch[];
    actionDefinition?: string;
    successions?: string[];
    parameterValues?: Record<string, any>;
    parameters?: string[];
    guard?: string;
    ownerId?: string;
    isAbstract?: boolean;
  } = {}) {
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
    
    // 分岐の初期化
    this.branches = options.branches || [];
    
    // 分岐のIDがない場合は生成
    this.branches.forEach(branch => {
      if (!branch.id) {
        branch.id = uuid();
      }
    });
  }
  
  /**
   * 分岐を追加する
   * @param condition 条件式（elseの場合はundefined）
   * @param actions アクションIDの配列
   * @param isElse elseブランチかどうか
   * @returns 追加した分岐のID
   */
  addBranch(condition: string | undefined, actions: string[], isElse: boolean = false): string {
    const branchId = uuid();
    
    this.branches.push({
      id: branchId,
      condition,
      actions: [...actions],
      isElse
    });
    
    return branchId;
  }
  
  /**
   * 分岐を削除する
   * @param branchId 削除する分岐のID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeBranch(branchId: string): boolean {
    const initialLength = this.branches.length;
    this.branches = this.branches.filter(branch => branch.id !== branchId);
    return this.branches.length !== initialLength;
  }
  
  /**
   * 分岐条件を更新する
   * @param branchId 分岐ID
   * @param condition 新しい条件式
   * @returns 更新成功した場合はtrue、そうでなければfalse
   */
  updateBranchCondition(branchId: string, condition: string): boolean {
    const branch = this.branches.find(b => b.id === branchId);
    if (branch) {
      branch.condition = condition;
      return true;
    }
    return false;
  }
  
  /**
   * 分岐にアクションを追加する
   * @param branchId 分岐ID
   * @param actionId 追加するアクションID
   * @returns 追加成功した場合はtrue、そうでなければfalse
   */
  addActionToBranch(branchId: string, actionId: string): boolean {
    const branch = this.branches.find(b => b.id === branchId);
    if (branch) {
      if (!branch.actions.includes(actionId)) {
        branch.actions.push(actionId);
      }
      return true;
    }
    return false;
  }
  
  /**
   * 分岐からアクションを削除する
   * @param branchId 分岐ID
   * @param actionId 削除するアクションID
   * @returns 削除成功した場合はtrue、そうでなければfalse
   */
  removeActionFromBranch(branchId: string, actionId: string): boolean {
    const branch = this.branches.find(b => b.id === branchId);
    if (branch) {
      const initialLength = branch.actions.length;
      branch.actions = branch.actions.filter(id => id !== actionId);
      return branch.actions.length !== initialLength;
    }
    return false;
  }
  
  /**
   * 条件分岐アクションの情報をオブジェクトとして返す
   */
  override toObject() {
    const baseObject = super.toObject();
    return {
      ...baseObject,
      branches: this.branches.map(branch => ({
        id: branch.id,
        condition: branch.condition,
        actions: [...branch.actions],
        isElse: branch.isElse
      }))
    };
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
    
    // 分岐情報の復元
    const branches = Array.isArray(json.branches) 
      ? json.branches.map((branch: any) => ({
          id: branch.id || uuid(),
          condition: branch.condition,
          actions: Array.isArray(branch.actions) ? [...branch.actions] : [],
          isElse: branch.isElse === true
        }))
      : [];
    
    // IfActionUsageインスタンスを作成
    const ifAction = new IfActionUsage({
      id: json.id || uuid(),
      name: json.name,
      ownerId: json.ownerId,
      isAbstract: json.isAbstract,
      actionDefinition: json.actionDefinition,
      successions: Array.isArray(json.successions) ? [...json.successions] : [],
      parameters: Array.isArray(json.parameters) ? [...json.parameters] : [],
      parameterValues: json.parameterValues || {},
      guard: json.guard,
      branches
    });
    
    return ifAction;
  }
  
  /**
   * JSONシリアライズ用のメソッド
   * @returns JSON形式のオブジェクト
   */
  toJSON(): any {
    const obj = this.toObject();
    return {
      ...obj,
      __type: 'IfActionUsage'
    };
  }
}