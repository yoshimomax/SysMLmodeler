import { useAppStore } from '@/lib/store';

export default function StatusBar() {
  const { statusMessage } = useAppStore();
  
  return (
    <footer className="bg-neutral-700 text-white py-1 px-4 text-xs flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span>SysML v2 MBSE Tool</span>
        <span>TypeScript</span>
        <span>React</span>
      </div>
      <div className="flex items-center space-x-4">
        <span>{statusMessage.text}</span>
        <span>No errors</span>
      </div>
    </footer>
  );
}
