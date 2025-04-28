#!/bin/bash

# テストディレクトリの同期スクリプト
# __tests__/ ディレクトリを src/__tests__/ へ移動します

echo "テストディレクトリの同期を開始します..."

# 変数定義
OLD_DIR="__tests__"
NEW_DIR="src/__tests__"

echo "同期: ${OLD_DIR} → ${NEW_DIR}"

# 新ディレクトリが存在するか確認
if [ ! -d "$NEW_DIR" ]; then
  echo "  ディレクトリ作成: $NEW_DIR"
  mkdir -p "$NEW_DIR"
fi

# ファイルの同期
if [ -d "$OLD_DIR" ]; then
  # rsyncが利用できる場合はそれを使用
  if command -v rsync > /dev/null; then
    echo "  rsyncでファイルを同期中..."
    rsync -av --exclude="node_modules" "$OLD_DIR/" "$NEW_DIR/"
  else
    # rsyncがない場合はcpを使用
    echo "  cpでファイルをコピー中..."
    cp -r "$OLD_DIR"/* "$NEW_DIR"/ 2>/dev/null || true
  fi
else
  echo "  警告: $OLD_DIR ディレクトリが見つかりません"
fi

echo "  $OLD_DIR から $NEW_DIR への同期完了"
echo "テストディレクトリの同期が完了しました"