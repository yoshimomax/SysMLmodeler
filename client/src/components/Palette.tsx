import { useAppStore } from '@/lib/store';

export default function Palette() {
  const { paletteItems, selectedPaletteItem, setSelectedPaletteItem } = useAppStore();
  
  // Group items by category
  const itemsByCategory = paletteItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof paletteItems>);
  
  return (
    <div className="absolute right-4 top-4 bottom-4 w-48 bg-white border border-neutral-200 rounded-lg shadow-md flex flex-col">
      <div className="p-3 border-b border-neutral-200">
        <h3 className="font-medium text-sm">Palette</h3>
      </div>
      <div className="p-2 flex-1 overflow-y-auto">
        {Object.entries(itemsByCategory).map(([category, items]) => (
          <div key={category} className="mb-2">
            <h4 className="text-xs font-medium text-neutral-500 mb-1 px-1">{category}</h4>
            {items.map(item => (
              <div 
                key={item.id}
                className={`p-2 hover:bg-neutral-100 rounded cursor-pointer flex items-center ${selectedPaletteItem?.id === item.id ? 'bg-neutral-100' : ''}`}
                onClick={() => setSelectedPaletteItem(item)}
              >
                <span className="material-icons text-sm mr-2 text-neutral-700">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
