/**
 * SysML v2 バリデータ関数群
 * SysML v2要素の制約をチェックする関数を提供します
 */

import { Definition } from './Definition';
import { Usage } from './Usage';
import { validateRelationshipIds } from '../kerml/validators';

/**
 * バリデーションエラーを表現するクラス
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * SysML v2 Definition要素の基本的な制約をチェック
 * @param definition 検証するDefinition要素
 * @throws ValidationError 制約違反がある場合
 */
export function validateSysMLDefinition(definition: Definition): void {
  // Definition固有の制約をチェック
  if (!definition.name) {
    throw new ValidationError(`SysML Definition (${definition.id}): 名前は必須です`);
  }
  
  // バリエーション制約をチェック
  if (definition.isVariation) {
    // バリエーションの特殊制約をチェック
    // 例: バリエーションは特定のコンテキストでのみ有効、など
  }
}

/**
 * SysML v2 Usage要素の基本的な制約をチェック
 * @param usage 検証するUsage要素
 * @throws ValidationError 制約違反がある場合
 */
export function validateSysMLUsage(usage: Usage): void {
  // Usage固有の制約をチェック
  if (!usage.name) {
    throw new ValidationError(`SysML Usage (${usage.id}): 名前は必須です`);
  }
  
  // 定義参照の存在チェック
  if (usage.definitionId) {
    // 定義IDが実際に存在する定義を参照しているか
    // 注意: 実際のモデルストアアクセスは実装依存
  }
  
  // ネストされた使用の循環参照チェック
  // 循環依存性を検出する（実際のチェックはモデルストアアクセスに依存）
}

/**
 * SysML v2 インターフェース定義の制約をチェック
 * @param interfaceDef 検証するインターフェース定義
 * @throws ValidationError 制約違反がある場合
 */
export function validateInterfaceDefinition(interfaceDef: any): void {
  // 基本的な定義要素の制約をチェック
  validateSysMLDefinition(interfaceDef);
  
  // インターフェース固有の制約をチェック
  if (interfaceDef.direction && !['in', 'out', 'inout'].includes(interfaceDef.direction)) {
    throw new ValidationError(`SysML InterfaceDefinition (${interfaceDef.id}): 無効な方向指定です: ${interfaceDef.direction}`);
  }
}

/**
 * SysML v2 パート定義の制約をチェック
 * @param partDef 検証するパート定義
 * @throws ValidationError 制約違反がある場合
 */
export function validatePartDefinition(partDef: any): void {
  // 基本的な定義要素の制約をチェック
  validateSysMLDefinition(partDef);
  
  // パート固有の制約をチェック
  // 例: 接続ポートの要件など
}

/**
 * SysML v2 ポート定義の制約をチェック
 * @param portDef 検証するポート定義
 * @throws ValidationError 制約違反がある場合
 */
export function validatePortDefinition(portDef: any): void {
  // 基本的な定義要素の制約をチェック
  validateSysMLDefinition(portDef);
  
  // ポート固有の制約をチェック
  if (portDef.direction && !['in', 'out', 'inout'].includes(portDef.direction)) {
    throw new ValidationError(`SysML PortDefinition (${portDef.id}): 無効な方向指定です: ${portDef.direction}`);
  }
}

/**
 * SysML v2 接続定義の制約をチェック
 * @param connectionDef 検証する接続定義
 * @throws ValidationError 制約違反がある場合
 */
export function validateConnectionDefinition(connectionDef: any): void {
  // 基本的な定義要素の制約をチェック
  validateSysMLDefinition(connectionDef);
  
  // 接続定義固有の制約をチェック
  // 例: エンドポイントの互換性など
}

/**
 * SysML v2 接続使用の制約をチェック
 * @param connectionUsage 検証する接続使用
 * @throws ValidationError 制約違反がある場合
 */
export function validateConnectionUsage(connectionUsage: any): void {
  // 基本的な使用要素の制約をチェック
  validateSysMLUsage(connectionUsage);
  
  // 接続使用固有の制約をチェック
  if (connectionUsage.sourcePortId && connectionUsage.targetPortId) {
    // 自己参照でないことを確認
    validateRelationshipIds('ConnectionUsage', 
      connectionUsage.sourcePortId, 
      connectionUsage.targetPortId
    );
  }
}

/**
 * SysML v2 インターフェース使用の制約をチェック
 * @param interfaceUsage 検証するインターフェース使用
 * @throws ValidationError 制約違反がある場合
 */
export function validateInterfaceUsage(interfaceUsage: any): void {
  // 基本的な使用要素の制約をチェック
  validateSysMLUsage(interfaceUsage);
  
  // インターフェース使用固有の制約をチェック
  if (interfaceUsage.direction && !['in', 'out', 'inout'].includes(interfaceUsage.direction)) {
    throw new ValidationError(`SysML InterfaceUsage (${interfaceUsage.id}): 無効な方向指定です: ${interfaceUsage.direction}`);
  }
}