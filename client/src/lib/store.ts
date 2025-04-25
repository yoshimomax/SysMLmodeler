import { create } from 'zustand';
import { Element, Relationship, Diagram, Tab, TreeItemData, PaletteItem, StatusMessage } from '@/types';

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

export const useAppStore = create<AppState>((set) => ({
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
  setCurrentDiagram: (currentDiagram) => set({ currentDiagram }),
  selectedElement: null,
  setSelectedElement: (selectedElement) => set({ selectedElement }),
  selectedRelationship: null,
  setSelectedRelationship: (selectedRelationship) => set({ selectedRelationship }),
  
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
  setActiveTab: (id) => set((state) => ({
    tabs: state.tabs.map(tab => ({
      ...tab,
      active: tab.id === id
    }))
  })),
  
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
