/**
 * SysML v2 SendActionUsage クラス
 * 送信アクションの使用を表す
 * OMG SysML v2 Beta3 Part1 §7.17準拠
 */

import { v4 as uuid } from 'uuid';
import { ActionUsage, ActionUsageParams } from '../ActionUsage';
import { SysML2_ActionUsage } from '../interfaces';
import { ValidationError } from '../validator';

/**
 * SendActionUsage コンストラクタパラメータ
 */
export interface SendActionUsageParams extends ActionUsageParams {
  payload?: string;     // 送信するペイロードのID
  receiver?: string;    // 受信者のID
  sender?: string;      // 送信者のID
  protocol?: string;    // 使用するプロトコル
}

/**
 * SendActionUsage クラス
 * メッセージや信号を送信するアクション
 */
export class SendActionUsage extends ActionUsage {
  /** クラス識別子 */
  __type: 'SendActionUsage' = 'SendActionUsage';

  /** 送信するペイロードのID */
  payload?: string;
  
  /** 受信者のID */
  receiver?: string;
  
  /** 送信者のID */
  sender?: string;
  
  /** 使用するプロトコル */
  protocol?: string;

  /**
   * SendActionUsage コンストラクタ
   * @param params SendActionUsageのプロパティ
   */
  constructor(params: SendActionUsageParams = {}) {
    super(params);
    
    this.payload = params.payload;
    this.receiver = params.receiver;
    this.sender = params.sender;
    this.protocol = params.protocol;
  }

  /**
   * アクションの検証
   * @throws ValidationError 検証エラー
   */
  validate(): void {
    super.validate();
    
    // ペイロードの存在確認
    if (!this.payload) {
      throw new ValidationError(`SendActionUsage (id=${this.id}, name=${this.name})は` +
        `payload属性を持つ必要があります`);
    }
    
    // 受信者の存在確認
    if (!this.receiver) {
      throw new ValidationError(`SendActionUsage (id=${this.id}, name=${this.name})は` +
        `receiver属性を持つ必要があります`);
    }
  }

  /**
   * JSON形式に変換
   * @returns JSONオブジェクト
   */
  toJSON(): SysML2_ActionUsage & { 
    payload?: string;
    receiver?: string;
    sender?: string;
    protocol?: string;
  } {
    return {
      ...super.toJSON(),
      __type: this.__type,
      payload: this.payload,
      receiver: this.receiver,
      sender: this.sender,
      protocol: this.protocol
    };
  }

  /**
   * JSONからSendActionUsageを復元
   * @param json JSONオブジェクト
   * @returns 復元されたSendActionUsage
   */
  static fromJSON(json: ReturnType<SendActionUsage['toJSON']>): SendActionUsage {
    const actionUsage = new SendActionUsage({
      id: json.id,
      name: json.name,
      description: json.description,
      actionDefinition: json.actionDefinition,
      isReference: json.isReference,
      guard: json.guard,
      payload: json.payload,
      receiver: json.receiver,
      sender: json.sender,
      protocol: json.protocol
    });
    
    if (json.parameters) actionUsage.parameters = [...json.parameters];
    if (json.bodies) actionUsage.bodies = [...json.bodies];
    if (json.successions) actionUsage.successions = [...json.successions];
    if (json.preconditions) actionUsage.preconditions = [...json.preconditions];
    if (json.postconditions) actionUsage.postconditions = [...json.postconditions];

    return actionUsage;
  }
}