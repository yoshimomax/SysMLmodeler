#!/bin/bash

# SysMLmodeler リポジトリ構造同期スクリプト
# 旧構造（client/, server/, shared/, model/）から
# 新構造（src/client/, src/server/, src/shared/, src/model/）へファイルを同期

set -e  # エラー発生時に停止

echo "=== SysMLmodeler ディレクトリ構造同期 ==="
echo "旧構造 → 新構造へのファイル同期を開始します"

# ルートディレクトリに移動
cd "$(dirname "$0")/.."
ROOT_DIR=$(pwd)

# 必要なディレクトリが存在することを確認
mkdir -p src/client
mkdir -p src/server
mkdir -p src/shared
mkdir -p src/model

# client/ → src/client/ への同期
echo "client/ → src/client/ の同期中..."
if [ -d "client/src" ]; then
  rsync -av --delete --exclude="node_modules" --exclude=".git" client/src/ src/client/
  # index.htmlの同期
  if [ -f "client/index.html" ]; then
    cp client/index.html public/index.html
  fi
else
  echo "警告: client/src ディレクトリが見つかりません"
fi

# server/ → src/server/ への同期
echo "server/ → src/server/ の同期中..."
if [ -d "server" ]; then
  rsync -av --delete --exclude="node_modules" --exclude=".git" server/ src/server/
else
  echo "警告: server ディレクトリが見つかりません"
fi

# shared/ → src/shared/ への同期
echo "shared/ → src/shared/ の同期中..."
if [ -d "shared" ]; then
  rsync -av --delete --exclude="node_modules" --exclude=".git" shared/ src/shared/
else
  echo "警告: shared ディレクトリが見つかりません"
fi

# model/ → src/model/ への同期
echo "model/ → src/model/ の同期中..."
if [ -d "model" ]; then
  rsync -av --delete --exclude="node_modules" --exclude=".git" model/ src/model/
else
  echo "警告: model ディレクトリが見つかりません"
fi

# 設定ファイルの同期
echo "設定ファイルの同期中..."
if [ ! -f "config/drizzle.config.ts" ] && [ -f "drizzle.config.ts" ]; then
  cp drizzle.config.ts config/drizzle.config.ts
fi

if [ ! -f "config/jest.config.js" ] && [ -f "jest.config.js" ]; then
  cp jest.config.js config/jest.config.js
fi

if [ ! -f "config/postcss.config.js" ] && [ -f "postcss.config.js" ]; then
  cp postcss.config.js config/postcss.config.js
fi

if [ ! -f "config/tailwind.config.ts" ] && [ -f "tailwind.config.ts" ]; then
  cp tailwind.config.ts config/tailwind.config.ts
fi

if [ ! -f "config/vite.config.ts" ] && [ -f "vite.config.ts" ]; then
  cp vite.config.ts config/vite.config.ts
fi

echo "同期完了！"
echo "今後は src/ ディレクトリ内での開発を推奨します"