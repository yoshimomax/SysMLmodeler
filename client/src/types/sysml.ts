// Types specific to SysML v2 modeling

export type ElementType = 
  | 'block'
  | 'part'
  | 'package'
  | 'action'
  | 'state'
  | 'requirement'
  | 'port'
  | 'activity'
  | 'interface';

export type RelationshipType = 
  | 'association'
  | 'composition'
  | 'aggregation'
  | 'inheritance'
  | 'dependency'
  | 'allocation';

export interface Element {
  id: string;
  name: string;
  type: ElementType;
  stereotype?: string;
  description?: string;
  properties?: Property[];
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface Property {
  id: string;
  name: string;
  type: string;
  multiplicity?: string;
  defaultValue?: string;
  description?: string;
}

export interface Relationship {
  id: string;
  type: RelationshipType;
  sourceName?: string;
  targetName?: string;
  sourceId: string;
  targetId: string;
  name?: string;
  vertices?: { x: number; y: number }[];
  labels?: { text: string; position: { x: number; y: number } }[];
}

export interface Diagram {
  id: string;
  name: string;
  type: 'block' | 'activity' | 'state' | 'requirement' | 'internal block';
  elements: Element[];
  relationships: Relationship[];
}

export interface SysMLModel {
  id: string;
  name: string;
  diagrams: Diagram[];
  elements: Element[];
  relationships: Relationship[];
}

export interface PaletteItem {
  id: string;
  name: string;
  icon: string;
  type: ElementType | RelationshipType;
  category: 'Blocks' | 'Relationships' | 'Actions' | 'Other';
}
