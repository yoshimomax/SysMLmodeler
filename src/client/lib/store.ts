import { create } from 'zustand';
import { Element, Relationship, Diagram, Tab, TreeItemData, PaletteItem, StatusMessage, SysMLModel } from '@/types';

interface AppState {
  // User state
  user: { id: number; name: string } | null;
  setUser: (user: { id: number; name: string } | null) => void;
  
  // Project explorer state
  projectFiles: TreeItemData[];
  setProjectFiles: (files: TreeItemData[]) => void;
  selectedFile: TreeItemData | null;
  setSelectedFile: (file: TreeItemData | null) => void;
  
  // Diagram editor state
  currentDiagram: Diagram | null;
  setCurrentDiagram: (diagram: Diagram | null) => void;
  selectedElement: Element | null;
  setSelectedElement: (element: Element | null) => void;
  selectedRelationship: Relationship | null;
  setSelectedRelationship: (relationship: Relationship | null) => void;
  
  // Element/Relationship operations
  updateElement: (id: string, updates: Partial<Element>) => void;
  updateRelationship: (id: string, updates: Partial<Relationship>) => void;
  addElement: (element: Element) => void;
  addRelationship: (relationship: Relationship) => void;
  removeElement: (id: string) => void;
  removeRelationship: (id: string) => void;
  
  // Model operations
  currentModel: SysMLModel | null;
  setCurrentModel: (model: SysMLModel | null) => void;
  saveModel: () => SysMLModel;
  loadModel: (model: SysMLModel) => void;
  createNewModel: (name: string) => void;
  isDirty: boolean;
  setIsDirty: (isDirty: boolean) => void;
  
  // Tabs state
  tabs: Tab[];
  addTab: (tab: Omit<Tab, 'active'>) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  
  // Palette state
  paletteItems: PaletteItem[];
  selectedPaletteItem: PaletteItem | null;
  setSelectedPaletteItem: (item: PaletteItem | null) => void;
  
  // Status bar state
  statusMessage: StatusMessage;
  setStatusMessage: (message: StatusMessage) => void;
  
  // View state
  currentView: 'diagram' | 'code' | 'split';
  setCurrentView: (view: 'diagram' | 'code' | 'split') => void;
}

const DEFAULT_PALETTE_ITEMS: PaletteItem[] = [
  { id: 'block', name: 'Block', icon: 'view_module', type: 'block', category: 'Blocks' },
  { id: 'part', name: 'Part', icon: 'widgets', type: 'part', category: 'Blocks' },
  { id: 'package', name: 'Package', icon: 'folder', type: 'package', category: 'Blocks' },
  { id: 'association', name: 'Association', icon: 'arrow_forward', type: 'association', category: 'Relationships' },
  { id: 'composition', name: 'Composition', icon: 'device_hub', type: 'composition', category: 'Relationships' },
  { id: 'inheritance', name: 'Inheritance', icon: 'device_hub', type: 'inheritance', category: 'Relationships' },
  { id: 'action', name: 'Action', icon: 'bolt', type: 'action', category: 'Actions' },
  { id: 'activity', name: 'Activity', icon: 'call_split', type: 'activity', category: 'Actions' },
];

export const useAppStore = create<AppState>((set, get) => ({
  // User state
  user: null,
  setUser: (user) => set({ user }),
  
  // Project explorer state
  projectFiles: [],
  setProjectFiles: (projectFiles) => set({ projectFiles }),
  selectedFile: null,
  setSelectedFile: (selectedFile) => set({ selectedFile }),
  
  // Diagram editor state
  currentDiagram: null,
  setCurrentDiagram: (currentDiagram) => set({ currentDiagram, isDirty: true }),
  selectedElement: null,
  setSelectedElement: (selectedElement) => set({ selectedElement }),
  selectedRelationship: null,
  setSelectedRelationship: (selectedRelationship) => set({ selectedRelationship }),
  
  // Element/Relationship operations
  updateElement: (id, updates) => set((state) => {
    if (!state.currentDiagram) return state;
    
    const updatedElements = state.currentDiagram.elements.map(element => 
      element.id === id ? { ...element, ...updates } : element
    );
    
    // If the currently selected element is updated, update it in the state too
    const updatedSelectedElement = state.selectedElement?.id === id
      ? { ...state.selectedElement, ...updates }
      : state.selectedElement;
    
    return {
      currentDiagram: {
        ...state.currentDiagram,
        elements: updatedElements
      },
      selectedElement: updatedSelectedElement,
      isDirty: true
    };
  }),
  
  updateRelationship: (id, updates) => set((state) => {
    if (!state.currentDiagram) return state;
    
    const updatedRelationships = state.currentDiagram.relationships.map(relationship => 
      relationship.id === id ? { ...relationship, ...updates } : relationship
    );
    
    // If the currently selected relationship is updated, update it in the state too
    const updatedSelectedRelationship = state.selectedRelationship?.id === id
      ? { ...state.selectedRelationship, ...updates }
      : state.selectedRelationship;
    
    return {
      currentDiagram: {
        ...state.currentDiagram,
        relationships: updatedRelationships
      },
      selectedRelationship: updatedSelectedRelationship,
      isDirty: true
    };
  }),
  
  addElement: (element) => set((state) => {
    if (!state.currentDiagram) return state;
    
    return {
      currentDiagram: {
        ...state.currentDiagram,
        elements: [...state.currentDiagram.elements, element]
      },
      isDirty: true
    };
  }),
  
  addRelationship: (relationship) => set((state) => {
    if (!state.currentDiagram) return state;
    
    return {
      currentDiagram: {
        ...state.currentDiagram,
        relationships: [...state.currentDiagram.relationships, relationship]
      },
      isDirty: true
    };
  }),
  
  removeElement: (id) => set((state) => {
    if (!state.currentDiagram) return state;
    
    // Remove the element
    const updatedElements = state.currentDiagram.elements.filter(element => element.id !== id);
    
    // Remove any relationships that connect to this element
    const updatedRelationships = state.currentDiagram.relationships.filter(
      relationship => relationship.sourceId !== id && relationship.targetId !== id
    );
    
    // Clear selected element if it was the one removed
    const updatedSelectedElement = state.selectedElement?.id === id
      ? null
      : state.selectedElement;
    
    return {
      currentDiagram: {
        ...state.currentDiagram,
        elements: updatedElements,
        relationships: updatedRelationships
      },
      selectedElement: updatedSelectedElement,
      isDirty: true
    };
  }),
  
  removeRelationship: (id) => set((state) => {
    if (!state.currentDiagram) return state;
    
    const updatedRelationships = state.currentDiagram.relationships.filter(
      relationship => relationship.id !== id
    );
    
    // Clear selected relationship if it was the one removed
    const updatedSelectedRelationship = state.selectedRelationship?.id === id
      ? null
      : state.selectedRelationship;
    
    return {
      currentDiagram: {
        ...state.currentDiagram,
        relationships: updatedRelationships
      },
      selectedRelationship: updatedSelectedRelationship,
      isDirty: true
    };
  }),
  
  // Model operations
  currentModel: null,
  setCurrentModel: (currentModel) => set({ currentModel, isDirty: false }),
  
  isDirty: false,
  setIsDirty: (isDirty) => set({ isDirty }),
  
  saveModel: () => {
    const state = get();
    const currentDiagram = state.currentDiagram;
    const currentModel = state.currentModel;

    if (!currentDiagram) {
      throw new Error('No diagram to save');
    }

    // Update or create a model
    const model: SysMLModel = currentModel ? {
      ...currentModel,
      diagrams: currentModel.diagrams.map(diagram => 
        diagram.id === currentDiagram.id ? currentDiagram : diagram
      )
    } : {
      id: crypto.randomUUID(),
      name: currentDiagram.name,
      diagrams: [currentDiagram],
      elements: currentDiagram.elements,
      relationships: currentDiagram.relationships
    };

    // Set the updated model in state
    set({ currentModel: model, isDirty: false });
    return model;
  },
  
  loadModel: (model) => {
    // Set the loaded model
    set({
      currentModel: model,
      currentDiagram: model.diagrams[0] || null,
      selectedElement: null,
      selectedRelationship: null,
      isDirty: false
    });
    
    // Create a tab for each diagram
    const tabs = model.diagrams.map(diagram => ({
      id: diagram.id,
      name: diagram.name,
      type: 'diagram',
      path: `/diagrams/${diagram.id}`,
      active: false
    }));
    
    // Set the first tab as active
    if (tabs.length > 0) {
      tabs[0].active = true;
    }
    
    set({ tabs });
  },
  
  createNewModel: (name) => {
    const newDiagram: Diagram = {
      id: crypto.randomUUID(),
      name: 'Main Diagram',
      type: 'block',
      elements: [],
      relationships: []
    };
    
    const newModel: SysMLModel = {
      id: crypto.randomUUID(),
      name,
      diagrams: [newDiagram],
      elements: [],
      relationships: []
    };
    
    // Set the new model and its first diagram as current
    set({
      currentModel: newModel,
      currentDiagram: newDiagram,
      selectedElement: null,
      selectedRelationship: null,
      tabs: [{
        id: newDiagram.id,
        name: newDiagram.name,
        type: 'diagram',
        path: `/diagrams/${newDiagram.id}`,
        active: true
      }],
      isDirty: false
    });
  },
  
  // Tabs state
  tabs: [],
  addTab: (newTab) => set((state) => {
    // If tab already exists, just set it as active
    const tabExists = state.tabs.find(tab => tab.id === newTab.id);
    if (tabExists) {
      return {
        tabs: state.tabs.map(tab => ({
          ...tab,
          active: tab.id === newTab.id
        }))
      };
    }
    
    // Otherwise add a new tab and set it as active
    return {
      tabs: [
        ...state.tabs.map(tab => ({ ...tab, active: false })),
        { ...newTab, active: true }
      ]
    };
  }),
  closeTab: (id) => set((state) => {
    const tabIndex = state.tabs.findIndex(tab => tab.id === id);
    if (tabIndex === -1) return state;
    
    const newTabs = state.tabs.filter(tab => tab.id !== id);
    
    // If the closed tab was active, activate another tab
    if (state.tabs[tabIndex].active && newTabs.length > 0) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
      newTabs[newActiveIndex].active = true;
    }
    
    return { tabs: newTabs };
  }),
  setActiveTab: (id) => set((state) => {
    const newTabs = state.tabs.map(tab => ({
      ...tab,
      active: tab.id === id
    }));
    
    // Also update the current diagram if it's a diagram tab
    const activeTab = state.tabs.find(tab => tab.id === id);
    const updates: Partial<AppState> = { tabs: newTabs };
    
    if (activeTab && activeTab.type === 'diagram' && state.currentModel) {
      const diagram = state.currentModel.diagrams.find(d => d.id === id);
      if (diagram) {
        updates.currentDiagram = diagram;
      }
    }
    
    return updates;
  }),
  
  // Palette state
  paletteItems: DEFAULT_PALETTE_ITEMS,
  selectedPaletteItem: null,
  setSelectedPaletteItem: (selectedPaletteItem) => set({ selectedPaletteItem }),
  
  // Status bar state
  statusMessage: { text: 'Ready', type: 'info' },
  setStatusMessage: (statusMessage) => set({ statusMessage }),
  
  // View state
  currentView: 'diagram',
  setCurrentView: (currentView) => set({ currentView }),
}));
