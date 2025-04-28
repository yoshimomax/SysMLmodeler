#!/bin/bash

# 全同期スクリプト
# 設定ファイル、アセット、ソースコード、テストを全て同期します

echo "リポジトリ構造最適化の同期スクリプトを実行します..."

# 設定ファイルの同期
echo "==================="
echo "1. 設定ファイルの同期"
echo "==================="
./scripts/sync-config.sh

# アセットの同期
echo "==================="
echo "2. アセットの同期"
echo "==================="
./scripts/sync-assets.sh

# ソースコードの同期
echo "==================="
echo "3. ソースコードの同期"
echo "==================="
./scripts/sync-old-to-new.sh

# テストの同期
echo "==================="
echo "4. テストの同期"
echo "==================="
./scripts/sync-tests.sh

# インポートパスの修正
echo "==================="
echo "5. インポートパスの修正"
echo "==================="
if [ -f ./scripts/fix-imports.js ]; then
  echo "インポートパスをエイリアスに変換しています..."
  node ./scripts/fix-imports.js
else
  echo "警告: fix-imports.jsスクリプトが見つかりません。スキップします。"
fi

echo "==================="
echo "全ての同期が完了しました"
echo "==================="
echo "次のステップ："
echo "1. コードのテスト実行 (npm test)"
echo "2. 型チェックの確認 (npm run check)"
echo "3. 新しい構成でのビルド確認 (npm run build)"
echo "==================="