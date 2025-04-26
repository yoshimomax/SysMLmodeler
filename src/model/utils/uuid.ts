import { v4 as uuidv4 } from 'uuid';

/**
 * 新しいUUIDを生成する
 * @returns 生成されたUUID文字列
 */
export function generateUUID(): string {
  return uuidv4();
}

/**
 * 有効なUUID形式かどうかをチェックする
 * @param id チェックする文字列
 * @returns 有効なUUID形式であればtrue、そうでなければfalse
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * デフォルトのIDを生成する
 * 引数がnullまたはundefinedの場合、新しいUUIDを生成して返す
 * 引数が有効なUUIDの場合はそのまま返す
 * @param id 既存のID（オプション）
 * @returns 有効なUUID
 */
export function ensureUUID(id?: string | null): string {
  if (!id) {
    return generateUUID();
  }
  
  if (isValidUUID(id)) {
    return id;
  }
  
  return generateUUID();
}