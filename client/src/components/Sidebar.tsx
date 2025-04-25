import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import TreeItem from './TreeItem';
import { TreeItemData } from '@/types';

export default function Sidebar() {
  const { projectFiles, setProjectFiles } = useAppStore();
  
  const handleFileSelect = (id: string) => {
    setProjectFiles(updateSelectedState(projectFiles, id));
  };
  
  const handleToggleExpand = (id: string) => {
    setProjectFiles(updateExpandedState(projectFiles, id));
  };
  
  // Helper function to update the selected state of tree items
  const updateSelectedState = (items: TreeItemData[], selectedId: string): TreeItemData[] => {
    return items.map(item => {
      const isSelected = item.id === selectedId;
      const updatedChildren = item.children 
        ? updateSelectedState(item.children, selectedId) 
        : undefined;
      
      return {
        ...item,
        selected: isSelected,
        children: updatedChildren
      };
    });
  };
  
  // Helper function to toggle expanded state of tree items
  const updateExpandedState = (items: TreeItemData[], toggledId: string): TreeItemData[] => {
    return items.map(item => {
      if (item.id === toggledId) {
        return {
          ...item,
          expanded: !item.expanded,
          children: item.children
        };
      }
      
      const updatedChildren = item.children 
        ? updateExpandedState(item.children, toggledId) 
        : undefined;
      
      return {
        ...item,
        children: updatedChildren
      };
    });
  };
  
  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col h-full">
      <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
        <h2 className="font-medium">Project Explorer</h2>
        <div className="flex space-x-1">
          <button className="p-1 rounded hover:bg-neutral-100" aria-label="New File">
            <span className="material-icons text-sm">add</span>
          </button>
          <button className="p-1 rounded hover:bg-neutral-100" aria-label="Refresh">
            <span className="material-icons text-sm">refresh</span>
          </button>
        </div>
      </div>
      <div className="overflow-y-auto flex-1 p-2">
        <div className="text-sm">
          {projectFiles.map(item => (
            <TreeItem 
              key={item.id} 
              item={item} 
              onSelect={handleFileSelect}
              onToggleExpand={handleToggleExpand}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
