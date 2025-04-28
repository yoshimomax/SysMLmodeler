/**
 * SysML v2 PortUsage クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §9.7に準拠
 * 
 * PortUsageは、システム間の相互作用ポイントとして機能する特性を表現するクラスです。
 * データ、シグナル、物理的相互作用などの流れを可能にします。
 */

import { v4 as uuid } from 'uuid';
import { Feature } from '../kerml/Feature';
import { FeatureObject } from '../kerml/Feature';
import { SysML2_PortUsage } from './interfaces';

export class PortUsage extends Feature {
  /** UI上の位置情報（オプション） */
  position?: { x: number; y: number };
  
  /** 参照するポート定義のID */
  definitionId?: string;
  
  /** ポートの方向 (in, out, inout) */
  direction?: 'in' | 'out' | 'inout';
  
  /** ポートが共役かどうか（互換ポートとの結合用） */
  isConjugated: boolean = false;
  
  /** フロー仕様のID配列 */
  flowSpecifications?: string[];
  
  /** インターフェースのID配列 */
  interfaces?: string[];
  
  /**
   * PortUsage コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    ownerId?: string;
    description?: string;
    typeId?: string;
    definitionId?: string;
    direction?: 'in' | 'out' | 'inout';
    isAbstract?: boolean;
    isConjugated?: boolean;
    position?: { x: number; y: number };
    flowSpecifications?: string[];
    interfaces?: string[];
  } = {}) {
    super({
      id: options.id,
      name: options.name,
      ownerId: options.ownerId,
      description: options.description,
      typeId: options.typeId,
      direction: options.direction,
      isAbstract: options.isAbstract
    });
    
    this.position = options.position;
    this.definitionId = options.definitionId;
    this.direction = options.direction;
    this.isConjugated = options.isConjugated || false;
    this.flowSpecifications = options.flowSpecifications;
    this.interfaces = options.interfaces;
  }
  
  /**
   * ポート位置を設定する
   * @param x X座標
   * @param y Y座標
   */
  setPosition(x: number, y: number): void {
    this.position = { x, y };
  }
  
  /**
   * ポート定義を設定する
   * @param definitionId ポート定義のID
   */
  setDefinition(definitionId: string): void {
    this.definitionId = definitionId;
  }
  
  /**
   * フロー仕様を追加する
   * @param flowSpecId 追加するフロー仕様のID
   */
  addFlowSpecification(flowSpecId: string): void {
    if (!this.flowSpecifications) {
      this.flowSpecifications = [];
    }
    if (!this.flowSpecifications.includes(flowSpecId)) {
      this.flowSpecifications.push(flowSpecId);
    }
  }
  
  /**
   * インターフェースを追加する
   * @param interfaceId 追加するインターフェースのID
   */
  addInterface(interfaceId: string): void {
    if (!this.interfaces) {
      this.interfaces = [];
    }
    if (!this.interfaces.includes(interfaceId)) {
      this.interfaces.push(interfaceId);
    }
  }
  
  /**
   * ポートの情報をオブジェクトとして返す
   * @returns FeatureObject 構造
   */
  override toObject(): FeatureObject {
    const baseObject = super.toObject();
    return {
      ...baseObject,
      type: 'PortUsage',
      properties: {
        ...baseObject.properties,
        position: this.position,
        definitionId: this.definitionId,
        direction: this.direction,
        isConjugated: this.isConjugated,
        flowSpecifications: this.flowSpecifications,
        interfaces: this.interfaces
      }
    };
  }
  
  /**
   * JSONシリアライズ用のメソッド
   * @returns JSON形式のオブジェクト
   */
  override toJSON(): SysML2_PortUsage {
    return {
      ...super.toJSON(),
      __type: 'PortUsage',
      portDefinition: this.definitionId,
      direction: this.direction,
      isConjugated: this.isConjugated,
      flowSpecifications: this.flowSpecifications,
      interfaces: this.interfaces,
      position: this.position
    };
  }
  
  /**
   * JSONデータからPortUsageインスタンスを作成する
   * @param json JSON形式のデータ
   * @returns 新しいPortUsageインスタンス
   */
  static fromJSON(json: SysML2_PortUsage): PortUsage {
    if (!json || typeof json !== 'object') {
      throw new Error('有効なJSONオブジェクトではありません');
    }
    
    // PortUsageインスタンスを作成
    const portUsage = new PortUsage({
      id: json.id || uuid(),
      name: json.name,
      ownerId: json.ownerId,
      description: json.description,
      typeId: json.type,
      definitionId: json.portDefinition, // portDefinitionフィールドを使用
      direction: json.direction,
      isAbstract: json.isAbstract,
      isConjugated: json.isConjugated,
      position: json.position,
      flowSpecifications: json.flowSpecifications,
      interfaces: json.interfaces
    });
    
    return portUsage;
  }
  
  /**
   * このポート使用の共役をコピーとして作成する
   * @returns 共役ポート使用インスタンス
   */
  createConjugate(): PortUsage {
    // 方向を反転
    let conjugateDirection: 'in' | 'out' | 'inout' | undefined = this.direction;
    if (this.direction === 'in') {
      conjugateDirection = 'out';
    } else if (this.direction === 'out') {
      conjugateDirection = 'in';
    }
    
    return new PortUsage({
      name: `${this.name}_conjugate`,
      description: `${this.name}の共役ポート`,
      definitionId: this.definitionId,
      direction: conjugateDirection,
      isConjugated: true,
      flowSpecifications: this.flowSpecifications ? [...this.flowSpecifications] : undefined,
      interfaces: this.interfaces ? [...this.interfaces] : undefined
    });
  }
}