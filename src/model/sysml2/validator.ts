/**
 * SysML v2 バリデータユーティリティ
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.6-§7.27 に基づく制約チェック
 */

import { Definition } from './Definition';
import { Usage } from './Usage';
import { PartDefinition } from './PartDefinition';
import { PartUsage } from './PartUsage';
import { PortDefinition } from './PortDefinition';
import { InterfaceDefinition } from './InterfaceDefinition';
import { ConnectionDefinition } from './ConnectionDefinition';

/**
 * バリデーションエラー
 * SysML v2の制約違反を表す例外
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * 名前必須チェック
 * Definition要素は必ずnameを持つ必要がある
 * @param element 検証対象要素
 * @throws ValidationError 制約違反がある場合
 */
export function validateNameRequired(element: any): void {
  if (!element.name || element.name.trim() === '') {
    throw new ValidationError(`${element.constructor?.name || 'Element'} (id=${element.id})は名前が必須です`);
  }
}

/**
 * 多重度（multiplicity）の範囲チェック
 * @param multiplicity 多重度文字列 (例: "1", "0..1", "1..*", "*")
 * @throws ValidationError 制約違反がある場合
 */
export function validateMultiplicity(multiplicity: string): void {
  if (!multiplicity) return; // 指定なしは許容

  // "*" は有効な多重度
  if (multiplicity === '*') return;

  // 範囲指定 (例: "0..1", "1..*")
  if (multiplicity.includes('..')) {
    const [lowerStr, upperStr] = multiplicity.split('..');
    
    // 下限値チェック
    const lowerBound = parseInt(lowerStr, 10);
    if (isNaN(lowerBound) || lowerBound < 0) {
      throw new ValidationError(`多重度(${multiplicity})の下限値は0以上の整数である必要があります`);
    }
    
    // 上限値チェック
    if (upperStr === '*') {
      // "N..*"形式は有効
      return;
    } else {
      const upperBound = parseInt(upperStr, 10);
      if (isNaN(upperBound) || upperBound < 1) {
        throw new ValidationError(`多重度(${multiplicity})の上限値は1以上の整数または'*'である必要があります`);
      }
      
      // 下限≤上限のチェック
      if (lowerBound > upperBound) {
        throw new ValidationError(`多重度(${multiplicity})の下限値(${lowerBound})が上限値(${upperBound})を超えています`);
      }
    }
  } else {
    // 単一値 (例: "1")
    const value = parseInt(multiplicity, 10);
    if (isNaN(value) || value < 0) {
      throw new ValidationError(`多重度(${multiplicity})は0以上の整数である必要があります`);
    }
  }
}

/**
 * 循環特化（specialization cyclic reference）のチェック
 * @param element 検証対象要素
 * @param visitedIds 訪問済みID配列（再帰呼出し用）
 * @throws ValidationError 制約違反がある場合
 */
export function validateNoCyclicSpecialization(element: any, visitedIds: string[] = []): void {
  if (!element.specializationIds || element.specializationIds.length === 0) {
    return; // 特化がない場合はOK
  }
  
  // 自己参照チェック（直接的な循環）
  if (element.specializationIds.includes(element.id)) {
    throw new ValidationError(`${element.constructor?.name || 'Element'} (id=${element.id}, name=${element.name})が自身を特化(specialization)しています`);
  }
  
  // 循環参照チェック（間接的な循環）
  const newVisited = [...visitedIds, element.id];
  for (const specId of element.specializationIds) {
    if (visitedIds.includes(specId)) {
      throw new ValidationError(`循環特化が検出されました: ${visitedIds.join(' -> ')} -> ${specId}`);
    }
    
    // 注: 実際の実装では特化先の要素を取得して再帰的にチェックする必要があります
    // 今回のコード例では省略しています
  }
}

/**
 * Usage の対応付けチェック
 * Usage は必ず対応する Definition を参照する必要がある
 * @param usage 検証対象のUsage
 * @throws ValidationError 制約違反がある場合
 */
export function validateUsageDefinitionReference(usage: any): void {
  // 抽象要素でない場合は定義参照が必要
  if (!usage.isAbstract && !usage.definitionId) {
    throw new ValidationError(`${usage.constructor?.name || 'Usage'} (id=${usage.id}, name=${usage.name})にDefinitionが関連付けられていません`);
  }
}

/**
 * ネスト制約チェック
 * 特定の要素の中には特定の種類の要素しか含められない
 * @param portDef 検証対象のPortDefinition
 * @param allowedFeatureTypes 許可された特性の型名配列
 * @throws ValidationError 制約違反がある場合
 */
export function validatePortDefinitionContent(portDef: any, allowedFeatureTypes: string[] = ['AttributeDefinition', 'Feature']): void {
  // 注: 実際の実装では、portDef.ownedFeaturesから各要素を取得して型を確認する必要があります
  // 今回は簡略化のため省略
  if (!portDef.ownedFeatures) {
    return; // 所有特性がない場合はチェック不要
  }
}

/**
 * SysML v2 定義（Definition）要素の基本的な制約をチェック
 * @param definition 検証対象のDefinition要素
 * @throws ValidationError 制約違反がある場合
 */
export function validateSysMLDefinition(definition: any): void {
  // 名前必須チェック
  validateNameRequired(definition);
  
  // 循環特化チェック
  validateNoCyclicSpecialization(definition);
  
  // 抽象要素に対するUsage参照チェック
  if (definition.isAbstract && definition.usageReferences && definition.usageReferences.length > 0) {
    throw new ValidationError(`抽象Definition(id=${definition.id}, name=${definition.name})に直接Usageが関連付けられています`);
  }
}

/**
 * SysML v2 使用（Usage）要素の基本的な制約をチェック
 * @param usage 検証対象のUsage要素
 * @throws ValidationError 制約違反がある場合
 */
export function validateSysMLUsage(usage: any): void {
  // 循環特化チェック
  validateNoCyclicSpecialization(usage);
  
  // 対応するDefinitionの参照チェック
  validateUsageDefinitionReference(usage);
}

/**
 * PartDefinitionの固有制約をチェック
 * @param partDef 検証対象のPartDefinition
 * @throws ValidationError 制約違反がある場合
 */
export function validatePartDefinition(partDef: any): void {
  // まず基本的な制約チェック
  validateSysMLDefinition(partDef);
  
  // PartDefinition固有のチェック
  // 名前が必要
  if (!partDef.name || partDef.name.trim() === '') {
    throw new ValidationError(`PartDefinition (id=${partDef.id})に名前が必要です`);
  }
  
  // ポートの存在チェック（もしポートが無いと不正な場合）
  // 注：実際の仕様に応じて調整
  // if (partDef.ports.length === 0) {
  //   throw new ValidationError(`PartDefinition(id=${partDef.id}, name=${partDef.name})は少なくとも1つのポートを持つ必要があります`);
  // }
}

/**
 * PartUsageの固有制約をチェック
 * @param partUsage 検証対象のPartUsage
 * @throws ValidationError 制約違反がある場合
 */
export function validatePartUsage(partUsage: any): void {
  // まず基本的な制約チェック
  validateSysMLUsage(partUsage);
  
  // PartUsage固有のチェック
  if (!partUsage.isAbstract && !partUsage.partDefinitionId) {
    throw new ValidationError(`PartUsage(id=${partUsage.id}, name=${partUsage.name})にPartDefinitionが関連付けられていません`);
  }
}

/**
 * InterfaceDefinitionの固有制約をチェック
 * @param interfaceDef 検証対象のInterfaceDefinition
 * @throws ValidationError 制約違反がある場合
 */
export function validateInterfaceDefinition(interfaceDef: any): void {
  // まず基本的な制約チェック
  validateSysMLDefinition(interfaceDef);
  
  // InterfaceDefinition固有のチェック
  // (例: エンドポイントの存在チェックなど)
  if (interfaceDef.endFeatures.length === 0) {
    throw new ValidationError(`InterfaceDefinition(id=${interfaceDef.id}, name=${interfaceDef.name})はendFeaturesを少なくとも1つ持つ必要があります`);
  }
}

/**
 * ConnectionDefinitionの固有制約をチェック
 * @param connectionDef 検証対象のConnectionDefinition
 * @throws ValidationError 制約違反がある場合
 */
export function validateConnectionDefinition(connectionDef: any): void {
  // まず基本的な制約チェック
  validateSysMLDefinition(connectionDef);
  
  // ConnectionDefinition固有のチェック
  if (connectionDef.endFeatures.length < 2) {
    throw new ValidationError(`ConnectionDefinition(id=${connectionDef.id}, name=${connectionDef.name})はendFeaturesを少なくとも2つ持つ必要があります`);
  }
}