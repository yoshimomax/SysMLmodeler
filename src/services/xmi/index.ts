export * from './XmiExporter';
export * from './XmiImporter';

/**
 * SysMLモデルのXMIファイル形式
 * XMI (XML Metadata Interchange) は、
 * モデルを交換するためのOMG標準形式です。
 * 
 * SysML v2で対応されている機能:
 * - ブロック定義
 * - 属性 (プロパティ)
 * - ポート
 * - コネクタ (フロー、関連)
 * - 包含関係 (コンポジション)
 * - 一般化 (継承)
 * - ステレオタイプ
 * - 多重度
 * - 制約
 */
export const SysML_XMI_VERSION = '2.5.1';
export const SysML_NAMESPACE = 'http://www.omg.org/spec/SysML/20230201';
export const UML_NAMESPACE = 'http://www.omg.org/spec/UML/20161101';
export const XMI_NAMESPACE = 'http://www.omg.org/spec/XMI/20131001';

/**
 * XMIファイルの拡張子とMIMEタイプ
 */
export const XMI_FILE_EXTENSION = '.xmi';
export const XMI_MIME_TYPE = 'application/xmi+xml';

/**
 * 他のツールとのインポート/エクスポート時の注意点
 */
export const XMI_COMPATIBILITY_NOTES = `
SysML v2 XMIエクスポート/インポート互換性ノート:

1. このツールからエクスポートされたXMIファイルは以下のツールと互換性があります:
   - Eclipse Papyrus (SysML 1.6)
   - IBM Rhapsody (要変換プラグイン)
   - Cameo Systems Modeler (SysML 1.6)

2. インポート時の注意:
   - SysML 1.x からSysML 2.0へのマッピングは完全に1:1ではありません
   - 一部の高度な機能は変換されない場合があります
   - ダイアグラムレイアウトは部分的にのみ保持されます

3. モデル要素名の制限:
   - 特殊文字 (&, <, >, ", ') は正しくエスケープされますが、避けることを推奨
   - 要素名の長さは255文字以内を推奨
`;

/**
 * XMIに関連するエラー種別
 */
export enum XmiErrorType {
  PARSE_ERROR = 'PARSE_ERROR',
  MISSING_ELEMENT = 'MISSING_ELEMENT',
  INVALID_FORMAT = 'INVALID_FORMAT',
  COMPATIBILITY_ERROR = 'COMPATIBILITY_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * XMIエラー情報
 */
export interface XmiError {
  type: XmiErrorType;
  message: string;
  details?: string;
  lineNumber?: number;
  columnNumber?: number;
}