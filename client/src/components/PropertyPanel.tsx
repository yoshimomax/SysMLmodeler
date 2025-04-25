import { useState } from 'react';
import { Element } from '@/types/sysml';

interface PropertyPanelProps {
  selectedElement: Element | null;
  onPropertyChange: (property: string, value: any) => void;
}

export default function PropertyPanel({ selectedElement, onPropertyChange }: PropertyPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('properties');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onPropertyChange(name, value);
  };
  
  return (
    <div className="h-64 border-t border-neutral-200 bg-white overflow-hidden flex flex-col">
      <div className="flex border-b border-neutral-200">
        <button 
          className={`px-4 py-2 text-sm ${activeTab === 'properties' ? 'font-medium text-primary border-b-2 border-primary' : 'text-neutral-600 hover:bg-neutral-50'}`}
          onClick={() => setActiveTab('properties')}
        >
          Properties
        </button>
        <button 
          className={`px-4 py-2 text-sm ${activeTab === 'issues' ? 'font-medium text-primary border-b-2 border-primary' : 'text-neutral-600 hover:bg-neutral-50'}`}
          onClick={() => setActiveTab('issues')}
        >
          Issues
        </button>
        <button 
          className={`px-4 py-2 text-sm ${activeTab === 'terminal' ? 'font-medium text-primary border-b-2 border-primary' : 'text-neutral-600 hover:bg-neutral-50'}`}
          onClick={() => setActiveTab('terminal')}
        >
          Terminal
        </button>
        <button 
          className={`px-4 py-2 text-sm ${activeTab === 'console' ? 'font-medium text-primary border-b-2 border-primary' : 'text-neutral-600 hover:bg-neutral-50'}`}
          onClick={() => setActiveTab('console')}
        >
          Console
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'properties' && selectedElement ? (
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                <input 
                  type="text" 
                  name="name"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  value={selectedElement.name || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
                <select 
                  name="type"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  value={selectedElement.type || 'block'}
                  onChange={handleInputChange}
                >
                  <option value="block">Block</option>
                  <option value="part">Part</option>
                  <option value="package">Package</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Stereotype</label>
                <input 
                  type="text" 
                  name="stereotype"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  value={selectedElement.stereotype || 'block'}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">ID</label>
                <input 
                  type="text" 
                  name="id"
                  className="w-full px-3 py-2 border border-neutral-300 bg-neutral-50 rounded-md shadow-sm"
                  value={selectedElement.id || ''}
                  disabled
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
              <textarea 
                name="description"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                rows={2}
                value={selectedElement.description || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
        ) : activeTab === 'properties' ? (
          <div className="flex h-full items-center justify-center text-neutral-500">
            Select an element to view and edit its properties
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-500">
            {activeTab === 'issues' ? 'No issues found' : 
             activeTab === 'terminal' ? 'Terminal output will appear here' : 
             'Console output will appear here'}
          </div>
        )}
      </div>
    </div>
  );
}
