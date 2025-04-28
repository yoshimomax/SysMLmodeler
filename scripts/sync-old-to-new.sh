#!/bin/bash

# SysMLモデラー 構造同期スクリプト
# 旧構造のファイルを新構造にコピーし、整理します

set -e  # エラー発生時に停止

echo "=== SysMLモデラー 構造同期ツール ==="

# ルートディレクトリに移動
cd "$(dirname "$0")/.."
ROOT_DIR=$(pwd)

# 新構造のベースディレクトリを作成
mkdir -p src/client
mkdir -p src/server
mkdir -p src/shared
mkdir -p src/model
mkdir -p src/store
mkdir -p src/components
mkdir -p src/validators
mkdir -p src/services
mkdir -p src/adapters
mkdir -p src/__tests__
mkdir -p public/assets

# 同期パターンを配列で定義
sync_patterns=(
  # クライアント関連ファイル
  "client/src:src/client"
  "client/components:src/components"
  
  # サーバー関連ファイル
  "server:src/server"
  
  # 共有ファイル
  "shared:src/shared"
  
  # モデル関連ファイル
  "model:src/model"
  
  # テストファイル
  "__tests__:src/__tests__"
  
  # アダプターファイル
  "src/adapters:src/adapters"
)

# 同期関数
sync_files() {
  local source_dir=$1
  local target_dir=$2
  
  # ソースディレクトリが存在しない場合はスキップ
  if [ ! -d "$source_dir" ]; then
    echo "警告: ソースディレクトリが存在しません: $source_dir"
    return
  fi
  
  # ターゲットディレクトリを作成
  mkdir -p "$target_dir"
  
  # リソースをコピー
  echo "同期中: $source_dir → $target_dir"
  
  # rsyncがあれば利用、なければcpを使用
  if command -v rsync >/dev/null 2>&1; then
    rsync -av --exclude="node_modules" --exclude=".git" "$source_dir/" "$target_dir/"
  else
    # recursiveにコピー（cp -r）- 要注意：ファイルが既存の場合は上書き
    cp -r "$source_dir"/* "$target_dir/" 2>/dev/null || true
  fi
}

# 各同期パターンを処理
for pattern in "${sync_patterns[@]}"; do
  # パターンを:で分割
  IFS=':' read -r source_dir target_dir <<< "$pattern"
  
  # パスをルートからの絶対パスに変換
  source_dir="$ROOT_DIR/$source_dir"
  target_dir="$ROOT_DIR/$target_dir"
  
  # 同期実行
  sync_files "$source_dir" "$target_dir"
done

# 設定ファイルの移動（コピー）
echo "設定ファイルの整理..."

# configディレクトリを作成
mkdir -p config

# 各設定ファイルを移動（必要に応じてコピー）
config_files=(
  "postcss.config.js:config/postcss.config.js"
  "tailwind.config.ts:config/tailwind.config.ts"
  "jest.config.js:config/jest.config.js"
  "vite.config.ts:config/vite.config.ts"
  "drizzle.config.ts:config/drizzle.config.ts"
)

for pattern in "${config_files[@]}"; do
  # パターンを:で分割
  IFS=':' read -r source_file target_file <<< "$pattern"
  
  # パスをルートからの絶対パスに変換
  source_file="$ROOT_DIR/$source_file"
  target_file="$ROOT_DIR/$target_file"
  
  # ファイルが存在する場合のみコピー
  if [ -f "$source_file" ]; then
    echo "設定ファイルコピー: $source_file → $target_file"
    cp "$source_file" "$target_file"
  fi
done

echo "=== 同期完了 ==="