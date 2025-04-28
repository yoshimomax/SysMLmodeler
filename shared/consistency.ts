/**
 * ModelEventEmitter クラス
 * ブラウザ環境でも動作するイベントエミッタークラス
 */
export class ModelEventEmitter {
  private listeners: { [event: string]: Array<(payload: any) => void> } = {};

  /**
   * イベントをリッスンします
   * @param event イベント名
   * @param listener イベントリスナー関数
   */
  on(event: string, listener: (payload: any) => void): this {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
    return this;
  }

  /**
   * イベントリスナーを削除します
   * @param event イベント名
   * @param listener 削除するリスナー関数
   */
  off(event: string, listener: (payload: any) => void): this {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    }
    return this;
  }

  /**
   * 一度だけ実行されるイベントリスナーを追加します
   * @param event イベント名
   * @param listener イベントリスナー関数
   */
  once(event: string, listener: (payload: any) => void): this {
    const onceWrapper = (payload: any) => {
      listener(payload);
      this.off(event, onceWrapper);
    };
    return this.on(event, onceWrapper);
  }

  /**
   * イベントを発行します
   * @param event イベント名
   * @param payload イベントペイロード
   */
  emit(event: string, payload: any): boolean {
    if (!this.listeners[event]) {
      return false;
    }
    
    // リスナーの配列をコピーしてから実行（実行中にリスナーが変更されるのを防ぐ）
    const currentListeners = [...this.listeners[event]];
    for (const listener of currentListeners) {
      try {
        listener(payload);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    }
    
    return true;
  }

  /**
   * 特定のイベントの全リスナーを削除します
   * @param event イベント名（省略時は全イベントのリスナーを削除）
   */
  removeAllListeners(event?: string): this {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
    return this;
  }
}

/**
 * プロジェクト全体で共有するための ModelEventEmitter シングルトンインスタンス
 */
export const modelEvents = new ModelEventEmitter();