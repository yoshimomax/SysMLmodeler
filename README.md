# SysMLモデラー

モデルベースシステムズエンジニアリング（MBSE）のためのSysML v2モデリングツール。
TypeScriptとReactで構築され、JointJSを使用したダイアグラム編集機能を備えています。

## ディレクトリ構造

本プロジェクトは新構成への移行を完了し、すべての開発は`src/`ディレクトリで行われます。

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
├── src/                      # ソースコード（主要開発ディレクトリ）
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
│   ├── sync-all.sh           # 全同期スクリプト
│   ├── sync-config.sh        # 設定ファイル同期
│   ├── sync-assets.sh        # アセット同期
│   ├── sync-old-to-new.sh    # ソースコード同期
│   ├── sync-tests.sh         # テスト同期
│   └── migrate-imports.mjs   # インポートパス変換
│
├── MIGRATION.md              # 移行ドキュメント
└── package.json              # パッケージ設定
```

> **注意**: 移行期間中は旧構造(`client/`, `server/`, `shared/`, `model/`など)が残っていますが、これらは参照せず、常に`src/`内のファイルを編集してください。

## 開発ガイド

### 環境セットアップ

```bash
# 依存関係のインストール
npm install

# データベースの準備
npm run db:push
```

### 開発サーバーの起動

```bash
# 開発サーバー起動
npm run dev

# または同期スクリプト実行後に起動
./scripts/sync-all.sh && npm run dev
```

### テスト実行

```bash
# 全テスト実行
npm test

# 特定のテストディレクトリを実行
npm test -- src/__tests__/sysml2
```

### ビルド

```bash
# プロダクションビルド
npm run build

# ビルド後の起動
npm start
```

## パスエイリアス

コード内では以下のエイリアスを使用してインポートできます：

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
// 推奨スタイル
import { PartDefinition } from "@model/sysml2/PartDefinition";
import { DiagramWorkspace } from "@components/DiagramWorkspace";
import { useModelStore } from "@store/modelStore";
```

## 移行期間中の開発ワークフロー

現在のプロジェクトは移行フェーズにあります。新開発は以下のワークフローに従ってください：

1. **常に`src/`ディレクトリ内のファイルを編集**
   - 旧構造のファイル(`client/`, `server/`など)は直接編集しない

2. **変更後に同期スクリプトを実行**
   ```bash
   ./scripts/sync-all.sh
   ```

3. **アプリケーションの再起動とテスト**
   ```bash
   npm run dev
   npm test
   ```

4. **CIテスト前に同期を確認**
   - PR作成前に必ず同期スクリプトを実行し、すべてのコードがsrcディレクトリに反映されていることを確認

## 開発者向け注意事項

- すべての新規ファイルは必ず`/src/`以下に作成してください
- インポートパスには必ずエイリアス(`@/`, `@model/`など)を使用してください
- テストコードは`/src/__tests__/`以下に配置してください
- シンプルで一貫性のあるコードスタイルを維持してください
- TypeScriptの型定義を徹底し、`any`型の使用を避けてください

## 旧構造から新構造への完全移行予定

- 2025年5月: 旧構造の参照を完全に削除
- 2025年6月: 新構造のみをサポートするバージョンをリリース

詳細な移行プロセスと進捗は[MIGRATION.md](./MIGRATION.md)を参照してください。