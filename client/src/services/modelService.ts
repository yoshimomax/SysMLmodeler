/**
 * Model Service for handling SysML model saving and loading operations
 */
import { SysMLModel } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { useAppStore } from '@/lib/store';

/**
 * 指定したモデルをデータベースに保存します
 * @param model SysMLモデル
 * @param filename ファイル名（デフォルトは 'project.sysml'）
 * @param fileId 既存のファイルID（更新の場合）
 */
export async function saveModelToFile(
  model: SysMLModel, 
  filename = 'project.sysml', 
  fileId?: number
): Promise<boolean> {
  try {
    console.log('モデル保存開始:', filename);
    // モデルをJSON形式にシリアライズ
    const modelJson = JSON.stringify(model, null, 2);
    console.log('モデルをシリアライズしました（サイズ:' + modelJson.length + 'バイト）');
    
    // サーバーにデータを送信（データベースに保存）
    console.log('APIリクエスト開始: /api/models/save');
    const response = await apiRequest(
      'POST',
      `/api/models/save`,
      {
        filename,
        content: modelJson,
        fileId // 既存のファイルIDがあれば送信（更新の場合）
      }
    );
    
    console.log('サーバーからのレスポンス:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`サーバーエラー: ${errorData.error || response.statusText}. ${errorData.details || ''}`);
    }
    
    const data = await response.json();
    console.log('保存成功、サーバーレスポンス:', data);
    
    // 成功メッセージを表示
    useAppStore.getState().setStatusMessage({
      text: `モデル "${filename}" を保存しました`,
      type: 'success',
    });
    
    // 保存後は変更フラグをリセット
    useAppStore.getState().setIsDirty(false);
    
    // レスポンスにモデルIDが含まれていれば保存
    if (data?.model?.id) {
      console.log(`Model saved with ID: ${data.model.id}`);
      console.log(`File ID: ${data.file?.id || 'unknown'}`);
    }
    
    return true;
  } catch (error) {
    // エラーの詳細を取得
    const errorMessage = error instanceof Error 
      ? error.message 
      : (typeof error === 'object' && error !== null) 
        ? JSON.stringify(error)
        : '不明なエラー';
    
    // エラーメッセージを表示
    useAppStore.getState().setStatusMessage({
      text: `モデルの保存に失敗しました: ${errorMessage}`,
      type: 'error',
    });
    
    // 詳細なログ
    console.error('Error saving model:', error);
    if (error instanceof Error && error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    return false;
  }
}

/**
 * データベースからモデルを読み込みます
 * @param filename ファイル名（デフォルトは 'project.sysml'）
 * @param modelId モデルID（指定した場合はファイル名より優先）
 */
export async function loadModelFromFile(
  filename = 'project.sysml', 
  modelId?: number
): Promise<SysMLModel | null> {
  try {
    console.log('モデル読み込み開始:', filename);
    // APIリクエストURLを構築
    let url = `/api/models/load`;
    if (modelId) {
      url += `?id=${modelId}`;
      console.log(`モデルIDで読み込み: ${modelId}`);
    } else if (filename) {
      url += `?filename=${encodeURIComponent(filename)}`;
      console.log(`ファイル名で読み込み: ${filename}`);
    }
    
    // サーバーからモデルデータを要求
    console.log('APIリクエスト開始:', url);
    const response = await apiRequest('GET', url);
    console.log('サーバーからのレスポンス:', response.status);
    
    // 404の場合は初期モデルを作成する処理へ
    if (response.status === 404) {
      console.log('ファイルまたはモデルが見つかりません。新しく作成します。');
      const errorData = await response.json();

      // サーバーから初期モデルが返された場合はそれを使用
      if (errorData.initialModel) {
        console.log('サーバーから初期モデルを受信:', errorData.initialModel);
        
        useAppStore.getState().setStatusMessage({
          text: '新しいモデルを作成します',
          type: 'info',
        });
        
        return errorData.initialModel;
      }
      
      // 通常のエラー処理へ
      throw new Error(`ファイルが見つかりません: ${filename}`);
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`サーバーエラー: ${errorData.error || response.statusText}. ${errorData.details || ''}`);
    }
    
    const data = await response.json();
    console.log('読み込み成功、サーバーレスポンス:', data);
    
    if (!data.content) {
      throw new Error('無効なモデルフォーマット');
    }
    
    // JSONからモデルデータをパース
    console.log('モデルデータを解析中...');
    const model: SysMLModel = JSON.parse(data.content);
    console.log('モデル解析完了');
    
    // データベースのモデルIDをモデルに保持（後で更新に使用）
    if (data.model?.id) {
      // @ts-ignore - id is not part of SysMLModel but we need it for tracking
      model._dbId = data.model.id;
      console.log(`Loaded model with DB ID: ${data.model.id}`);
    }
    
    // ステータスメッセージの更新
    useAppStore.getState().setStatusMessage({
      text: `モデル "${data.filename || filename}" を読み込みました`,
      type: 'success',
    });
    
    // ダイアグラムが空の場合の処理
    if (!model.diagrams || model.diagrams.length === 0) {
      console.log('ダイアグラムが存在しません。初期ダイアグラムを作成します。');
      model.diagrams = [{
        id: crypto.randomUUID(),
        name: 'Main Diagram',
        type: 'block',
        elements: [],
        relationships: []
      }];
    }
    
    // モデルが空の場合はダミーデータを作成しない（null を返して新規作成処理へ）
    if (!model.elements || model.elements.length === 0) {
      console.log('モデルが空です。');
    }
    
    return model;
  } catch (error) {
    // エラーハンドリング
    if (error instanceof Error && error.message.includes('not found')) {
      // 初回実行時など、ファイルが見つからない場合は必ずしもエラーではない
      console.log('ファイルが見つからないため、新規モデルを作成します');
      useAppStore.getState().setStatusMessage({
        text: '新しいモデルを作成します',
        type: 'info',
      });
      return null;
    }
    
    // エラーの詳細を取得
    const errorMessage = error instanceof Error 
      ? error.message 
      : (typeof error === 'object' && error !== null) 
        ? JSON.stringify(error)
        : '不明なエラー';
    
    // エラーメッセージの表示
    useAppStore.getState().setStatusMessage({
      text: `モデルの読み込みに失敗しました: ${errorMessage}`,
      type: 'error',
    });
    
    // 詳細なログ
    console.error('Error loading model:', error);
    if (error instanceof Error && error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    return null;
  }
}

/**
 * Set up event listener for beforeunload to check for unsaved changes
 */
export function setupBeforeUnloadListener(): void {
  window.addEventListener('beforeunload', (event) => {
    // If there are unsaved changes, show a confirmation dialog
    if (useAppStore.getState().isDirty) {
      // Standard way to show a confirmation dialog before page unload
      event.preventDefault();
      event.returnValue = '';
      return '';
    }
  });
}

/**
 * 現在のモデルを自動保存します
 */
export async function autoSaveModel(): Promise<boolean> {
  // ストアから現在の状態を取得
  const state = useAppStore.getState();
  
  // 変更がある場合のみ保存
  if (!state.isDirty) {
    return true;
  }
  
  try {
    // 現在のモデルを取得
    const model = state.saveModel();
    
    // モデルのデータベースIDがあれば使用（同じレコードを更新）
    // @ts-ignore - _dbId property
    const dbId = model._dbId;
    
    // 自動保存用の名前とファイルIDで保存
    await saveModelToFile(
      model, 
      'autosave.sysml',
      dbId ? parseInt(dbId) : undefined
    );
    
    // 静かに通知（ポップアップなし）
    state.setStatusMessage({
      text: '自動保存しました',
      type: 'info',
    });
    
    return true;
  } catch (error) {
    console.error('自動保存に失敗しました:', error);
    return false;
  }
}

/**
 * Set up periodic auto-save
 * @param intervalMs Interval in milliseconds between auto-saves
 */
export function setupAutoSave(intervalMs = 60000): () => void {
  // Set up an interval for auto-saving
  const intervalId = setInterval(autoSaveModel, intervalMs);
  
  // Return a function to cancel the auto-save
  return () => clearInterval(intervalId);
}