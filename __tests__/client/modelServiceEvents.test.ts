/**
 * modelService.tsのイベント発行機能のテスト
 */
import { modelEvents } from '../../shared/consistency';
import { saveModelToFile, loadModelFromFile } from '../../client/src/services/modelService';

// apiRequest をモック
jest.mock('../../client/src/lib/queryClient', () => ({
  apiRequest: jest.fn()
}));

// useAppStore をモック
jest.mock('../../client/src/lib/store', () => ({
  useAppStore: {
    getState: jest.fn().mockReturnValue({
      setStatusMessage: jest.fn(),
      setIsDirty: jest.fn(),
      saveModel: jest.fn()
    })
  }
}));

// apiRequestのモックインポート
import { apiRequest } from '../../client/src/lib/queryClient';

describe('modelService イベント発行機能', () => {
  let mockApiResponse: any;
  const mockModel = { 
    id: 'test-model',
    diagrams: [],
    elements: []
  };
  
  beforeEach(() => {
    // テスト前にmockをリセット
    jest.clearAllMocks();
    
    // apiRequestのモックレスポンスを設定
    mockApiResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        success: true,
        model: { id: 123 },
        file: { id: 456 }
      })
    };
    (apiRequest as jest.Mock).mockResolvedValue(mockApiResponse);
    
    // modelEventsのリスナーをクリア
    modelEvents.removeAllListeners();
  });
  
  test('saveModelToFile成功時にmodel:updateイベントが発行されること', async () => {
    // model:updateイベントリスナーをモック
    const listener = jest.fn();
    modelEvents.on('model:update', listener);
    
    // saveModelToFileを呼び出し
    await saveModelToFile(mockModel, 'test.sysml');
    
    // イベントリスナーが呼び出されたか確認
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      type: 'update',
      model: {
        id: 123,
        filename: 'test.sysml',
        model: mockModel
      }
    });
  });
  
  test('loadModelFromFile成功時にmodel:updateイベントが発行されること', async () => {
    // mockApiResponseを変更してloadModelFromFile用に設定
    mockApiResponse.json = jest.fn().mockResolvedValue({
      model: { id: 123 },
      filename: 'test.sysml',
      content: JSON.stringify(mockModel)
    });
    
    // model:updateイベントリスナーをモック
    const listener = jest.fn();
    modelEvents.on('model:update', listener);
    
    // loadModelFromFileを呼び出し
    await loadModelFromFile('test.sysml');
    
    // イベントリスナーが呼び出されたか確認
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0]).toMatchObject({
      type: 'load',
      model: {
        id: 123,
        filename: 'test.sysml'
      }
    });
  });
  
  test('saveModelToFile失敗時にはイベントが発行されないこと', async () => {
    // apiRequestのモックを失敗レスポンスに変更
    mockApiResponse.ok = false;
    mockApiResponse.status = 500;
    mockApiResponse.json = jest.fn().mockResolvedValue({
      error: 'サーバーエラー'
    });
    
    // model:updateイベントリスナーをモック
    const listener = jest.fn();
    modelEvents.on('model:update', listener);
    
    // saveModelToFileを呼び出し
    await saveModelToFile(mockModel, 'test.sysml');
    
    // イベントリスナーが呼び出されていないか確認
    expect(listener).not.toHaveBeenCalled();
  });
});