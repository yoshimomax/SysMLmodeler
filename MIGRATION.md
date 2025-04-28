# リポジトリ構造最適化の進捗と完了計画

## 実施済み作業

### Phase 1: 設定ファイルの集約
- ✅ `config/` ディレクトリにすべての設定ファイルを集約
- ✅ 自動同期スクリプト `scripts/sync-config.sh` の作成
- ✅ 設定ファイルの参照を更新

### Phase 2: アセットの整理
- ✅ `public/assets/` ディレクトリの作成
- ✅ `attached_assets/` のファイルを `public/assets/` へ移動
- ✅ `generated-icon.png` を `public/assets/` へ移動
- ✅ `vite.config.ts` のエイリアス設定を更新

### Phase 3: ソースコードの一本化
- ✅ 自動同期スクリプト `scripts/sync-old-to-new.sh` の作成
- ✅ 旧構造から新構造へのソースコードコピーを実行
- ✅ ハイブリッド構造で両方のパスを同時に維持

### Phase 4: テストディレクトリの整理
- ✅ 自動同期スクリプト `scripts/sync-tests.sh` の作成
- ✅ `__tests__/` から `src/__tests__/` へテストコードを移動

### Phase 5: マスタースクリプトの作成
- ✅ 一括同期スクリプト `scripts/sync-all.sh` の作成
- ✅ すべての同期を一度に実行可能に

### Phase 6: CI/CD更新
- ✅ GitHub Actions設定を更新
- ✅ テストパスを `src/__tests__/` に更新
- ✅ リントジョブの追加

### Phase 7: ドキュメント整備
- ✅ README.mdを新構造に合わせて更新
- ✅ 移行ガイドラインとスケジュールの作成
- ✅ 開発者向けベストプラクティスの明文化

## 今後の作業

### Phase 8: 移行期間（2025年4月〜5月）
- ☐ すべての開発を `src/` ディレクトリで実施
- ☐ 同期スクリプトで旧構造と整合性を維持
- ☐ GitHub Actionsで自動同期を継続実行

### Phase 9: 旧構造の廃止（2025年5月末）
- ☐ 同期スクリプトの実行を停止
- ☐ 旧構造のディレクトリを削除
  - `client/`
  - `server/`
  - `shared/`
  - `model/`
  - `__tests__/`
- ☐ パッケージスクリプトの更新
  - `dev`コマンドの起点を `src/server/index.ts` に変更
  - テストコマンドのパスを `src/__tests__` のみに限定

### Phase 10: 最終リリース（2025年6月）
- ☐ 新構造のみをサポートするバージョンリリース
- ☐ 同期スクリプトの完全削除
- ☐ 移行関連のドキュメント整理

## 旧構造廃止手順

以下の手順は2025年5月末に実施予定です：

### 1. 事前準備
- 全開発者に旧構造廃止の通知（2週間前）
- 全PRをマージして開発を一時停止
- 最終同期の実行と確認

### 2. 旧ディレクトリの削除

```bash
# 旧構造ディレクトリの削除
rm -rf client/
rm -rf server/
rm -rf shared/
rm -rf model/
rm -rf __tests__/

# 同期スクリプトの削除（オプション）
rm scripts/sync-*.sh
rm scripts/migrate-imports.mjs
```

### 3. package.jsonの更新

開発スクリプトを更新（Replit管理者による操作）:

```json
"scripts": {
  "dev": "NODE_ENV=development tsx src/server/index.ts",
  "build": "vite build",
  "start": "NODE_ENV=production node dist/server/index.js",
  "test": "jest --config=config/jest.config.js src/__tests__",
  "check": "tsc --noEmit",
  "db:push": "drizzle-kit push:pg"
}
```

### 4. 最終確認

```bash
# 依存関係の再インストール
npm ci

# 型チェック
npm run check

# テスト実行
npm test

# ビルドテスト
npm run build

# 動作確認
npm start
```

### 5. 通知と文書化

- チーム全体に完了通知
- READMEから移行関連の記述を削除
- MIGRATION.mdを更新して完了を記録

## 使用方法（移行期間中）

### 手動同期
```bash
# 全ての同期を一度に実行
./scripts/sync-all.sh

# または個別に実行
./scripts/sync-config.sh  # 設定ファイルの同期
./scripts/sync-assets.sh  # アセットの同期
./scripts/sync-old-to-new.sh  # ソースコードの同期
./scripts/sync-tests.sh  # テストの同期
```

### 移行期間中の開発ガイドライン

1. **常に `src/` 内のファイルを編集する**
   - 旧構造のファイルは直接編集しない
   - エイリアスパス（`@/`, `@model/`など）を使用する

2. **変更後の同期とテスト**
   - 変更後は必ず同期スクリプトを実行
   - テストは `src/__tests__/` 内のテストを実行

3. **PR前の確認**
   - PR作成前に同期スクリプトを実行
   - 型チェックとテストの成功を確認

## 備考

- 移行期間中に問題が発生した場合は、旧構造を参照せずに `src/` ディレクトリ内で修正する
- エイリアスを使用することで将来的なディレクトリ構造の変更にも柔軟に対応可能
- 常に TypeScript の型定義を強化し、コード品質を維持する