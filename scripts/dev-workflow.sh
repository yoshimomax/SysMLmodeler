#!/bin/bash

# SysMLモデラー 開発ワークフロースクリプト
# 同期→変換→実行の一連の流れを自動化

set -e  # エラー発生時に停止

echo "=== SysMLモデラー開発ワークフロー ==="

# ルートディレクトリに移動
cd "$(dirname "$0")/.."
ROOT_DIR=$(pwd)

# 1. 旧構造→新構造への同期
echo "1. 旧→新構造の同期を実行中..."
./scripts/sync-old-to-new.sh

# 2. インポートパス変換
echo "2. インポートパス変換を実行中..."
node ./scripts/migrate-imports.mjs

# 3. アプリケーション起動
echo "3. アプリケーションを起動中..."
NODE_ENV=development tsx server/index.ts