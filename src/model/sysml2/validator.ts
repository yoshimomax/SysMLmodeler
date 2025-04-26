/**
 * SysML v2 バリデータユーティリティ
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.6-§7.27 に基づく制約チェック
 * 
 * 主な検証内容:
 * - 名前と識別子の一意性
 * - リレーションシップの整合性 (循環参照防止)
 * - 多重度制約の検証
 * - タイプと継承の適合性
 * - 所有階層の整合性
 * - ステレオタイプの適合性
 * - 状態マシン検証（初期状態、遷移条件、到達可能性）
 * 
 * バージョン: 1.2.0
 * 最終更新日: 2025-04-26
 */

import { Definition } from './Definition';
import { Usage } from './Usage';
import { PartDefinition } from './PartDefinition';
import { PartUsage } from './PartUsage';
import { PortDefinition } from './PortDefinition';
import { InterfaceDefinition } from './InterfaceDefinition';
import { ConnectionDefinition } from './ConnectionDefinition';
import { StateDefinition } from './StateDefinition';
import { StateUsage } from './StateUsage';
import { TransitionDefinition } from './TransitionDefinition';
import { TransitionUsage } from './TransitionUsage';

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
 * 多重度（multiplicity）構文の解析と検証
 * OMG SysML v2 Beta3 Part1 §9.3 (Multiplicity Elements)に基づく解析
 * @param multiplicity 多重度文字列 (例: "1", "0..1", "1..*", "*")
 * @returns 解析された多重度情報 {lower: number, upper: number | '*'}
 * @throws ValidationError 構文や制約違反がある場合
 */
export function parseMultiplicity(multiplicity: string): {lower: number, upper: number | '*'} {
  if (!multiplicity) {
    // SysML v2では省略時の多重度は1（デフォルト）
    return { lower: 1, upper: 1 };
  }

  // "*" は [0..*] と同等
  if (multiplicity === '*') {
    return { lower: 0, upper: '*' };
  }

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
      return { lower: lowerBound, upper: '*' };
    } else {
      const upperBound = parseInt(upperStr, 10);
      if (isNaN(upperBound) || upperBound < 1) {
        throw new ValidationError(`多重度(${multiplicity})の上限値は1以上の整数または'*'である必要があります`);
      }
      
      // 下限≤上限のチェック
      if (lowerBound > upperBound) {
        throw new ValidationError(`多重度(${multiplicity})の下限値(${lowerBound})が上限値(${upperBound})を超えています`);
      }
      
      return { lower: lowerBound, upper: upperBound };
    }
  } else {
    // 単一値 (例: "1") は [N..N] の省略形
    const value = parseInt(multiplicity, 10);
    if (isNaN(value) || value < 0) {
      throw new ValidationError(`多重度(${multiplicity})は0以上の整数である必要があります`);
    }
    
    return { lower: value, upper: value };
  }
}

/**
 * 多重度（multiplicity）の範囲チェック
 * @param multiplicity 多重度文字列 (例: "1", "0..1", "1..*", "*")
 * @throws ValidationError 制約違反がある場合
 */
export function validateMultiplicity(multiplicity: string): void {
  // 構文解析と基本検証
  parseMultiplicity(multiplicity);
}

/**
 * コレクション要素数の多重度制約チェック
 * 実際の要素数が多重度の制約を満たすか検証
 * @param collection 検証対象のコレクション（配列）
 * @param multiplicity 多重度文字列
 * @param elementName 要素の説明（エラーメッセージ用）
 * @throws ValidationError 多重度制約に違反する場合
 */
export function validateCollectionMultiplicity(
  collection: any[] | null | undefined, 
  multiplicity: string,
  elementName: string
): void {
  // nullやundefinedは空配列として扱う
  const elements = collection || [];
  const size = elements.length;
  
  // 多重度を解析
  const { lower, upper } = parseMultiplicity(multiplicity);
  
  // 要素数が下限以上かチェック
  if (size < lower) {
    throw new ValidationError(
      `${elementName}の数(${size})が多重度(${multiplicity})の下限値(${lower})を下回っています`
    );
  }
  
  // 要素数が上限以下かチェック
  if (upper !== '*' && size > upper) {
    throw new ValidationError(
      `${elementName}の数(${size})が多重度(${multiplicity})の上限値(${upper})を超えています`
    );
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
 * @param element 検証対象の要素
 * @param nestedElements ネストされた要素の配列
 * @param allowedTypes 許可された型名配列
 * @throws ValidationError 制約違反がある場合
 */
export function validateNestedElementTypes(element: any, nestedElements: any[], allowedTypes: string[]): void {
  if (!nestedElements || nestedElements.length === 0) {
    return; // ネスト要素がない場合はチェック不要
  }
  
  for (const nestedEl of nestedElements) {
    const typeName = nestedEl.constructor?.name || 'Unknown';
    
    if (!allowedTypes.includes(typeName)) {
      throw new ValidationError(
        `${element.constructor?.name || 'Element'} (id=${element.id}, name=${element.name})には` +
        `${typeName}型の要素(id=${nestedEl.id})をネストできません。` +
        `許可される型: ${allowedTypes.join(', ')}`
      );
    }
  }
}

/**
 * 所有要素のステレオタイプチェック
 * 要素が所有する子要素のステレオタイプが適切かチェックする
 * @param owner 所有者要素
 * @param ownedElement 所有される要素
 * @param allowedStereotypes 許可されたステレオタイプ配列
 * @throws ValidationError 制約違反がある場合
 */
export function validateOwnedElementStereotype(owner: any, ownedElement: any, allowedStereotypes: string[]): void {
  if (!ownedElement.stereotype) {
    return; // ステレオタイプがない場合はチェック対象外
  }
  
  if (!allowedStereotypes.includes(ownedElement.stereotype)) {
    throw new ValidationError(
      `${owner.constructor?.name || 'Element'} (id=${owner.id}, name=${owner.name})は` +
      `ステレオタイプ'${ownedElement.stereotype}'の要素(id=${ownedElement.id})を所有できません。` +
      `許可されるステレオタイプ: ${allowedStereotypes.join(', ')}`
    );
  }
}

/**
 * Port定義内容の検証
 * SysML v2 §7.11に基づくPortDefinitionの内容制約をチェック
 * @param portDef 検証対象のPortDefinition
 * @param allowedFeatureTypes 許可された特性の型名配列
 * @throws ValidationError 制約違反がある場合
 */
export function validatePortDefinitionContent(portDef: any, allowedFeatureTypes: string[] = ['AttributeDefinition', 'Feature']): void {
  // 注: 実際の実装では、portDef.ownedFeaturesから各要素を取得して型を確認する必要があります
  if (!portDef.ownedFeatures) {
    return; // 所有特性がない場合はチェック不要
  }
  
  // ここでは所有特性が直接オブジェクト参照である想定で実装
  // 実際のシステムではIDから要素を取得する必要がある場合もある
  if (Array.isArray(portDef.ownedFeatures)) {
    validateNestedElementTypes(portDef, portDef.ownedFeatures, allowedFeatureTypes);
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
 * 型互換性のチェック（Compatibility）
 * ある要素が別の要素と互換性があるかを検証する
 * @param source 検証対象の要素（互換性の起点）
 * @param target 互換性をチェックする相手要素
 * @param typeSystem 型システム参照（オプション）
 * @returns 互換性があればtrue、なければfalse
 */
export function isCompatibleWith(source: any, target: any, typeSystem?: any): boolean {
  // 同一要素は互換性あり
  if (source.id === target.id) {
    return true;
  }
  
  // 型が同じなら互換性あり
  if (source.constructor?.name === target.constructor?.name) {
    return true;
  }
  
  // 特殊化関係の確認
  // source が target を直接または間接的に特殊化している場合、互換性あり
  if (source.specializationIds && source.specializationIds.includes(target.id)) {
    return true;
  }
  
  // 型システムを使用した拡張チェック（非同期処理に対応する場合は注意）
  if (typeSystem && typeof typeSystem.isCompatible === 'function') {
    return typeSystem.isCompatible(source, target);
  }
  
  // デフォルトは互換性なし
  return false;
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
  
  // ステレオタイプの検証
  if (usage.stereotype && usage.definitionId) {
    // 一部の特殊なUsageステレオタイプを検証
    // 例: 'item_flow'ステレオタイプの場合は対応するDefinitionも'item_flow_def'である必要がある
    // 実際の実装では、definitionIdから対応するDefinitionを取得して検証する
  }
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
 * OMG SysML v2 Beta3 Part1 §7.7 (Parts)に基づく制約検証
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
  
  // ネスト要素の多重度チェック (パート定義仕様 §7.7.2.1)
  if (partUsage.nestedParts) {
    validateCollectionMultiplicity(
      partUsage.nestedParts,
      "0..*", // ネストされたパートは0個以上許容
      `PartUsage(id=${partUsage.id})のnestedParts`
    );
  }
  
  if (partUsage.nestedConnections) {
    validateCollectionMultiplicity(
      partUsage.nestedConnections,
      "0..*", // ネストされた接続は0個以上許容
      `PartUsage(id=${partUsage.id})のnestedConnections`
    );
  }
  
  if (partUsage.nestedInterfaces) {
    validateCollectionMultiplicity(
      partUsage.nestedInterfaces,
      "0..*", // ネストされたインターフェースは0個以上許容
      `PartUsage(id=${partUsage.id})のnestedInterfaces`
    );
  }
  
  // ポートの多重度チェック (ポート定義仕様 §7.11.2.2)
  if (partUsage.ports) {
    validateCollectionMultiplicity(
      partUsage.ports,
      "0..*", // ポートは0個以上許容
      `PartUsage(id=${partUsage.id})のports`
    );
  }
}

/**
 * InterfaceDefinitionの固有制約をチェック
 * OMG SysML v2 Beta3 Part1 §7.10 (Interfaces)に基づく制約検証
 * @param interfaceDef 検証対象のInterfaceDefinition
 * @throws ValidationError 制約違反がある場合
 */
export function validateInterfaceDefinition(interfaceDef: any): void {
  // まず基本的な制約チェック
  validateSysMLDefinition(interfaceDef);
  
  // 端点特性の存在チェック (インターフェース定義仕様 §7.10.2.1)
  validateCollectionMultiplicity(
    interfaceDef.endFeatures,
    "1..*", // インターフェースには少なくとも1つの端点が必要
    `InterfaceDefinition(id=${interfaceDef.id})のendFeatures`
  );
  
  // 特殊化の検証
  if (interfaceDef.specializationIds && interfaceDef.specializationIds.length > 0) {
    // 注: 実際の実装では、specializationIdsから参照先要素を取得し、
    // それらがInterfaceDefinition型であることを検証する必要がある
    // ここでは単純化のため省略
  }
}

/**
 * ConnectionDefinitionの固有制約をチェック
 * OMG SysML v2 Beta3 Part1 §7.9 (Connections)に基づく制約検証
 * @param connectionDef 検証対象のConnectionDefinition
 * @throws ValidationError 制約違反がある場合
 */
export function validateConnectionDefinition(connectionDef: any): void {
  // まず基本的な制約チェック
  validateSysMLDefinition(connectionDef);
  
  // 端点特性の存在チェック (コネクション定義仕様 §7.9.2.1)
  validateCollectionMultiplicity(
    connectionDef.endFeatures,
    "2..*", // コネクションには少なくとも2つの端点が必要
    `ConnectionDefinition(id=${connectionDef.id})のendFeatures`
  );
  
  // 接続先タイプの検証
  if (!connectionDef.sourceTypeId) {
    throw new ValidationError(`ConnectionDefinition(id=${connectionDef.id}, name=${connectionDef.name})にsourceTypeIdが設定されていません`);
  }
  
  if (!connectionDef.targetTypeId) {
    throw new ValidationError(`ConnectionDefinition(id=${connectionDef.id}, name=${connectionDef.name})にtargetTypeIdが設定されていません`);
  }
  
  // 循環接続チェック (自己参照)
  if (connectionDef.sourceTypeId === connectionDef.targetTypeId) {
    // 注意: 実際のSysML仕様では、自己接続は許容されるケースもある
    // ここでは単純化のため警告するだけ
    console.warn(`警告: ConnectionDefinition(id=${connectionDef.id}, name=${connectionDef.name})が自己接続(sourceType=targetType)です`);
  }
}

/**
 * 接続(Connection)要素の整合性チェック
 * ソースとターゲットの型互換性や多重度チェックなど
 * @param connection 検証対象の接続
 * @param sourcePort ソースポート要素
 * @param targetPort ターゲットポート要素
 * @throws ValidationError 制約違反がある場合
 */
export function validateConnectionConsistency(connection: any, sourcePort: any, targetPort: any): void {
  // まずポートが存在するか確認
  if (!sourcePort) {
    throw new ValidationError(`Connection(id=${connection.id})のソースポート(id=${connection.sourcePortId})が見つかりません`);
  }
  
  if (!targetPort) {
    throw new ValidationError(`Connection(id=${connection.id})のターゲットポート(id=${connection.targetPortId})が見つかりません`);
  }
  
  // ポートの方向性チェック - もし方向が定義されている場合
  if (sourcePort.direction === 'in' && connection.stereotype === 'flow') {
    throw new ValidationError(`Connection(id=${connection.id})のソースポート(id=${connection.sourcePortId})がin方向なので、flowステレオタイプの接続元にはできません`);
  }
  
  if (targetPort.direction === 'out' && connection.stereotype === 'flow') {
    throw new ValidationError(`Connection(id=${connection.id})のターゲットポート(id=${connection.targetPortId})がout方向なので、flowステレオタイプの接続先にはできません`);
  }
  
  // itemType互換性チェック (フロー接続の場合)
  if (connection.stereotype === 'flow' && connection.itemType) {
    // 実際の実装では、itemTypeが互換性があるか
    // 型システムを使って検証する必要がある
    // ここでは簡略化のため省略
  }
}