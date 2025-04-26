/**
 * SysML classes for integration with the UI
 * These extensions provide utility methods and properties for UI integration
 */

import { Block, Part, Port, Connector, ItemFlow, Requirement, ViewDefinition, View, Viewpoint, Package, Model } from './index';

// Block extensions for diagram rendering
declare module './Block' {
  interface Block {
    /**
     * 要素の図形描画情報を返す
     * @returns 図形描画情報
     */
    getShapeInfo(): { type: string; icon?: string; color?: string };
    
    /**
     * 要素のプロパティパネル情報を返す
     * @returns プロパティパネル情報のリスト
     */
    getPropertyInfo(): { name: string; type: string; value: any }[];
  }
}

// Part extensions
declare module './Part' {
  interface Part {
    /**
     * 特性の図形描画情報を返す
     * @returns 図形描画情報
     */
    getShapeInfo(): { type: string; icon?: string; color?: string };
    
    /**
     * 特性のプロパティパネル情報を返す
     * @returns プロパティパネル情報のリスト
     */
    getPropertyInfo(): { name: string; type: string; value: any }[];
  }
}

// Port extensions
declare module './Port' {
  interface Port {
    /**
     * ポートの図形描画情報を返す
     * @returns 図形描画情報
     */
    getShapeInfo(): { type: string; icon?: string; color?: string };
    
    /**
     * ポートのプロパティパネル情報を返す
     * @returns プロパティパネル情報のリスト
     */
    getPropertyInfo(): { name: string; type: string; value: any }[];
  }
}

// Connector extensions
declare module './Connector' {
  interface Connector {
    /**
     * コネクタの図形描画情報を返す
     * @returns 図形描画情報
     */
    getShapeInfo(): { type: string; lineStyle?: string; arrowType?: string; color?: string };
    
    /**
     * コネクタのプロパティパネル情報を返す
     * @returns プロパティパネル情報のリスト
     */
    getPropertyInfo(): { name: string; type: string; value: any }[];
  }
}

// Requirement extensions
declare module './Requirement' {
  interface Requirement {
    /**
     * 要件の図形描画情報を返す
     * @returns 図形描画情報
     */
    getShapeInfo(): { type: string; icon?: string; color?: string };
    
    /**
     * 要件のプロパティパネル情報を返す
     * @returns プロパティパネル情報のリスト
     */
    getPropertyInfo(): { name: string; type: string; value: any }[];
  }
}

// Block implementation
Block.prototype.getShapeInfo = function() {
  return {
    type: 'box',
    icon: 'cube',
    color: '#e3f2fd'
  };
};

Block.prototype.getPropertyInfo = function() {
  return [
    { name: 'ID', type: 'string', value: this.id },
    { name: 'Name', type: 'string', value: this.name || '' },
    { name: 'Description', type: 'text', value: this.description || '' },
    { name: 'Abstract', type: 'boolean', value: this.isAbstract || false },
    { name: 'Ports', type: 'reference-list', value: this.portIds || [] },
    { name: 'Properties', type: 'reference-list', value: this.propertyIds || [] }
  ];
};

// Part implementation
Part.prototype.getShapeInfo = function() {
  return {
    type: 'box',
    icon: 'component',
    color: '#e8f5e9'
  };
};

Part.prototype.getPropertyInfo = function() {
  return [
    { name: 'ID', type: 'string', value: this.id },
    { name: 'Name', type: 'string', value: this.name || '' },
    { name: 'Description', type: 'text', value: this.description || '' },
    { name: 'Type', type: 'reference', value: this.typeId || '' },
    { name: 'Composite', type: 'boolean', value: this.isComposite || true },
    { name: 'Ports', type: 'reference-list', value: this.ports || [] }
  ];
};

// Port implementation
Port.prototype.getShapeInfo = function() {
  return {
    type: 'circle',
    icon: 'link',
    color: '#fff9c4'
  };
};

Port.prototype.getPropertyInfo = function() {
  return [
    { name: 'ID', type: 'string', value: this.id },
    { name: 'Name', type: 'string', value: this.name || '' },
    { name: 'Description', type: 'text', value: this.description || '' },
    { name: 'Type', type: 'reference', value: this.typeId || '' },
    { name: 'Direction', type: 'enum', value: this.direction || 'inout' },
    { name: 'Service', type: 'boolean', value: this.isService || false },
    { name: 'Conjugated', type: 'boolean', value: this.isConjugated || false }
  ];
};

// Connector implementation
Connector.prototype.getShapeInfo = function() {
  // コネクタの型に基づいて適切なスタイルを選択
  switch (this.stereotype) {
    case 'composition':
      return {
        type: 'connector',
        lineStyle: 'solid',
        arrowType: 'diamond-filled',
        color: '#000000'
      };
    case 'aggregation':
      return {
        type: 'connector',
        lineStyle: 'solid',
        arrowType: 'diamond',
        color: '#000000'
      };
    case 'reference':
      return {
        type: 'connector',
        lineStyle: 'dashed',
        arrowType: 'open',
        color: '#000000'
      };
    case 'dependency':
      return {
        type: 'connector',
        lineStyle: 'dashed',
        arrowType: 'open',
        color: '#9e9e9e'
      };
    case 'generalization':
      return {
        type: 'connector',
        lineStyle: 'solid',
        arrowType: 'triangle',
        color: '#000000'
      };
    default:
      return {
        type: 'connector',
        lineStyle: 'solid',
        arrowType: 'none',
        color: '#000000'
      };
  }
};

Connector.prototype.getPropertyInfo = function() {
  return [
    { name: 'ID', type: 'string', value: this.id },
    { name: 'Name', type: 'string', value: this.name || '' },
    { name: 'Description', type: 'text', value: this.description || '' },
    { name: 'Type', type: 'reference', value: this.typeId || '' },
    { name: 'Source', type: 'reference', value: this.sourceId },
    { name: 'Target', type: 'reference', value: this.targetId },
    { name: 'Source Port', type: 'reference', value: this.sourcePortId || '' },
    { name: 'Target Port', type: 'reference', value: this.targetPortId || '' }
  ];
};

// ItemFlow implementation
ItemFlow.prototype.getShapeInfo = function() {
  return {
    type: 'connector',
    lineStyle: 'solid',
    arrowType: 'filled',
    color: '#66bb6a'
  };
};

ItemFlow.prototype.getPropertyInfo = function() {
  return [
    { name: 'ID', type: 'string', value: this.id },
    { name: 'Name', type: 'string', value: this.name || '' },
    { name: 'Description', type: 'text', value: this.description || '' },
    { name: 'Connector', type: 'reference', value: this.connectorId },
    { name: 'Item Type', type: 'reference', value: this.itemTypeId },
    { name: 'Source', type: 'reference', value: this.sourceId },
    { name: 'Target', type: 'reference', value: this.targetId }
  ];
};

// Requirement implementation
Requirement.prototype.getShapeInfo = function() {
  return {
    type: 'box',
    icon: 'assignment',
    color: '#ffebee'
  };
};

Requirement.prototype.getPropertyInfo = function() {
  return [
    { name: 'ID', type: 'string', value: this.id },
    { name: 'Name', type: 'string', value: this.name || '' },
    { name: 'Text', type: 'text', value: this.text },
    { name: 'Rationale', type: 'text', value: this.rationale || '' },
    { name: 'Criticality', type: 'string', value: this.criticality || '' },
    { name: 'Status', type: 'string', value: this.status || '' },
    { name: 'Verified By', type: 'reference-list', value: this.verifiedBy || [] },
    { name: 'Satisfied By', type: 'reference-list', value: this.satisfiedBy || [] },
    { name: 'Refined By', type: 'reference-list', value: this.refinedBy || [] },
    { name: 'Traced To', type: 'reference-list', value: this.tracedTo || [] }
  ];
};