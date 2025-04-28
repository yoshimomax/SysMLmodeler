#!/bin/bash

# アセットファイルの同期スクリプト
# attached_assets/ ディレクトリのファイルを public/assets/ へ移動します

echo "アセットファイルの同期を開始します..."

# public/assets ディレクトリを作成
mkdir -p public/assets

# attached_assets/ のファイルを public/assets/ にコピー
if [ -d "attached_assets" ]; then
  echo "attached_assets/ から public/assets/ へファイルをコピーします"
  cp -r attached_assets/* public/assets/
else
  echo "警告: attached_assets/ ディレクトリが見つかりません"
fi

# ルートディレクトリのアセットファイルがあれば移動
if [ -f "generated-icon.png" ]; then
  echo "generated-icon.png を public/assets/ へ移動します"
  cp generated-icon.png public/assets/
fi

echo "アセットファイルの同期が完了しました"

# vite.config.ts のエイリアス設定を更新
echo "vite.config.ts のエイリアス設定を更新します..."

CONFIG_FILE="config/vite.config.ts"
ROOT_CONFIG="vite.config.ts"

if [ -f $CONFIG_FILE ]; then
  # @assets のパスを attached_assets から public/assets に変更
  sed -i 's|"@assets": path.resolve(import.meta.dirname, "attached_assets"),|"@assets": path.resolve(import.meta.dirname, "public", "assets"),|g' $CONFIG_FILE
  echo "$CONFIG_FILE を更新しました"
  
  # ルートのvite.config.tsも更新
  if [ -f $ROOT_CONFIG ]; then
    sed -i 's|"@assets": path.resolve(import.meta.dirname, "attached_assets"),|"@assets": path.resolve(import.meta.dirname, "public", "assets"),|g' $ROOT_CONFIG
    echo "$ROOT_CONFIG も更新しました"
  fi
else
  echo "警告: $CONFIG_FILE が見つかりません"
fi

echo "アセット設定の更新が完了しました"