import { useAppStore } from '@/lib/store';

export default function AppHeader() {
  const { user } = useAppStore();
  
  return (
    <header className="bg-primary text-white shadow-md z-10">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="material-icons">developer_board</span>
          <h1 className="text-xl font-medium">SysML v2 MBSE Tool</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-primary-dark" aria-label="Settings">
            <span className="material-icons">settings</span>
          </button>
          <button className="p-2 rounded-full hover:bg-primary-dark" aria-label="Help">
            <span className="material-icons">help_outline</span>
          </button>
          <div className="flex items-center space-x-2 ml-4">
            <span className="material-icons">account_circle</span>
            <span>{user?.name || 'User'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
