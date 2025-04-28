import { useAppStore } from '@/lib/store';

export default function Toolbar() {
  const { currentView, setCurrentView } = useAppStore();
  
  return (
    <div className="bg-white border-b border-neutral-200 p-2 flex items-center space-x-2">
      <div className="flex space-x-1">
        <button className="p-1.5 rounded hover:bg-neutral-100 text-neutral-700" aria-label="Save">
          <span className="material-icons text-sm">save</span>
        </button>
        <button className="p-1.5 rounded hover:bg-neutral-100 text-neutral-700" aria-label="Undo">
          <span className="material-icons text-sm">undo</span>
        </button>
        <button className="p-1.5 rounded hover:bg-neutral-100 text-neutral-700" aria-label="Redo">
          <span className="material-icons text-sm">redo</span>
        </button>
      </div>
      <div className="h-5 border-r border-neutral-300"></div>
      <div className="flex space-x-1">
        <button className="p-1.5 rounded hover:bg-neutral-100 text-neutral-700" aria-label="Package">
          <span className="material-icons text-sm">folder</span>
        </button>
        <button className="p-1.5 rounded hover:bg-neutral-100 text-neutral-700" aria-label="Class">
          <span className="material-icons text-sm">view_module</span>
        </button>
        <button className="p-1.5 rounded hover:bg-neutral-100 text-neutral-700" aria-label="Action">
          <span className="material-icons text-sm">bolt</span>
        </button>
        <button className="p-1.5 rounded hover:bg-neutral-100 text-neutral-700" aria-label="Relationship">
          <span className="material-icons text-sm">timeline</span>
        </button>
      </div>
      <div className="h-5 border-r border-neutral-300"></div>
      <div className="flex space-x-1">
        <button className="p-1.5 rounded hover:bg-neutral-100 text-neutral-700" aria-label="Run">
          <span className="material-icons text-sm">play_arrow</span>
        </button>
        <button className="p-1.5 rounded hover:bg-neutral-100 text-neutral-700" aria-label="Debug">
          <span className="material-icons text-sm">bug_report</span>
        </button>
      </div>
      <div className="flex-1"></div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-neutral-500">View:</span>
        <button 
          className={`px-2 py-1 rounded text-sm ${currentView === 'diagram' ? 'bg-primary text-white' : 'hover:bg-neutral-100'}`}
          onClick={() => setCurrentView('diagram')}
        >
          Diagram
        </button>
        <button 
          className={`px-2 py-1 rounded text-sm ${currentView === 'code' ? 'bg-primary text-white' : 'hover:bg-neutral-100'}`}
          onClick={() => setCurrentView('code')}
        >
          Code
        </button>
        <button 
          className={`px-2 py-1 rounded text-sm ${currentView === 'split' ? 'bg-primary text-white' : 'hover:bg-neutral-100'}`}
          onClick={() => setCurrentView('split')}
        >
          Split
        </button>
      </div>
    </div>
  );
}
