/**
 * SysMLスキーマバリデータ
 * OMGのSysML v2 およびKerML JSONスキーマを使用して、モデル要素の検証を行う
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * バリデーションエラーを格納するクラス
 */
export class ValidationError extends Error {
  details: any[];

  constructor(message: string, details: any[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

/**
 * スキーマの種類
 */
export enum SchemaType {
  KerML = 'KerML',
  SysML = 'SysML'
}

/**
 * JSONスキーマを使用してモデル要素を検証するクラス
 */
export class SchemaValidator {
  private static kermlSchema: any;
  private static sysmlSchema: any;
  private static initialized = false;

  /**
   * バリデータを初期化する
   */
  private static initialize(): void {
    if (this.initialized) return;

    try {
      // スキーマファイルの読み込み
      const kermlSchemaPath = path.resolve(__dirname, '../schemas/KerML.json');
      const sysmlSchemaPath = path.resolve(__dirname, '../schemas/SysML.json');
      
      this.kermlSchema = JSON.parse(fs.readFileSync(kermlSchemaPath, 'utf8'));
      this.sysmlSchema = JSON.parse(fs.readFileSync(sysmlSchemaPath, 'utf8'));
      
      this.initialized = true;
    } catch (error) {
      console.error('スキーマの初期化に失敗しました:', error);
      throw new Error('スキーマの初期化に失敗しました: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * モデル要素の基本的な検証を行う
   * @param element 検証するモデル要素
   * @param schemaType 使用するスキーマの種類
   * @throws ValidationError 検証に失敗した場合
   */
  public static validate(element: any, schemaType: SchemaType): void {
    if (!this.initialized) {
      this.initialize();
    }

    // 基本的な検証
    if (!element) {
      throw new ValidationError('検証する要素がnullまたはundefinedです');
    }

    if (!element.id) {
      throw new ValidationError('要素にIDがありません');
    }

    if (!element.__type) {
      throw new ValidationError('要素に__typeがありません');
    }

    // スキーマ定義に基づいて必須フィールドの存在確認
    // 注: 本来はAjvなどのバリデーションライブラリを使うべきですが、依存関係を減らすために
    // ここでは基本的な検証のみを実装しています
    const schema = schemaType === SchemaType.KerML ? this.kermlSchema : this.sysmlSchema;
    this.validateAgainstSchema(element, schema, element.__type);
  }

  /**
   * スキーマに対して要素を検証
   * @param element 検証する要素
   * @param schema スキーマ
   * @param typeName 要素の型名
   */
  private static validateAgainstSchema(element: any, schema: any, typeName: string): void {
    // 基本的な型チェック（実際のプロダクションコードではより厳密に実装する必要があります）
    const typeDefinition = this.findTypeDefinition(schema, typeName);
    if (!typeDefinition) {
      console.warn(`スキーマ内に型 "${typeName}" の定義が見つかりません`);
      return;
    }

    // 必須プロパティの検証
    if (typeDefinition.required) {
      for (const requiredProp of typeDefinition.required) {
        if (element[requiredProp] === undefined) {
          throw new ValidationError(`必須プロパティ "${requiredProp}" が要素 "${element.id}" に存在しません`);
        }
      }
    }
  }

  /**
   * スキーマ内から型定義を探す
   * @param schema スキーマ
   * @param typeName 型名
   */
  private static findTypeDefinition(schema: any, typeName: string): any {
    if (!schema.definitions) return null;
    
    return schema.definitions[typeName] || null;
  }

  /**
   * JSONスキーマ定義からプロパティの説明を取得
   * @param typeName 型名
   * @param propertyName プロパティ名
   * @param schemaType スキーマタイプ
   * @returns プロパティの説明またはnull
   */
  public static getPropertyDescription(
    typeName: string, 
    propertyName: string, 
    schemaType: SchemaType
  ): string | null {
    if (!this.initialized) {
      this.initialize();
    }

    const schema = schemaType === SchemaType.KerML ? this.kermlSchema : this.sysmlSchema;
    const typeDefinition = this.findTypeDefinition(schema, typeName);
    
    if (!typeDefinition || !typeDefinition.properties) return null;
    
    const property = typeDefinition.properties[propertyName];
    return property && property.description ? property.description : null;
  }
}