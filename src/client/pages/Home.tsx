import { useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import Sidebar from '@/components/Sidebar';
import DiagramEditor from '@/components/DiagramEditor';
import PropertyPanel from '@/components/PropertyPanel';
import Toolbar from '@/components/Toolbar';
import TabBar from '@/components/TabBar';
import StatusBar from '@/components/StatusBar';
import { useAppStore } from '@/lib/store';
import { TreeItemData } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { saveModelToFile, loadModelFromFile, setupAutoSave } from '@/services/modelService';

export default function Home() {
  // ダイアログ状態
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [filename, setFilename] = useState('project.sysml');
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    setProjectFiles, 
    selectedElement,
    setSelectedElement,
    statusMessage,
    user,
    currentModel,
    saveModel,
    loadModel,
    createNewModel,
    isDirty,
    setIsDirty
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

  // 自動保存セットアップ
  useEffect(() => {
    // 60秒ごとに自動保存
    const cancelAutoSave = setupAutoSave(60000);
    return () => cancelAutoSave();
  }, []);
  
  // モデル読み込み処理
  const handleLoadModel = async () => {
    try {
      setIsLoading(true);
      const model = await loadModelFromFile(filename);
      
      if (model) {
        // モデルをZustandストアにロード
        loadModel(model);
        toast({
          title: 'モデルを読み込みました',
          description: `${filename}からモデルを正常に読み込みました。`,
        });
      } else {
        // 新しいモデルを作成
        createNewModel('新しいモデル');
        toast({
          title: '新しいモデルを作成しました',
          description: 'ファイルが見つからなかったため、新しいモデルを作成しました。',
        });
      }
      
      setLoadDialogOpen(false);
    } catch (error) {
      toast({
        title: 'エラー',
        description: `モデルの読み込みに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // モデル保存処理
  const handleSaveModel = async () => {
    try {
      setIsLoading(true);
      
      // 現在のモデルを取得して保存
      const model = saveModel();
      const success = await saveModelToFile(model, filename);
      
      if (success) {
        setIsDirty(false);
        toast({
          title: 'モデルを保存しました',
          description: `${filename}にモデルを正常に保存しました。`,
        });
        setSaveDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: `モデルの保存に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-neutral-100 font-sans text-neutral-900 h-screen flex flex-col overflow-hidden">
      <AppHeader />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-neutral-200 p-2 flex items-center justify-between">
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setSaveDialogOpen(true)}
              >
                保存
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setLoadDialogOpen(true)}
              >
                読み込み
              </Button>
            </div>
            
            <div className="flex items-center">
              {isDirty && (
                <span className="text-orange-500 text-sm mr-2">
                  未保存の変更があります
                </span>
              )}
            </div>
          </div>
          
          <TabBar />
          
          <div className="flex-1 flex overflow-hidden">
            <DiagramEditor />
          </div>
          
          <PropertyPanel />
        </div>
      </div>
      
      <StatusBar />
      
      {/* 保存ダイアログ */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>モデルを保存</DialogTitle>
            <DialogDescription>
              モデルの保存先ファイル名を指定してください。
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="filename">
                ファイル名
              </label>
              <input
                id="filename"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="project.sysml"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSaveModel}
              disabled={isLoading}
            >
              {isLoading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 読み込みダイアログ */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>モデルを読み込み</DialogTitle>
            <DialogDescription>
              読み込むモデルのファイル名を指定してください。
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="load-filename">
                ファイル名
              </label>
              <input
                id="load-filename"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="project.sysml"
              />
            </div>
            
            {isDirty && (
              <div className="text-orange-500 text-sm">
                未保存の変更があります。読み込みを続けると変更内容が失われます。
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLoadDialogOpen(false)}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleLoadModel}
              disabled={isLoading}
            >
              {isLoading ? '読み込み中...' : '読み込み'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
