import { TreeItemData } from '@/types';

interface TreeItemProps {
  item: TreeItemData;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

export default function TreeItem({ item, onSelect, onToggleExpand }: TreeItemProps) {
  const { id, name, type, icon, children, expanded, selected } = item;
  
  const handleSummaryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleExpand(id);
  };
  
  const handleItemClick = () => {
    onSelect(id);
  };
  
  const isFolder = type === 'folder';
  const itemClasses = `flex items-center hover:bg-neutral-100 rounded px-2 py-1 cursor-pointer ${selected ? 'bg-neutral-100 text-primary font-medium' : ''}`;
  const iconClasses = `material-icons ${selected ? 'text-primary' : 'text-neutral-500'} mr-1 text-sm`;
  
  return (
    <div className="py-1">
      {isFolder ? (
        <details open={expanded}>
          <summary 
            className="flex items-center cursor-pointer hover:bg-neutral-100 rounded px-2 py-1"
            onClick={handleSummaryClick}
          >
            <span className="material-icons text-neutral-500 mr-1 text-sm">folder</span>
            <span className="font-medium">{name}</span>
          </summary>
          <div className="ml-5 mt-1">
            {children?.map(child => (
              <TreeItem 
                key={child.id} 
                item={child} 
                onSelect={onSelect}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </div>
        </details>
      ) : (
        <div className={itemClasses} onClick={handleItemClick}>
          <span className={iconClasses}>{icon || 'description'}</span>
          <span>{name}</span>
        </div>
      )}
    </div>
  );
}
