/**
 * SysML v2 仕様に関する参照情報とリソース
 * SysML v2 Language Specificationに関する情報提供
 */

/**
 * SysML v2の仕様バージョン情報
 */
export const SYSML_VERSION = {
  MAJOR: 2,
  MINOR: 0,
  RELEASE: 'Beta1',
  FULL: 'SysML v2.0 Beta1',
  OMG_SPEC: 'ptc/2022-05-01',
  RELEASE_DATE: '2022-05-01'
};

/**
 * SysML v2の主要コンセプト
 */
export enum SysMLConcept {
  PART_DEFINITION = 'PartDefinition',
  BLOCK_DEFINITION = 'BlockDefinition', 
  PORT_DEFINITION = 'PortDefinition',
  INTERFACE_DEFINITION = 'InterfaceDefinition',
  ATTRIBUTE_DEFINITION = 'AttributeDefinition',
  CONNECTION_DEFINITION = 'ConnectionDefinition',
  REQUIREMENT = 'Requirement',
  ACTION = 'Action',
  STATE = 'State',
  CONSTRAINT = 'Constraint',
  ITEM_FLOW = 'ItemFlow',
  PACKAGE = 'Package',
}

/**
 * SysML v2の要素間の関係タイプ
 */
export enum SysMLRelationshipType {
  DEFINITION = 'Definition',
  USAGE = 'Usage',
  SPECIALIZATION = 'Specialization',
  COMPOSITION = 'Composition',
  REFERENCE = 'Reference',
  CONNECTION = 'Connection',
  ALLOCATION = 'Allocation',
  DEPENDENCY = 'Dependency'
}

/**
 * SysML v2のダイアグラムタイプ
 */
export enum SysMLDiagramType {
  BLOCK_DEFINITION = 'BlockDefinition',
  INTERNAL_BLOCK = 'InternalBlock',
  REQUIREMENT = 'Requirement',
  PARAMETRIC = 'Parametric',
  ACTIVITY = 'Activity',
  SEQUENCE = 'Sequence',
  STATE_MACHINE = 'StateMachine',
  USE_CASE = 'UseCase',
  PACKAGE = 'Package'
}

/**
 * SysML v2の仕様リソース（OMG公式URL）
 */
export const SYSML_RESOURCES = {
  SPECIFICATION: 'https://www.omg.org/spec/SysML/2.0/Beta1',
  METAMODEL: 'https://www.omg.org/spec/SysML/2.0/Beta1/Metamodel',
  NOTATION: 'https://www.omg.org/spec/SysML/2.0/Beta1/Notation',
  XMI: 'https://www.omg.org/spec/SysML/2.0/Beta1/XMI',
  PDF: 'https://www.omg.org/spec/SysML/2.0/Beta1/PDF',
  KERML: 'https://www.omg.org/spec/KerML/1.0/Beta1'
};

/**
 * SysML v2のブロック定義型の情報
 */
export const BLOCK_DEFINITION_INFO = {
  description: 'A Block Definition is a type of system component that may have properties and behavior.',
  allowedChildren: [
    SysMLConcept.ATTRIBUTE_DEFINITION,
    SysMLConcept.PORT_DEFINITION,
    SysMLConcept.CONSTRAINT
  ],
  allowedRelationships: [
    SysMLRelationshipType.SPECIALIZATION,
    SysMLRelationshipType.COMPOSITION,
    SysMLRelationshipType.REFERENCE,
    SysMLRelationshipType.CONNECTION
  ],
  diagramTypes: [
    SysMLDiagramType.BLOCK_DEFINITION,
    SysMLDiagramType.INTERNAL_BLOCK
  ],
  specReference: 'SysML 2.0 Beta1, Section 7.2.2'
};

/**
 * SysML v2のパート定義型の情報
 */
export const PART_DEFINITION_INFO = {
  description: 'A Part Definition is a usage-focused type that defines a part in the system.',
  allowedChildren: [
    SysMLConcept.ATTRIBUTE_DEFINITION,
    SysMLConcept.PORT_DEFINITION,
    SysMLConcept.CONSTRAINT
  ],
  allowedRelationships: [
    SysMLRelationshipType.SPECIALIZATION,
    SysMLRelationshipType.COMPOSITION,
    SysMLRelationshipType.REFERENCE,
    SysMLRelationshipType.CONNECTION
  ],
  diagramTypes: [
    SysMLDiagramType.BLOCK_DEFINITION,
    SysMLDiagramType.INTERNAL_BLOCK
  ],
  specReference: 'SysML 2.0 Beta1, Section 8.2.3'
};

/**
 * SysML v2のポート定義型の情報
 */
export const PORT_DEFINITION_INFO = {
  description: 'A Port Definition is a type that defines an interaction point of a block or part.',
  allowedChildren: [
    SysMLConcept.ATTRIBUTE_DEFINITION,
    SysMLConcept.CONSTRAINT
  ],
  allowedRelationships: [
    SysMLRelationshipType.SPECIALIZATION,
    SysMLRelationshipType.REFERENCE,
    SysMLRelationshipType.CONNECTION
  ],
  diagramTypes: [
    SysMLDiagramType.BLOCK_DEFINITION,
    SysMLDiagramType.INTERNAL_BLOCK
  ],
  specReference: 'SysML 2.0 Beta1, Section 9.2.2'
};

/**
 * 要素の型に基づいて情報を提供
 * @param conceptType SysMLコンセプト型
 * @returns 該当するコンセプトタイプの情報
 */
export function getConceptInfo(conceptType: SysMLConcept) {
  switch (conceptType) {
    case SysMLConcept.BLOCK_DEFINITION:
      return BLOCK_DEFINITION_INFO;
    case SysMLConcept.PART_DEFINITION:
      return PART_DEFINITION_INFO;
    case SysMLConcept.PORT_DEFINITION:
      return PORT_DEFINITION_INFO;
    default:
      return {
        description: 'Information not available for this concept type',
        allowedChildren: [],
        allowedRelationships: [],
        diagramTypes: [],
        specReference: 'See SysML v2.0 specification document'
      };
  }
}

/**
 * 指定されたタイプに対してSysML v2リファレンスURLを取得する
 * @param conceptType SysMLコンセプト型
 * @returns 該当する仕様へのURL
 */
export function getSpecificationUrl(conceptType: SysMLConcept): string {
  // URLフラグメントを定義
  const urlFragments: Record<SysMLConcept, string> = {
    [SysMLConcept.BLOCK_DEFINITION]: '#_18_5_3_8a7027a_1542819983628_586184_13926',
    [SysMLConcept.PART_DEFINITION]: '#_18_5_3_8a7027a_1542912163632_931184_14144',
    [SysMLConcept.PORT_DEFINITION]: '#_18_5_3_8a7027a_1542915883038_752371_14298',
    [SysMLConcept.ATTRIBUTE_DEFINITION]: '#_18_5_3_8a7027a_1542922492942_116419_14487',
    [SysMLConcept.CONNECTION_DEFINITION]: '#_18_5_3_8a7027a_1543224248380_114835_14950',
    [SysMLConcept.REQUIREMENT]: '#_18_5_3_8a7027a_1543339056453_435385_15211',
    [SysMLConcept.ACTION]: '#_18_5_3_8a7027a_1543401621122_284012_15413',
    [SysMLConcept.STATE]: '#_18_5_3_8a7027a_1543484383548_343228_15762',
    [SysMLConcept.CONSTRAINT]: '#_18_5_3_8a7027a_1543224248380_114835_14950',
    [SysMLConcept.ITEM_FLOW]: '#_18_5_3_8a7027a_1543224333143_123477_15011',
    [SysMLConcept.PACKAGE]: '#_18_5_3_8a7027a_1542819983628_586184_13926',
    [SysMLConcept.INTERFACE_DEFINITION]: '#_18_5_3_8a7027a_1542915891782_850036_14308'
  };
  
  const fragment = urlFragments[conceptType] || '';
  return `${SYSML_RESOURCES.SPECIFICATION}${fragment}`;
}