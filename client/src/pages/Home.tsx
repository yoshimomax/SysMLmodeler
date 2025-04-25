import { useEffect } from 'react';
import AppHeader from '@/components/AppHeader';
import Sidebar from '@/components/Sidebar';
import DiagramEditor from '@/components/DiagramEditor';
import PropertyPanel from '@/components/PropertyPanel';
import Toolbar from '@/components/Toolbar';
import TabBar from '@/components/TabBar';
import StatusBar from '@/components/StatusBar';
import { useAppStore } from '@/lib/store';
import { TreeItemData } from '@/types';

export default function Home() {
  const { 
    setProjectFiles, 
    selectedElement, 
    setSelectedElement,
    statusMessage,
    user
  } = useAppStore();

  // Initialize project files (would come from API in real implementation)
  useEffect(() => {
    const mockFiles: TreeItemData[] = [
      {
        id: '1',
        name: 'src',
        type: 'folder',
        icon: 'folder',
        expanded: true,
        children: [
          {
            id: '2',
            name: 'App.tsx',
            type: 'file',
            icon: 'description',
          },
          {
            id: '3',
            name: 'index.tsx',
            type: 'file',
            icon: 'description',
          },
          {
            id: '4',
            name: 'components',
            type: 'folder',
            icon: 'folder',
            expanded: true,
            children: [
              {
                id: '5',
                name: 'DiagramEditor.tsx',
                type: 'file',
                icon: 'description',
              },
              {
                id: '6',
                name: 'ModelExplorer.tsx',
                type: 'file',
                icon: 'description',
                selected: true,
              }
            ]
          }
        ]
      },
      {
        id: '7',
        name: 'model',
        type: 'folder',
        icon: 'folder',
        expanded: true,
        children: [
          {
            id: '8',
            name: 'libs',
            type: 'folder',
            icon: 'folder',
            expanded: true,
            children: [
              {
                id: '9',
                name: 'sysml2',
                type: 'folder',
                icon: 'folder',
                expanded: true,
                children: [
                  {
                    id: '10',
                    name: 'SysML.xmi',
                    type: 'file',
                    icon: 'description',
                  },
                  {
                    id: '11',
                    name: 'Systems-Library.kpar',
                    type: 'file',
                    icon: 'description',
                  }
                ]
              },
              {
                id: '12',
                name: 'kerml',
                type: 'folder',
                icon: 'folder',
                expanded: true,
                children: [
                  {
                    id: '13',
                    name: 'KerML.xmi',
                    type: 'file',
                    icon: 'description',
                  }
                ]
              }
            ]
          },
          {
            id: '14',
            name: 'project.sysml',
            type: 'file',
            icon: 'description',
          }
        ]
      },
      {
        id: '15',
        name: 'public',
        type: 'folder',
        icon: 'folder',
      }
    ];
    
    setProjectFiles(mockFiles);
    
    // Set initial user
    if (!user) {
      useAppStore.setState({ user: { id: 1, name: 'User' } });
    }
  }, []);

  return (
    <div className="bg-neutral-100 font-sans text-neutral-900 h-screen flex flex-col overflow-hidden">
      <AppHeader />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <Toolbar />
          <TabBar />
          
          <div className="flex-1 flex overflow-hidden">
            <DiagramEditor />
          </div>
          
          <PropertyPanel 
            selectedElement={selectedElement} 
            onPropertyChange={(property, value) => {
              if (selectedElement) {
                const updatedElement = {
                  ...selectedElement,
                  [property]: value
                };
                setSelectedElement(updatedElement);
              }
            }} 
          />
        </div>
      </div>
      
      <StatusBar />
    </div>
  );
}
