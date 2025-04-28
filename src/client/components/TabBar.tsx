import { useAppStore } from '@/lib/store';

export default function TabBar() {
  const { tabs, setActiveTab, closeTab } = useAppStore();
  
  return (
    <div className="bg-neutral-50 border-b border-neutral-200 flex">
      <div className="flex items-center">
        {tabs.length > 0 ? (
          tabs.map(tab => (
            <div 
              key={tab.id} 
              className={`px-4 py-2 flex items-center space-x-1 border-r border-neutral-200 ${tab.active ? 'bg-white' : 'text-neutral-600'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.name}</span>
              <button 
                className="ml-1 p-0.5 rounded-full hover:bg-neutral-200"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                <span className="material-icons text-xs">close</span>
              </button>
            </div>
          ))
        ) : (
          <div className="px-4 py-2 text-neutral-500">No open files</div>
        )}
      </div>
    </div>
  );
}
