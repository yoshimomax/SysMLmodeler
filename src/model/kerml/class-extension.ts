/**
 * KerML classes for integration with the UI
 * These extensions provide utility methods and properties for UI integration
 */

import { Type, Feature, Classifier, DataType, Class, Structure, Association, Connector, BindingConnector, Succession, ItemFlow, SuccessionItemFlow, Behavior, Step, Function, Expression, Predicate, Interaction } from './index';

// Type extensions for diagram rendering
declare module './Type' {
  interface Type {
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

// Feature extensions
declare module './Feature' {
  interface Feature {
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

// Behavior extensions
declare module './Behavior' {
  interface Behavior {
    /**
     * 振る舞いの図形描画情報を返す
     * @returns 図形描画情報
     */
    getShapeInfo(): { type: string; icon?: string; color?: string };
    
    /**
     * 振る舞いのプロパティパネル情報を返す
     * @returns プロパティパネル情報のリスト
     */
    getPropertyInfo(): { name: string; type: string; value: any }[];
  }
}

// Type implementation
Type.prototype.getShapeInfo = function() {
  return {
    type: 'box',
    color: '#e0f7fa'
  };
};

Type.prototype.getPropertyInfo = function() {
  return [
    { name: 'ID', type: 'string', value: this.id },
    { name: 'Name', type: 'string', value: this.name || '' },
    { name: 'Description', type: 'text', value: this.description || '' },
    { name: 'Abstract', type: 'boolean', value: this.isAbstract || false },
    { name: 'Conjugated', type: 'boolean', value: this.isConjugated || false }
  ];
};

// Feature implementation
Feature.prototype.getShapeInfo = function() {
  return {
    type: 'circle',
    color: '#fff9c4'
  };
};

Feature.prototype.getPropertyInfo = function() {
  return [
    { name: 'ID', type: 'string', value: this.id },
    { name: 'Name', type: 'string', value: this.name || '' },
    { name: 'Description', type: 'text', value: this.description || '' },
    { name: 'Type', type: 'reference', value: this.typeId || '' },
    { name: 'Direction', type: 'enum', value: this.direction || 'inout' },
    { name: 'Unique', type: 'boolean', value: this.isUnique || false },
    { name: 'Ordered', type: 'boolean', value: this.isOrdered || false }
  ];
};

// Connector implementation
Connector.prototype.getShapeInfo = function() {
  return {
    type: 'connector',
    lineStyle: 'solid',
    arrowType: 'none',
    color: '#000000'
  };
};

Connector.prototype.getPropertyInfo = function() {
  return [
    { name: 'ID', type: 'string', value: this.id },
    { name: 'Name', type: 'string', value: this.name || '' },
    { name: 'Description', type: 'text', value: this.description || '' },
    { name: 'Type', type: 'reference', value: this.typeId || '' },
    { name: 'Connected Features', type: 'reference-list', value: this.connectedFeatures || [] }
  ];
};

// Specific connector overrides
BindingConnector.prototype.getShapeInfo = function() {
  return {
    type: 'connector',
    lineStyle: 'dashed',
    arrowType: 'none',
    color: '#4dd0e1'
  };
};

Succession.prototype.getShapeInfo = function() {
  return {
    type: 'connector',
    lineStyle: 'solid',
    arrowType: 'open',
    color: '#ff7043'
  };
};

ItemFlow.prototype.getShapeInfo = function() {
  return {
    type: 'connector',
    lineStyle: 'solid',
    arrowType: 'filled',
    color: '#66bb6a'
  };
};

SuccessionItemFlow.prototype.getShapeInfo = function() {
  return {
    type: 'connector',
    lineStyle: 'solid',
    arrowType: 'filled',
    color: '#9575cd'
  };
};

// Behavior implementation
Behavior.prototype.getShapeInfo = function() {
  return {
    type: 'rounded-box',
    icon: 'activity',
    color: '#bbdefb'
  };
};

Behavior.prototype.getPropertyInfo = function() {
  return [
    { name: 'ID', type: 'string', value: this.id },
    { name: 'Name', type: 'string', value: this.name || '' },
    { name: 'Description', type: 'text', value: this.description || '' },
    { name: 'Abstract', type: 'boolean', value: this.isAbstract || false },
    { name: 'Steps', type: 'reference-list', value: this.steps || [] }
  ];
};

// Specific behavior overrides
Function.prototype.getShapeInfo = function() {
  return {
    type: 'rounded-box',
    icon: 'function',
    color: '#c5e1a5'
  };
};

Expression.prototype.getShapeInfo = function() {
  return {
    type: 'rounded-box',
    icon: 'code',
    color: '#ffcc80'
  };
};

Predicate.prototype.getShapeInfo = function() {
  return {
    type: 'diamond',
    icon: 'help',
    color: '#ffecb3'
  };
};

Interaction.prototype.getShapeInfo = function() {
  return {
    type: 'hexagon',
    icon: 'swap_horiz',
    color: '#e1bee7'
  };
};

// Additional property info overrides
Succession.prototype.getPropertyInfo = function() {
  const baseProps = Connector.prototype.getPropertyInfo.call(this);
  return [
    ...baseProps,
    { name: 'Effect', type: 'text', value: this.effect || '' },
    { name: 'Guard', type: 'text', value: this.guard || '' }
  ];
};

ItemFlow.prototype.getPropertyInfo = function() {
  const baseProps = Connector.prototype.getPropertyInfo.call(this);
  return [
    ...baseProps,
    { name: 'Item Type', type: 'reference', value: this.itemType || '' }
  ];
};

SuccessionItemFlow.prototype.getPropertyInfo = function() {
  const baseProps = Succession.prototype.getPropertyInfo.call(this);
  return [
    ...baseProps,
    { name: 'Item Type', type: 'reference', value: this.itemType || '' }
  ];
};

Function.prototype.getPropertyInfo = function() {
  const baseProps = Behavior.prototype.getPropertyInfo.call(this);
  return [
    ...baseProps,
    { name: 'Expression', type: 'reference', value: this.expression || '' }
  ];
};

Expression.prototype.getPropertyInfo = function() {
  const baseProps = Behavior.prototype.getPropertyInfo.call(this);
  return [
    ...baseProps,
    { name: 'Body', type: 'text', value: this.body || '' },
    { name: 'Result', type: 'reference', value: this.result || '' }
  ];
};

Interaction.prototype.getPropertyInfo = function() {
  const baseProps = Behavior.prototype.getPropertyInfo.call(this);
  return [
    ...baseProps,
    { name: 'Participants', type: 'reference-list', value: this.participants || [] }
  ];
};

Step.prototype.getPropertyInfo = function() {
  const baseProps = Feature.prototype.getPropertyInfo.call(this);
  return [
    ...baseProps,
    { name: 'Behavior Reference', type: 'reference', value: this.behaviorReference || '' }
  ];
};