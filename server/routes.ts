import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from 'fs';
import path from 'path';

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for SysML project management
  
  // Get all projects
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });
  
  // Create a new project
  app.post('/api/projects', async (req, res) => {
    try {
      const { name, description, ownerId } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Project name is required' });
      }
      
      const now = new Date().toISOString();
      const project = await storage.createProject({
        name,
        description,
        ownerId,
        createdAt: now,
        updatedAt: now
      });
      
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create project' });
    }
  });
  
  // Get project by ID
  app.get('/api/projects/:id', async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  });
  
  // Update project
  app.put('/api/projects/:id', async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Project name is required' });
      }
      
      const existingProject = await storage.getProject(projectId);
      if (!existingProject) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const updatedProject = await storage.updateProject(projectId, {
        ...existingProject,
        name,
        description,
        updatedAt: new Date().toISOString()
      });
      
      res.json(updatedProject);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update project' });
    }
  });
  
  // Get files for a project
  app.get('/api/projects/:id/files', async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const files = await storage.getFilesByProject(projectId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch project files' });
    }
  });
  
  // Create a file
  app.post('/api/files', async (req, res) => {
    try {
      const { path, name, type, content, projectId, parentId } = req.body;
      
      if (!name || !type || !projectId) {
        return res.status(400).json({ error: 'Name, type, and projectId are required' });
      }
      
      const now = new Date().toISOString();
      const file = await storage.createFile({
        path,
        name,
        type,
        content,
        projectId,
        parentId,
        createdAt: now,
        updatedAt: now
      });
      
      res.status(201).json(file);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create file' });
    }
  });
  
  // Update a file
  app.put('/api/files/:id', async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const { path, name, type, content } = req.body;
      
      const existingFile = await storage.getFile(fileId);
      if (!existingFile) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      const updatedFile = await storage.updateFile(fileId, {
        ...existingFile,
        path: path || existingFile.path,
        name: name || existingFile.name,
        type: type || existingFile.type,
        content: content !== undefined ? content : existingFile.content,
        updatedAt: new Date().toISOString()
      });
      
      res.json(updatedFile);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update file' });
    }
  });
  
  // SysML specific endpoints
  
  // モデルの保存（データベース使用）
  app.post('/api/models/save', async (req, res) => {
    try {
      const { filename, content, fileId } = req.body;
      
      if (!filename || !content) {
        return res.status(400).json({ error: '必須パラメータが不足しています' });
      }
      
      // データベースにモデルを保存する準備
      const now = new Date().toISOString();
      let file;
      
      // ファイルIDが指定されていない場合、新しいファイルを作成
      if (!fileId) {
        // デフォルトプロジェクトを作成または取得する
        let projectId;
        
        // プロジェクト一覧を取得
        const projects = await storage.getAllProjects();
        
        if (projects.length === 0) {
          // プロジェクトが一つもない場合は新規作成
          console.log('デフォルトプロジェクトを作成します');
          const defaultProject = await storage.createProject({
            name: 'Default SysML Project',
            description: 'Auto-generated project for SysML models',
            ownerId: null,
            createdAt: now,
            updatedAt: now
          });
          projectId = defaultProject.id;
          console.log('デフォルトプロジェクト作成完了:', projectId);
        } else {
          // 既存の最初のプロジェクトを使用
          projectId = projects[0].id;
          console.log('既存プロジェクトを使用:', projectId);
        }
        
        console.log(`ファイル作成: ${filename}、プロジェクトID: ${projectId}`);
        file = await storage.createFile({
          path: `/models/${filename}`,
          name: filename,
          type: 'model',
          content: null, // モデルデータはmodelsテーブルに保存
          projectId,
          parentId: null,
          createdAt: now,
          updatedAt: now
        });
        console.log('ファイル作成完了:', file.id);
      } else {
        // 既存のファイルを取得
        file = await storage.getFile(parseInt(fileId));
        if (!file) {
          return res.status(404).json({ error: 'ファイルが見つかりません' });
        }
      }
      
      // ファイルのモデルを保存または更新
      // 既存のモデルを探す
      const existingModels = await storage.getModelsByFile(file.id);
      let model;
      
      if (existingModels.length > 0) {
        // 既存のモデルを更新
        model = await storage.updateModel(existingModels[0].id, {
          ...existingModels[0],
          name: filename,
          type: 'sysml',
          data: JSON.parse(content),
        });
      } else {
        // 新しいモデルを作成
        model = await storage.createModel({
          name: filename,
          type: 'sysml',
          data: JSON.parse(content),
          fileId: file.id
        });
      }
      
      res.json({ 
        success: true, 
        model,
        file
      });
    } catch (error) {
      console.error('モデル保存エラー:', error);
      res.status(500).json({ 
        error: '保存に失敗しました', 
        details: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });
  
  // モデルの読み込み（データベース使用）
  app.get('/api/models/load', async (req, res) => {
    try {
      console.log('モデル読み込み開始');
      const filename = req.query.filename as string || 'project.sysml';
      const modelId = req.query.id as string;
      
      console.log(`ロードパラメータ: filename=${filename}, modelId=${modelId}`);
      
      if (!filename && !modelId) {
        return res.status(400).json({ error: 'ファイル名またはモデルIDが必要です' });
      }
      
      let model;
      
      if (modelId) {
        // IDでモデルを検索
        console.log(`IDでモデルを検索: ${modelId}`);
        model = await storage.getModel(parseInt(modelId));
      } else {
        // ファイル名に基づいて検索
        console.log(`ファイル名に基づいて検索: ${filename}`);
        
        // ファイルを見つける
        const files = await storage.getAllFiles();
        console.log(`検索中のファイル数: ${files.length}`);
        
        files.forEach((f, index) => {
          console.log(`ファイル ${index + 1}: id=${f.id}, name=${f.name}, path=${f.path}`);
        });
        
        const file = files.find((f: { name: string }) => f.name === filename);
        
        if (!file) {
          console.log('ファイルが見つかりません:', filename);
          
          // ファイルが見つからない場合、モデルの初期状態を返す（オプション）
          // これにより、初回アクセス時でもエラーではなく、空のモデルを返せる
          return res.status(404).json({ 
            error: 'ファイルが見つかりません',
            notFound: true,
            // 初期状態のダイアグラムを返す（任意）
            initialModel: {
              id: 'init',
              name: 'New SysML Model',
              diagrams: [],
              elements: [],
              relationships: []
            }
          });
        }
        
        console.log(`ファイルが見つかりました: id=${file.id}, name=${file.name}`);
        
        // ファイルに関連するモデルを取得
        const models = await storage.getModelsByFile(file.id);
        console.log(`ファイルに関連するモデル数: ${models.length}`);
        
        if (models.length === 0) {
          console.log('モデルが見つかりません');
          return res.status(404).json({ 
            error: 'モデルが見つかりません', 
            notFound: true,
            // 初期状態のダイアグラムを返す（任意）
            initialModel: {
              id: 'init',
              name: 'New SysML Model',
              diagrams: [],
              elements: [],
              relationships: []
            }
          });
        }
        
        model = models[0];
      }
      
      if (!model) {
        console.log('モデルが見つかりません');
        return res.status(404).json({ error: 'モデルが見つかりません', notFound: true });
      }
      
      console.log(`モデルを読み込みました: id=${model.id}, name=${model.name}`);
      
      // モデルデータをJSON文字列に変換
      const content = JSON.stringify(model.data);
      
      console.log('モデル読み込み完了');
      
      res.json({ 
        success: true, 
        filename: model.name,
        content,
        model
      });
    } catch (error) {
      console.error('モデル読み込みエラー:', error);
      res.status(500).json({ 
        error: '読み込みに失敗しました', 
        details: error instanceof Error ? error.message : '不明なエラー',
        // スタックトレースを追加（開発環境でのみ使用すべき）
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  });
  
  // 利用可能なモデル一覧の取得（データベース使用）
  app.get('/api/models/list', async (req, res) => {
    try {
      // すべてのモデルを取得
      const allModels = await storage.getAllModels();
      
      // 対応するファイル情報も取得
      const modelsList = await Promise.all(
        allModels.map(async (model: { id: number; name: string; type: string; fileId: number | null; data: unknown }) => {
          let file = null;
          if (model.fileId) {
            file = await storage.getFile(model.fileId);
          }
          
          return {
            id: model.id,
            name: model.name,
            type: model.type,
            filename: model.name,
            fileId: model.fileId,
            filePath: file ? file.path : null,
            lastModified: file ? file.updatedAt : null
          };
        })
      );
      
      // 結果を返す
      res.json({ models: modelsList });
    } catch (error) {
      console.error('モデル一覧取得エラー:', error);
      res.status(500).json({ 
        error: 'モデル一覧の取得に失敗しました', 
        details: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
