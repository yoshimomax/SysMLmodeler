#!/usr/bin/env node

/**
 * SysMLmodeler インポートパス変換スクリプト
 * 
 * 旧構造のインポートパスから新構造のインポートパスへ一括変換します。
 * 例: 
 * - `import x from 'client/...'` → `import x from '@/...'`
 * - `import x from 'server/...'` → `import x from '@server/...'`
 * 
 * 使用法:
 * ```
 * node scripts/migrate-imports.js
 * ```
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 変換ルール設定
const importPathRules = [
  { from: /from ['"]\.\.?\/(client\/[^'"]+)['"]/g, to: "from '@/$1'" },
  { from: /from ['"]client\/([^'"]+)['"]/g, to: "from '@/$1'" },
  { from: /from ['"]\.\.?\/(server\/[^'"]+)['"]/g, to: "from '@server/$1'" },
  { from: /from ['"]server\/([^'"]+)['"]/g, to: "from '@server/$1'" },
  { from: /from ['"]\.\.?\/(shared\/[^'"]+)['"]/g, to: "from '@shared/$1'" },
  { from: /from ['"]shared\/([^'"]+)['"]/g, to: "from '@shared/$1'" },
  { from: /from ['"]\.\.?\/(model\/[^'"]+)['"]/g, to: "from '@model/$1'" },
  { from: /from ['"]model\/([^'"]+)['"]/g, to: "from '@model/$1'" },
  // コンポーネント等へのパス調整
  { from: /from ['"]\.\.?\/(components\/[^'"]+)['"]/g, to: "from '@components/$1'" },
  { from: /from ['"]\.\.?\/(store\/[^'"]+)['"]/g, to: "from '@store/$1'" },
  { from: /from ['"]\.\.?\/(services\/[^'"]+)['"]/g, to: "from '@services/$1'" },
  { from: /from ['"]\.\.?\/(validators\/[^'"]+)['"]/g, to: "from '@validators/$1'" },
  { from: /from ['"]\.\.?\/(adapters\/[^'"]+)['"]/g, to: "from '@adapters/$1'" },
];

// 対象ファイル拡張子
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// 処理対象ディレクトリ
const targetDirs = ['src'];

// 除外ディレクトリ
const excludeDirs = ['node_modules', 'dist', '.git'];

/**
 * ディレクトリ内の全てのファイルを再帰的に取得
 */
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        fileList = getAllFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

/**
 * ファイル内のインポートパスを変換
 */
function transformImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  importPathRules.forEach(rule => {
    const newContent = content.replace(rule.from, rule.to);
    if (newContent !== content) {
      hasChanges = true;
      content = newContent;
    }
  });
  
  if (hasChanges) {
    console.log(`変換しました: ${filePath}`);
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

/**
 * メイン処理
 */
async function main() {
  console.log('=== SysMLmodeler インポートパス変換ツール ===');
  console.log('変換開始...');
  
  let totalFiles = 0;
  let changedFiles = 0;
  
  // 対象ディレクトリごとに処理
  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) {
      console.log(`警告: ディレクトリが存在しません: ${dir}`);
      continue;
    }
    
    const files = getAllFiles(dir);
    totalFiles += files.length;
    
    for (const file of files) {
      if (transformImports(file)) {
        changedFiles++;
      }
    }
  }
  
  console.log('=== 変換完了 ===');
  console.log(`処理ファイル数: ${totalFiles}`);
  console.log(`変更ファイル数: ${changedFiles}`);
}

// 実行
main().catch(err => {
  console.error('エラーが発生しました:', err);
  process.exit(1);
});