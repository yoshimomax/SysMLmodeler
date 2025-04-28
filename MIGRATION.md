# リポジトリ構造最適化の進捗状況

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

## 今後の作業

### 短期的なタスク
1. インポートパス変換スクリプト `scripts/migrate-imports.mjs` の改良
2. TypeScriptパスのエイリアス設定の最適化
3. 新構造でのアプリケーションビルドのテスト

### 中期的なタスク
1. Replitワークフローの更新
2. CI/CDパイプラインの更新（必要に応じて）
3. devコマンドでの新旧同期の自動化

### 長期的なタスク
1. 旧構造の段階的な廃止計画の策定
2. 新構造のみでのリリースバージョンの準備
3. 最終的にシンプルな `/config/`, `/public/`, `/src/` の3フォルダ構成への移行

## 使用方法

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

### 自動同期の設定
package.jsonのdevスクリプト実行前に自動同期を追加する方法：
```json
"scripts": {
  "dev": "npm run sync && NODE_ENV=development tsx server/index.ts",
  "sync": "bash scripts/sync-all.sh",
  // 他のスクリプト...
}
```
※現在のReplitの制約からpackage.jsonは直接編集できませんが、今後可能になった場合に参考。

## 課題と解決方法

1. **直接的なファイル編集の制限**
   - 重要なファイル（server/vite.tsなど）は直接編集できない
   - 解決策：同期スクリプトによる間接的な変更

2. **シンボリックリンクの制限**
   - Replitではシンボリックリンクの作成が制限されている
   - 解決策：ファイルコピーによる同期

3. **インポートパスの変換**
   - 多くのファイルで相対パスを使用している
   - 解決策：自動変換スクリプトの作成と継続的な改善