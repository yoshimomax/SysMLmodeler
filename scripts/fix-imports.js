#!/usr/bin/env node

/**
 * 旧構造への参照を新構造のエイリアスパスに置き換えるスクリプト
 * model/ -> @model/ などのエイリアスに変換
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 対象ディレクトリ
const TARGET_DIR = 'src';

// インポートパスの変換マッピング
const PATH_MAPPINGS = [
  { from: /from ['"]\.\.\/\.\.\/model\/([^'"]+)['"]/g, to: 'from "@model/$1"' },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/model\/([^'"]+)['"]/g, to: 'from "@model/$1"' },
  { from: /from ['"]\.\.\/\.\.\/client\/([^'"]+)['"]/g, to: 'from "@/$1"' },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/client\/([^'"]+)['"]/g, to: 'from "@/$1"' },
  { from: /from ['"]\.\.\/\.\.\/shared\/([^'"]+)['"]/g, to: 'from "@shared/$1"' },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/shared\/([^'"]+)['"]/g, to: 'from "@shared/$1"' },
  { from: /from ['"]\.\.\/\.\.\/components\/([^'"]+)['"]/g, to: 'from "@components/$1"' },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/components\/([^'"]+)['"]/g, to: 'from "@components/$1"' },
  { from: /from ['"]\.\.\/\.\.\/store\/([^'"]+)['"]/g, to: 'from "@store/$1"' },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/store\/([^'"]+)['"]/g, to: 'from "@store/$1"' },
  { from: /from ['"]\.\.\/\.\.\/services\/([^'"]+)['"]/g, to: 'from "@services/$1"' },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/services\/([^'"]+)['"]/g, to: 'from "@services/$1"' },
  { from: /from ['"]\.\.\/\.\.\/validators\/([^'"]+)['"]/g, to: 'from "@validators/$1"' },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/validators\/([^'"]+)['"]/g, to: 'from "@validators/$1"' },
  { from: /from ['"]\.\.\/\.\.\/adapters\/([^'"]+)['"]/g, to: 'from "@adapters/$1"' },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/adapters\/([^'"]+)['"]/g, to: 'from "@adapters/$1"' },
];

// ファイル拡張子のフィルター
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// ディレクトリを再帰的に処理
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (FILE_EXTENSIONS.includes(path.extname(fullPath))) {
      processFile(fullPath);
    }
  }
}

// ファイルを処理
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let hasChanges = false;
  
  for (const mapping of PATH_MAPPINGS) {
    if (mapping.from.test(content)) {
      content = content.replace(mapping.from, mapping.to);
      hasChanges = true;
    }
  }
  
  // 変更があった場合のみファイルを更新
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated imports in: ${filePath}`);
  }
}

// メイン処理
console.log('🔄 インポートパスの変換を開始...');
processDirectory(TARGET_DIR);
console.log('✅ インポートパスの変換が完了しました');

// 型チェックを実行
try {
  console.log('🧪 TypeScriptの型チェックを実行中...');
  execSync('npm run check', { stdio: 'inherit' });
  console.log('✅ 型チェック成功');
} catch (error) {
  console.error('❌ 型チェックエラー。修正が必要です。');
  process.exit(1);
}