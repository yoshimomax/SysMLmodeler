#!/bin/bash

# 旧構成から新構成へのファイル同期スクリプト
# 旧ディレクトリ (client/, server/, shared/, model/) から
# 新ディレクトリ (src/client/, src/server/, src/shared/, src/model/) へ
# ファイルを同期します

echo "ソースコード同期スクリプトを開始します..."

# 変数定義
OLD_DIRS=("client/src" "server" "shared" "model")
NEW_DIRS=("src/client" "src/server" "src/shared" "src/model")

# ソースディレクトリごとに処理
for i in "${!OLD_DIRS[@]}"; do
  OLD_DIR="${OLD_DIRS[$i]}"
  NEW_DIR="${NEW_DIRS[$i]}"
  
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
done

echo "ソースコードの同期が完了しました"