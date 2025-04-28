#!/bin/bash

# 設定ファイルの同期スクリプト
# config/ ディレクトリのファイルをルートディレクトリにコピーして同期します

echo "設定ファイルの同期を開始します..."

# 設定ファイルのリスト
CONFIG_FILES=(
  "drizzle.config.ts"
  "jest.config.js"
  "postcss.config.js"
  "tailwind.config.ts"
  "vite.config.ts"
)

# ルートディレクトリと config/ ディレクトリの設定ファイルを同期
for FILE in "${CONFIG_FILES[@]}"; do
  if [ -f "config/$FILE" ]; then
    echo "同期: config/$FILE → $FILE"
    cp "config/$FILE" "./$FILE"
  else
    echo "警告: config/$FILE が見つかりません"
  fi
done

echo "設定ファイルの同期が完了しました"