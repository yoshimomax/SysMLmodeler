# SysMLモデラー

モデルベースシステムズエンジニアリング（MBSE）のためのSysML v2モデリングツール。
TypeScriptとReactで構築され、JointJSを使用したダイアグラム編集機能を備えています。

## ディレクトリ構造

本プロジェクトは移行中のハイブリッド構造を採用しています。
新しい開発は `src/` ディレクトリを使用してください。

```
/
├── config/                   # 設定ファイル集約
│   ├── drizzle.config.ts     # Drizzle設定
│   ├── jest.config.js        # Jest設定
│   ├── postcss.config.js     # PostCSS設定
│   ├── tailwind.config.ts    # Tailwind設定
│   └── vite.config.ts        # Vite設定
│
├── public/                   # 静的アセット
│   ├── assets/               # 画像、アイコンなど
│   └── index.html            # メインHTMLファイル
│
├── src/                      # 新しいソースコード構造（推奨）
│   ├── client/               # フロントエンドコード
│   ├── server/               # バックエンドコード
│   ├── shared/               # 共有コード
│   ├── model/                # モデル定義
│   ├── store/                # 状態管理
│   ├── components/           # 共通コンポーネント
│   ├── services/             # サービス実装
│   ├── adapters/             # アダプター
│   ├── validators/           # バリデーター
│   └── __tests__/            # テスト
│
├── scripts/                  # 開発・デプロイ用スクリプト
│   ├── sync-old-to-new.sh    # 旧→新構造同期スクリプト
│   └── migrate-imports.js    # インポートパス変換スクリプト
│
├── client/                   # 元のクライアントコード（互換性用）
├── server/                   # 元のサーバーコード（互換性用）
├── shared/                   # 元の共有コード（互換性用）
├── model/                    # 元のモデルコード（互換性用）
└── package.json              # パッケージ設定
```

## 新旧構造について

### 新構造（推奨）

- `/src/` ディレクトリ内に全てのコードを集約
- 論理的に整理された階層構造
- モジュール間の関連性が明確
- パスエイリアスを使用した簡潔なインポートが可能

### 旧構造（互換性維持用）

- `/client/`, `/server/`, `/shared/`, `/model/` など
- アプリケーションの実行に必要
- 段階的に廃止予定

## 開発フロー

1. 変更の同期
   ```bash
   # 旧構造から新構造へファイルを同期
   ./scripts/sync-old-to-new.sh
   ```

2. インポートパスの変換
   ```bash
   # 新構造内のファイルのインポートパスを変換
   node scripts/migrate-imports.js
   ```

3. アプリケーションの実行
   ```bash
   npm run dev
   ```

## パスエイリアス

新構造では以下のエイリアスを使ってファイルをインポートできます：

- `@/*` → `src/client/*`
- `@shared/*` → `src/shared/*`
- `@model/*` → `src/model/*`
- `@store/*` → `src/store/*`
- `@components/*` → `src/components/*`
- `@services/*` → `src/services/*`
- `@validators/*` → `src/validators/*`
- `@adapters/*` → `src/adapters/*`
- `@assets/*` → `public/assets/*`

例：
```typescript
// 旧スタイル
import { Block } from "../../../model/Block";

// 新スタイル
import { Block } from "@model/Block";
```

## 今後の計画

1. 旧構造の段階的廃止
   - 将来的に `/client/`, `/server/` などを完全削除
   - Replitのワークフロー設定を更新し新構造を直接使用

2. リリースバージョンでの完全切替
   - バージョン X.Y.0 で新構造にのみ対応したリリースを予定
   - それまでの間はハイブリッド構造で互換性を維持

## 開発者向け注意事項

- 新規ファイルは必ず `/src/` 以下に作成してください
- 既存ファイルの編集後は `./scripts/sync-old-to-new.sh` を実行してください
- インポートパスは `@/` や `@model/` など、エイリアスを使用してください
- テストコードは `/src/__tests__/` 以下に配置してください