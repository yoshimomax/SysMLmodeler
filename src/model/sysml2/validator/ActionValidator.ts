/**
 * SysML v2 ActionValidator クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.17に準拠
 * 
 * ActionValidatorは、アクション関連の制約と整合性を検証するためのユーティリティクラスです。
 * アクション階層、パラメータの互換性、実行順序などのさまざまな側面を検証します。
 */

import { ActionUsage } from '../ActionUsage';
import { IfActionUsage } from '../actions/IfActionUsage';
import { LoopActionUsage } from '../actions/LoopActionUsage';
import { PerformActionUsage } from '../actions/PerformActionUsage';

export class ActionValidator {
  /**
   * アクションの制約と整合性を検証する
   * @param action 検証対象のアクション
   * @param getParameter パラメータを取得するための関数
   * @param getAction アクションを取得するための関数
   * @throws Error 制約違反がある場合
   */
  static validateAction(
    action: ActionUsage,
    getParameter: (id: string) => any,
    getAction: (id: string) => ActionUsage | undefined
  ): void {
    // 後続関係の検証
    this.validateSuccessions(action, getAction);
    
    // アクション特化型ごとの検証
    if (action instanceof IfActionUsage) {
      this.validateIfAction(action, getParameter, getAction);
    } else if (action instanceof LoopActionUsage) {
      this.validateLoopAction(action, getParameter, getAction);
    } else if (action instanceof PerformActionUsage) {
      this.validatePerformAction(action, getParameter, getAction);
    }
    
    // パラメータの検証
    this.validateParameters(action, getParameter);
  }
  
  /**
   * アクション階層全体を検証する
   * @param rootActions ルートアクションのリスト
   * @param getParameter パラメータを取得するための関数
   * @param getAction アクションを取得するための関数
   * @throws Error 制約違反がある場合
   */
  static validateActionHierarchy(
    rootActions: ActionUsage[],
    getParameter: (id: string) => any,
    getAction: (id: string) => ActionUsage | undefined
  ): void {
    // 訪問済みアクションを追跡するためのセット
    const visitedActions = new Set<string>();
    
    // 各ルートアクションから順に検証
    rootActions.forEach(action => {
      this.validateActionGraph(action, visitedActions, getParameter, getAction);
    });
  }
  
  /**
   * アクショングラフを検証する（再帰的に呼び出される）
   * @param action 現在検証中のアクション
   * @param visitedActions 訪問済みアクションのセット
   * @param getParameter パラメータを取得するための関数
   * @param getAction アクションを取得するための関数
   * @throws Error 制約違反がある場合
   */
  private static validateActionGraph(
    action: ActionUsage,
    visitedActions: Set<string>,
    getParameter: (id: string) => any,
    getAction: (id: string) => ActionUsage | undefined
  ): void {
    // 既に訪問済みなら終了（循環参照防止）
    if (visitedActions.has(action.id)) {
      return;
    }
    
    // 現在のアクションを訪問済みとしてマーク
    visitedActions.add(action.id);
    
    // 現在のアクションを検証
    this.validateAction(action, getParameter, getAction);
    
    // 後続アクションを検証
    action.successions.forEach(successorId => {
      const successorAction = getAction(successorId);
      if (!successorAction) {
        throw new Error(`後続アクション(id=${successorId})が見つかりません`);
      }
      this.validateActionGraph(successorAction, visitedActions, getParameter, getAction);
    });
    
    // 特殊アクションタイプごとに追加の検証
    if (action instanceof IfActionUsage) {
      // 各分岐内のアクションを検証
      action.branches.forEach(branch => {
        branch.actions.forEach(branchActionId => {
          const branchAction = getAction(branchActionId);
          if (!branchAction) {
            throw new Error(`分岐アクション(id=${branchActionId})が見つかりません`);
          }
          this.validateActionGraph(branchAction, visitedActions, getParameter, getAction);
        });
      });
    } else if (action instanceof LoopActionUsage) {
      // ループ本体のアクションを検証
      action.bodyActions.forEach(bodyActionId => {
        const bodyAction = getAction(bodyActionId);
        if (!bodyAction) {
          throw new Error(`ループ本体アクション(id=${bodyActionId})が見つかりません`);
        }
        this.validateActionGraph(bodyAction, visitedActions, getParameter, getAction);
      });
    } else if (action instanceof PerformActionUsage) {
      // 実行対象のアクションを検証
      const targetAction = getAction(action.target);
      if (!targetAction) {
        throw new Error(`実行対象アクション(id=${action.target})が見つかりません`);
      }
      this.validateActionGraph(targetAction, visitedActions, getParameter, getAction);
    }
  }
  
  /**
   * 後続関係を検証する
   * @param action 検証対象のアクション
   * @param getAction アクションを取得するための関数
   * @throws Error 制約違反がある場合
   */
  private static validateSuccessions(
    action: ActionUsage,
    getAction: (id: string) => ActionUsage | undefined
  ): void {
    // 各後続アクションの存在確認
    action.successions.forEach(successorId => {
      const successorAction = getAction(successorId);
      if (!successorAction) {
        throw new Error(`後続アクション(id=${successorId})が見つかりません`);
      }
    });
  }
  
  /**
   * パラメータを検証する
   * @param action 検証対象のアクション
   * @param getParameter パラメータを取得するための関数
   * @throws Error 制約違反がある場合
   */
  private static validateParameters(
    action: ActionUsage,
    getParameter: (id: string) => any
  ): void {
    // 参照されているパラメータの存在確認
    action.parameters.forEach(parameterId => {
      const parameter = getParameter(parameterId);
      if (!parameter) {
        throw new Error(`パラメータ(id=${parameterId})が見つかりません`);
      }
    });
    
    // パラメータ値の整合性確認
    action.parameterValues.forEach((value, parameterId) => {
      const parameter = getParameter(parameterId);
      if (!parameter) {
        throw new Error(`値が設定されているパラメータ(id=${parameterId})が見つかりません`);
      }
      
      // 型チェックなどの追加検証（必要に応じて実装）
    });
  }
  
  /**
   * 条件分岐アクションを検証する
   * @param ifAction 検証対象の条件分岐アクション
   * @param getParameter パラメータを取得するための関数
   * @param getAction アクションを取得するための関数
   * @throws Error 制約違反がある場合
   */
  private static validateIfAction(
    ifAction: IfActionUsage,
    getParameter: (id: string) => any,
    getAction: (id: string) => ActionUsage | undefined
  ): void {
    // 少なくとも1つの分岐が必要
    if (ifAction.branches.length === 0) {
      throw new Error('条件分岐アクションには少なくとも1つの分岐が必要です');
    }
    
    // else分岐は最大1つまで
    const elseBranches = ifAction.branches.filter(branch => branch.isElse);
    if (elseBranches.length > 1) {
      throw new Error('条件分岐アクションにelse分岐は最大1つまでです');
    }
    
    // 通常の分岐には条件が必要
    const normalBranches = ifAction.branches.filter(branch => !branch.isElse);
    normalBranches.forEach(branch => {
      if (!branch.condition) {
        throw new Error(`分岐(id=${branch.id})に条件が指定されていません`);
      }
    });
    
    // 各分岐内のアクションの存在確認
    ifAction.branches.forEach(branch => {
      branch.actions.forEach(actionId => {
        const action = getAction(actionId);
        if (!action) {
          throw new Error(`分岐(id=${branch.id})内のアクション(id=${actionId})が見つかりません`);
        }
      });
    });
  }
  
  /**
   * ループアクションを検証する
   * @param loopAction 検証対象のループアクション
   * @param getParameter パラメータを取得するための関数
   * @param getAction アクションを取得するための関数
   * @throws Error 制約違反がある場合
   */
  private static validateLoopAction(
    loopAction: LoopActionUsage,
    getParameter: (id: string) => any,
    getAction: (id: string) => ActionUsage | undefined
  ): void {
    // ループタイプの検証
    if (!['while', 'until', 'forEach'].includes(loopAction.loopType)) {
      throw new Error(`無効なループタイプ: ${loopAction.loopType}`);
    }
    
    // whileとuntilループには条件が必要
    if ((loopAction.loopType === 'while' || loopAction.loopType === 'until') && !loopAction.condition) {
      throw new Error(`${loopAction.loopType}ループには条件が必要です`);
    }
    
    // forEachループにはsetupParameterIdが必要
    if (loopAction.loopType === 'forEach' && !loopAction.setupParameterId) {
      throw new Error('forEachループにはsetupParameterIdが必要です');
    }
    
    // setupParameterIdの存在確認
    if (loopAction.setupParameterId) {
      const parameter = getParameter(loopAction.setupParameterId);
      if (!parameter) {
        throw new Error(`setupParameter(id=${loopAction.setupParameterId})が見つかりません`);
      }
    }
    
    // 本体アクションの存在確認
    if (loopAction.bodyActions.length === 0) {
      throw new Error('ループアクションには少なくとも1つの本体アクションが必要です');
    }
    
    loopAction.bodyActions.forEach(actionId => {
      const action = getAction(actionId);
      if (!action) {
        throw new Error(`ループ本体アクション(id=${actionId})が見つかりません`);
      }
    });
  }
  
  /**
   * 実行アクションを検証する
   * @param performAction 検証対象の実行アクション
   * @param getParameter パラメータを取得するための関数
   * @param getAction アクションを取得するための関数
   * @throws Error 制約違反がある場合
   */
  private static validatePerformAction(
    performAction: PerformActionUsage,
    getParameter: (id: string) => any,
    getAction: (id: string) => ActionUsage | undefined
  ): void {
    // 実行対象アクションの存在確認
    const targetAction = getAction(performAction.target);
    if (!targetAction) {
      throw new Error(`実行対象アクション(id=${performAction.target})が見つかりません`);
    }
    
    // パラメータマッピングの検証
    performAction.parameterMapping.forEach((sourceParamId, targetParamId) => {
      // 対象パラメータの存在確認
      const targetParam = getParameter(targetParamId);
      if (!targetParam) {
        throw new Error(`対象パラメータ(id=${targetParamId})が見つかりません`);
      }
      
      // ソースパラメータの存在確認
      const sourceParam = getParameter(sourceParamId);
      if (!sourceParam) {
        throw new Error(`ソースパラメータ(id=${sourceParamId})が見つかりません`);
      }
      
      // パラメータの型互換性検証（必要に応じて実装）
    });
  }
}