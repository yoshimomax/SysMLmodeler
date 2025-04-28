/**
 * consistency.ts モジュールのテスト
 */
import { ModelEventEmitter, modelEvents } from '../../shared/consistency';

describe('ModelEventEmitter', () => {
  let emitter: ModelEventEmitter;
  
  beforeEach(() => {
    // 各テスト前に新しいインスタンスを作成
    emitter = new ModelEventEmitter();
  });
  
  test('イベントを発行して正しくリスナーが呼び出されること', () => {
    // リスナー関数をモック
    const listener = jest.fn();
    
    // イベントをリッスン
    emitter.on('test:event', listener);
    
    // イベントを発行
    emitter.emit('test:event', { data: 'test data' });
    
    // リスナーが呼び出されたか確認
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ data: 'test data' });
  });
  
  test('off()で指定したリスナーが削除されること', () => {
    // リスナー関数をモック
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    
    // 2つのリスナーを登録
    emitter.on('test:event', listener1);
    emitter.on('test:event', listener2);
    
    // 1つ目のリスナーを削除
    emitter.off('test:event', listener1);
    
    // イベント発行後、2つ目のリスナーのみ呼び出されること
    emitter.emit('test:event', {});
    
    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalledTimes(1);
  });
  
  test('once()で登録したリスナーは1回だけ呼び出されること', () => {
    // リスナー関数をモック
    const listener = jest.fn();
    
    // onceでイベントをリッスン
    emitter.once('test:event', listener);
    
    // イベントを2回発行
    emitter.emit('test:event', { count: 1 });
    emitter.emit('test:event', { count: 2 });
    
    // リスナーが1回だけ呼び出されたか確認
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ count: 1 });
  });
  
  test('removeAllListeners()で指定したイベントの全リスナーが削除されること', () => {
    // リスナー関数をモック
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();
    
    // 複数のイベントタイプにリスナーを登録
    emitter.on('event1', listener1);
    emitter.on('event1', listener2);
    emitter.on('event2', listener3);
    
    // event1のすべてのリスナーを削除
    emitter.removeAllListeners('event1');
    
    // イベント発行
    emitter.emit('event1', {});
    emitter.emit('event2', {});
    
    // event1のリスナーは呼び出されず、event2のリスナーは呼び出されるか確認
    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).not.toHaveBeenCalled();
    expect(listener3).toHaveBeenCalledTimes(1);
  });
  
  test('removeAllListeners()（引数なし）で全イベントの全リスナーが削除されること', () => {
    // リスナー関数をモック
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    
    // 複数のイベントタイプにリスナーを登録
    emitter.on('event1', listener1);
    emitter.on('event2', listener2);
    
    // すべてのリスナーを削除
    emitter.removeAllListeners();
    
    // イベント発行
    emitter.emit('event1', {});
    emitter.emit('event2', {});
    
    // どのリスナーも呼び出されないか確認
    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).not.toHaveBeenCalled();
  });
  
  test('リスナー内でエラーが発生しても他のリスナーは実行されること', () => {
    // リスナー関数をモック
    const errorListener = jest.fn().mockImplementation(() => {
      throw new Error('テストエラー');
    });
    const normalListener = jest.fn();
    
    // コンソールエラーをスパイ化して警告を抑制
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // 両方のリスナーを登録
    emitter.on('test:event', errorListener);
    emitter.on('test:event', normalListener);
    
    // イベント発行
    emitter.emit('test:event', {});
    
    // エラーが発生しても、2つ目のリスナーが呼び出されるか確認
    expect(errorListener).toHaveBeenCalledTimes(1);
    expect(normalListener).toHaveBeenCalledTimes(1);
    
    // コンソールエラーが呼び出されたか確認
    expect(console.error).toHaveBeenCalled();
    
    // モックを元に戻す
    (console.error as jest.Mock).mockRestore();
  });
});

describe('modelEvents シングルトン', () => {
  test('モデルイベントシングルトンが正しく機能すること', () => {
    // リスナー関数をモック
    const listener = jest.fn();
    
    // グローバルシングルトンでイベントをリッスン
    modelEvents.on('model:update', listener);
    
    // イベントを発行
    modelEvents.emit('model:update', { type: 'update', element: { id: '123' } });
    
    // リスナーが呼び出されたか確認
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ type: 'update', element: { id: '123' } });
    
    // リスナーをクリア
    modelEvents.removeAllListeners('model:update');
  });
});