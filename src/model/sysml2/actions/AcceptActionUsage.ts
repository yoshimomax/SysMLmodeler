/**
 * SysML v2 AcceptActionUsage クラス
 * 受信アクションの使用を表す
 * OMG SysML v2 Beta3 Part1 §7.17準拠
 */

import { v4 as uuid } from 'uuid';
import { ActionUsage, ActionUsageParams } from '../ActionUsage';
import { SysML2_ActionUsage } from '../interfaces';
import { ValidationError } from '../validator';

/**
 * AcceptActionUsage コンストラクタパラメータ
 */
export interface AcceptActionUsageParams extends ActionUsageParams {
  payloadType?: string;      // 受信するペイロードの型
  receiver?: string;         // 受信者のID
  sender?: string;           // 送信者のID（フィルタリング用）
  protocol?: string;         // 使用するプロトコル
  isTriggered?: boolean;     // トリガーとして機能するか
  timeout?: number;          // タイムアウト時間（ミリ秒）
}

/**
 * AcceptActionUsage クラス
 * メッセージや信号を受信するアクション
 */
export class AcceptActionUsage extends ActionUsage {
  /** クラス識別子 */
  __type: 'AcceptActionUsage' = 'AcceptActionUsage';

  /** 受信するペイロードの型 */
  payloadType?: string;
  
  /** 受信者のID */
  receiver?: string;
  
  /** 送信者のID（フィルタリング用） */
  sender?: string;
  
  /** 使用するプロトコル */
  protocol?: string;
  
  /** トリガーとして機能するか */
  isTriggered: boolean = false;
  
  /** タイムアウト時間（ミリ秒） */
  timeout?: number;

  /**
   * AcceptActionUsage コンストラクタ
   * @param params AcceptActionUsageのプロパティ
   */
  constructor(params: AcceptActionUsageParams = {}) {
    super(params);
    
    this.payloadType = params.payloadType;
    this.receiver = params.receiver;
    this.sender = params.sender;
    this.protocol = params.protocol;
    if (params.isTriggered !== undefined) this.isTriggered = params.isTriggered;
    this.timeout = params.timeout;
  }

  /**
   * アクションの検証
   * @throws ValidationError 検証エラー
   */
  validate(): void {
    super.validate();
    
    // ペイロード型の存在確認
    if (!this.payloadType) {
      throw new ValidationError(`AcceptActionUsage (id=${this.id}, name=${this.name})は` +
        `payloadType属性を持つ必要があります`);
    }
    
    // 受信者の存在確認
    if (!this.receiver) {
      throw new ValidationError(`AcceptActionUsage (id=${this.id}, name=${this.name})は` +
        `receiver属性を持つ必要があります`);
    }
    
    // タイムアウトが指定されている場合は正の数であることを確認
    if (this.timeout !== undefined && this.timeout <= 0) {
      throw new ValidationError(`AcceptActionUsage (id=${this.id}, name=${this.name})の` +
        `timeout属性は正の数でなければなりません`);
    }
  }

  /**
   * JSON形式に変換
   * @returns JSONオブジェクト
   */
  toJSON(): SysML2_ActionUsage & { 
    payloadType?: string;
    receiver?: string;
    sender?: string;
    protocol?: string;
    isTriggered: boolean;
    timeout?: number;
  } {
    return {
      ...super.toJSON(),
      __type: this.__type,
      payloadType: this.payloadType,
      receiver: this.receiver,
      sender: this.sender,
      protocol: this.protocol,
      isTriggered: this.isTriggered,
      timeout: this.timeout
    };
  }

  /**
   * JSONからAcceptActionUsageを復元
   * @param json JSONオブジェクト
   * @returns 復元されたAcceptActionUsage
   */
  static fromJSON(json: ReturnType<AcceptActionUsage['toJSON']>): AcceptActionUsage {
    const actionUsage = new AcceptActionUsage({
      id: json.id,
      name: json.name,
      description: json.description,
      actionDefinition: json.actionDefinition,
      isReference: json.isReference,
      guard: json.guard,
      payloadType: json.payloadType,
      receiver: json.receiver,
      sender: json.sender,
      protocol: json.protocol,
      isTriggered: json.isTriggered,
      timeout: json.timeout
    });
    
    if (json.parameters) actionUsage.parameters = [...json.parameters];
    if (json.bodies) actionUsage.bodies = [...json.bodies];
    if (json.successions) actionUsage.successions = [...json.successions];
    if (json.preconditions) actionUsage.preconditions = [...json.preconditions];
    if (json.postconditions) actionUsage.postconditions = [...json.postconditions];

    return actionUsage;
  }
}