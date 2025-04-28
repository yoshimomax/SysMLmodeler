#!/bin/bash

# server/, client/, shared/ ディレクトリを削除する前に必要なファイルのシンボリックリンクを作成するスクリプト

echo "旧ディレクトリ構造の削除準備を開始します..."

# server/index.ts が必要な場合、リンクを作成
if [ ! -f server/index.ts ]; then
  echo "Error: server/index.ts が見つかりません"
  exit 1
fi

echo "server/index.ts の内容を確認中..."
cat server/index.ts

# リンク作成のための親ディレクトリ作成
mkdir -p _old_structure/server

# 必要なファイルをコピー
echo "server/index.ts をコピー中..."
cp -f server/index.ts _old_structure/server/

# リンク作成
echo "シンボリックリンクを作成中..."
ln -sf _old_structure/server/index.ts server/index.ts

echo "完了しました。"
echo "以下のコマンドで旧ディレクトリを削除できます："
echo "rm -rf client/ shared/ && find server/ -type f ! -name 'index.ts' | xargs rm"