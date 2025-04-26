import {
  Type,
  Feature,
  Classifier,
  Association,
  Connector,
  BindingConnector,
  Succession,
  ItemFlow,
  SuccessionItemFlow,
  Behavior,
  Step,
  Function,
  Expression,
  Predicate,
  Interaction,
  Package
} from '../model/kerml';

/**
 * KerML Kernel レイヤー要素の制約検証機能を提供する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3 に基づく
 */
export class KermlKernelValidator {
  /**
   * Association終端の多重度整合性を検証
   * @param association 検証対象のAssociation
   * @param allFeatures 全ての特性リスト
   * @returns 検証結果（エラーメッセージの配列、エラーがない場合は空配列）
   */
  static validateAssociationMultiplicities(association: Association, allFeatures: Feature[]): string[] {
    const errors: string[] = [];
    const endFeatures = allFeatures.filter(f => 
      f.ownerId === association.id && f.isEnd);
    
    // 少なくとも2つのend featureが必要
    if (endFeatures.length < 2) {
      errors.push(`Association '${association.name || association.id}' must have at least 2 end features.`);
    }
    
    // 各endの多重度について確認（複雑なロジックはここで実装）
    // 実際には型がマッチするかなどより詳細なチェックが必要

    return errors;
  }
  
  /**
   * Connector / BindingConnector の接続対応関係を検証
   * @param connector 検証対象のConnector
   * @param allFeatures 全ての特性リスト
   * @returns 検証結果（エラーメッセージの配列、エラーがない場合は空配列）
   */
  static validateConnectorEnds(connector: Connector | BindingConnector, allFeatures: Feature[]): string[] {
    const errors: string[] = [];
    
    // 接続先特性が存在することを確認
    if (!connector.connectedFeatures || connector.connectedFeatures.length < 2) {
      errors.push(`Connector '${connector.name || connector.id}' must connect at least 2 features.`);
      return errors;
    }
    
    // 接続先特性がすべて存在することを確認
    for (const featureId of connector.connectedFeatures) {
      const feature = allFeatures.find(f => f.id === featureId);
      if (!feature) {
        errors.push(`Connector '${connector.name || connector.id}' references non-existent feature '${featureId}'.`);
      }
    }
    
    // BindingConnectorの場合、型の互換性を確認
    if (connector instanceof BindingConnector) {
      const connectedFeatures = connector.connectedFeatures
        .map(id => allFeatures.find(f => f.id === id))
        .filter(f => f !== undefined) as Feature[];
      
      if (connectedFeatures.length >= 2) {
        const featureTypes = connectedFeatures.map(f => f.typeId);
        
        // 少なくとも1つの型が設定されている必要がある
        if (featureTypes.every(t => !t)) {
          errors.push(`BindingConnector '${connector.name || connector.id}' connects features with no types specified.`);
        }
        
        // 設定されている型が互換性があるか確認（完全な型チェックはより複雑）
        const definedTypes = featureTypes.filter(t => !!t);
        if (definedTypes.length >= 2 && new Set(definedTypes).size > 1) {
          errors.push(`BindingConnector '${connector.name || connector.id}' connects features with potentially incompatible types.`);
        }
      }
    }
    
    return errors;
  }
  
  /**
   * SuccessionItemFlow の参照先要素存在チェック
   * @param flow 検証対象のSuccessionItemFlow
   * @param allTypes 全ての型リスト
   * @returns 検証結果（エラーメッセージの配列、エラーがない場合は空配列）
   */
  static validateSuccessionItemFlow(flow: SuccessionItemFlow, allTypes: Type[]): string[] {
    const errors: string[] = [];
    
    // アイテムタイプが指定されている場合、存在チェック
    if (flow.itemType) {
      const itemType = allTypes.find(t => t.id === flow.itemType);
      if (!itemType) {
        errors.push(`SuccessionItemFlow '${flow.name || flow.id}' references non-existent item type '${flow.itemType}'.`);
      }
    }
    
    return errors;
  }
  
  /**
   * Behavior → Step, Function → Expression/Predicate の階層構造制約
   * @param behavior 検証対象のBehavior
   * @param allSteps 全てのStepリスト
   * @param allExpressions 全てのExpressionリスト
   * @returns 検証結果（エラーメッセージの配列、エラーがない場合は空配列）
   */
  static validateBehaviorHierarchy(
    behavior: Behavior, 
    allSteps: Step[], 
    allExpressions: Expression[]
  ): string[] {
    const errors: string[] = [];
    
    // Behaviorのステップ参照が存在することを確認
    for (const stepId of behavior.steps) {
      const step = allSteps.find(s => s.id === stepId);
      if (!step) {
        errors.push(`Behavior '${behavior.name || behavior.id}' references non-existent step '${stepId}'.`);
      }
    }
    
    // Functionの場合、expressionが存在するか確認
    if (behavior instanceof Function && behavior.expression) {
      const expression = allExpressions.find(e => e.id === behavior.expression);
      if (!expression) {
        errors.push(`Function '${behavior.name || behavior.id}' references non-existent expression '${behavior.expression}'.`);
      }
    }
    
    return errors;
  }
  
  /**
   * Package のネスト制約
   * @param pkg 検証対象のPackage
   * @param allPackages 全てのPackageリスト
   * @returns 検証結果（エラーメッセージの配列、エラーがない場合は空配列）
   */
  static validatePackageNesting(pkg: Package, allPackages: Package[]): string[] {
    const errors: string[] = [];
    
    // インポートするパッケージが存在するか確認
    for (const importId of pkg.imports) {
      const importedPkg = allPackages.find(p => p.id === importId);
      if (!importedPkg) {
        errors.push(`Package '${pkg.name || pkg.id}' imports non-existent package '${importId}'.`);
      }
    }
    
    // パッケージの循環参照を検出
    const visited = new Set<string>();
    const path: string[] = [];
    
    const detectCycle = (currentPkg: Package): boolean => {
      if (path.includes(currentPkg.id)) {
        // 循環検出
        const cycleStart = path.indexOf(currentPkg.id);
        const cycle = [...path.slice(cycleStart), currentPkg.id];
        errors.push(`Package import cycle detected: ${cycle.join(' -> ')}.`);
        return true;
      }
      
      if (visited.has(currentPkg.id)) {
        return false; // すでに検証済み
      }
      
      visited.add(currentPkg.id);
      path.push(currentPkg.id);
      
      for (const importId of currentPkg.imports) {
        const importedPkg = allPackages.find(p => p.id === importId);
        if (importedPkg) {
          if (detectCycle(importedPkg)) {
            return true;
          }
        }
      }
      
      path.pop();
      return false;
    };
    
    detectCycle(pkg);
    
    return errors;
  }
  
  /**
   * 複数の制約チェックを実行
   * @param elements 検証対象要素（KerML要素のリスト）
   * @returns 検証結果（エラーメッセージの配列、エラーがない場合は空配列）
   */
  static validateAll(elements: {
    types: Type[],
    features: Feature[],
    associations: Association[],
    connectors: Connector[],
    bindingConnectors: BindingConnector[],
    successionItemFlows: SuccessionItemFlow[],
    behaviors: Behavior[],
    steps: Step[],
    functions: Function[],
    expressions: Expression[],
    packages: Package[]
  }): string[] {
    const errors: string[] = [];
    
    // Association制約
    elements.associations.forEach(association => {
      errors.push(...this.validateAssociationMultiplicities(association, elements.features));
    });
    
    // Connector制約
    elements.connectors.forEach(connector => {
      errors.push(...this.validateConnectorEnds(connector, elements.features));
    });
    
    // BindingConnector制約
    elements.bindingConnectors.forEach(connector => {
      errors.push(...this.validateConnectorEnds(connector, elements.features));
    });
    
    // SuccessionItemFlow制約
    elements.successionItemFlows.forEach(flow => {
      errors.push(...this.validateSuccessionItemFlow(flow, elements.types));
    });
    
    // Behavior階層構造制約
    elements.behaviors.forEach(behavior => {
      errors.push(...this.validateBehaviorHierarchy(behavior, elements.steps, elements.expressions));
    });
    
    // Package制約
    elements.packages.forEach(pkg => {
      errors.push(...this.validatePackageNesting(pkg, elements.packages));
    });
    
    return errors;
  }
}