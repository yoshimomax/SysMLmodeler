/**
 * SysML v2 ActionValidator
 * アクション関連の検証を行うバリデータ
 * OMG SysML v2 Beta3 Part1 §7.17 Actions に準拠
 */

import { ActionUsage } from '../ActionUsage';
import { IfActionUsage } from '../actions/IfActionUsage';
import { LoopActionUsage } from '../actions/LoopActionUsage';
import { ValidationError } from '../validator';

/**
 * ActionValidator クラス
 * アクション要素の検証機能を提供
 */
export class ActionValidator {
  
  /**
   * アクションのパラメータ整合性をチェック
   * @param action 検証対象のアクション
   * @param getParameter パラメータIDからパラメータを取得する関数
   * @throws ValidationError パラメータに問題がある場合
   */
  static validateParameters(
    action: ActionUsage,
    getParameter: (id: string) => any | undefined
  ): void {
    if (!action.parameters || action.parameters.length === 0) {
      return; // パラメータがない場合は検証不要
    }
    
    // 全てのパラメータが存在するか確認
    for (const paramId of action.parameters) {
      const param = getParameter(paramId);
      if (!param) {
        throw new ValidationError(
          `ActionUsage (id=${action.id}, name=${action.name || 'unnamed'})の` +
          `パラメータ(id=${paramId})が見つかりません`
        );
      }
    }
    
    // 追加のパラメータ検証ルールをここに実装
    // 例: 型の互換性、多重度の制約など
  }
  
  /**
   * IF分岐のガード条件の排他性をチェック
   * @param ifAction 検証対象のIfActionUsage
   * @throws ValidationError ガード条件に問題がある場合
   */
  static validateIfGuardExclusivity(ifAction: IfActionUsage): void {
    // else分岐を除いた通常分岐を取得
    const normalBranches = ifAction.branches.filter(branch => !branch.isElse);
    
    if (normalBranches.length <= 1) {
      return; // 分岐が1つ以下なら排他性の問題はない
    }
    
    // ガード条件の重複や矛盾をチェックする
    // Note: 完全な論理的排他性の検証は難しいため、簡易チェックのみ実装
    
    // 同一条件のチェック
    const conditions = normalBranches
      .map(branch => branch.condition || ifAction.condition)
      .filter(Boolean);
      
    const uniqueConditions = new Set(conditions);
    
    if (conditions.length !== uniqueConditions.size) {
      throw new ValidationError(
        `IfActionUsage (id=${ifAction.id}, name=${ifAction.name || 'unnamed'})の` +
        `分岐に重複するガード条件が存在します`
      );
    }
  }
  
  /**
   * ループアクションのマルチプレクシティ整合性をチェック
   * @param loopAction 検証対象のLoopActionUsage
   * @param getAction アクションIDからアクションを取得する関数
   * @throws ValidationError マルチプレクシティに問題がある場合
   */
  static validateLoopMultiplicity(
    loopAction: LoopActionUsage,
    getAction: (id: string) => ActionUsage | undefined
  ): void {
    // パラレルループの場合のみチェック
    if (!loopAction.isParallel) {
      return;
    }
    
    // すべてのボディアクションが存在するか確認
    for (const actionId of loopAction.bodyActions) {
      const action = getAction(actionId);
      if (!action) {
        throw new ValidationError(
          `LoopActionUsage (id=${loopAction.id}, name=${loopAction.name || 'unnamed'})の` +
          `bodyAction(id=${actionId})が見つかりません`
        );
      }
      
      // 並列ループ内のアクションに関する追加検証
      // 例: 並列ループ内のアクション間で共有リソースの競合がないかなど
    }
  }
  
  /**
   * アクション間のSuccessionUsage（後続関係）の有効性をチェック
   * @param action 検証対象のアクション
   * @param getAction アクションIDからアクションを取得する関数
   * @throws ValidationError 後続関係に問題がある場合
   */
  static validateSuccessions(
    action: ActionUsage,
    getAction: (id: string) => ActionUsage | undefined
  ): void {
    if (!action.successions || action.successions.length === 0) {
      return; // 後続関係がない場合は検証不要
    }
    
    // すべての後続アクションが存在するか確認
    for (const succId of action.successions) {
      const succAction = getAction(succId);
      if (!succAction) {
        throw new ValidationError(
          `ActionUsage (id=${action.id}, name=${action.name || 'unnamed'})の` +
          `後続アクション(id=${succId})が見つかりません`
        );
      }
    }
    
    // 循環参照のチェック（サイクル検出）
    // TODO: グラフアルゴリズムでサイクル検出を実装
  }
  
  /**
   * アクション全体の整合性をチェック
   * @param action 検証対象のアクション
   * @param getParameter パラメータを取得する関数
   * @param getAction アクションを取得する関数
   * @throws ValidationError アクションに問題がある場合
   */
  static validateAction(
    action: ActionUsage,
    getParameter: (id: string) => any | undefined,
    getAction: (id: string) => ActionUsage | undefined
  ): void {
    // 基本検証（各アクションクラス内のvalidateメソッドで実装されている検証）
    action.validate();
    
    // パラメータ整合性の検証
    this.validateParameters(action, getParameter);
    
    // 後続関係の検証
    this.validateSuccessions(action, getAction);
    
    // アクション種別に応じた追加検証
    if (action instanceof IfActionUsage) {
      // IF分岐のガード条件の排他性をチェック
      this.validateIfGuardExclusivity(action);
    } 
    else if (action instanceof LoopActionUsage) {
      // ループアクションのマルチプレクシティ整合性をチェック
      this.validateLoopMultiplicity(action, getAction);
    }
    
    // アクション種別ごとの追加検証はここに追加
  }
  
  /**
   * アクション階層全体を検証
   * @param rootActions ルートアクションの配列
   * @param getParameter パラメータを取得する関数
   * @param getAction アクションを取得する関数
   * @throws ValidationError アクション階層に問題がある場合
   */
  static validateActionHierarchy(
    rootActions: ActionUsage[],
    getParameter: (id: string) => any | undefined,
    getAction: (id: string) => ActionUsage | undefined
  ): void {
    // すべてのルートアクションを検証
    for (const action of rootActions) {
      this.validateAction(action, getParameter, getAction);
    }
    
    // アクション間の整合性チェック
    // 例: 異なるアクション間での名前の衝突、データフローの整合性など
    
    // TODO: 他のアクション階層全体に関する検証を追加
  }
}