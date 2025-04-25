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
  
  // モデルファイルの保存
  app.post('/api/models/save', (req, res) => {
    try {
      const { filename, content } = req.body;
      
      if (!filename || !content) {
        return res.status(400).json({ error: '必須パラメータが不足しています' });
      }
      
      // プロジェクトルートに保存ディレクトリを作成
      const modelsDir = path.join(process.cwd(), 'models');
      if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true });
      }
      
      // 指定されたファイル名でモデルを保存
      const filePath = path.join(modelsDir, filename);
      fs.writeFileSync(filePath, content, 'utf8');
      
      res.json({ success: true, filePath });
    } catch (error) {
      console.error('モデル保存エラー:', error);
      res.status(500).json({ 
        error: '保存に失敗しました', 
        details: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });
  
  // モデルファイルの読み込み
  app.get('/api/models/load', (req, res) => {
    try {
      const filename = req.query.filename as string;
      
      if (!filename) {
        return res.status(400).json({ error: 'ファイル名が必要です' });
      }
      
      // ファイルパスを構築
      const modelsDir = path.join(process.cwd(), 'models');
      const filePath = path.join(modelsDir, filename);
      
      // ファイルが存在するか確認
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'ファイルが見つかりません', notFound: true });
      }
      
      // ファイルの内容を読み込む
      const content = fs.readFileSync(filePath, 'utf8');
      
      res.json({ 
        success: true, 
        filename,
        content
      });
    } catch (error) {
      console.error('モデル読み込みエラー:', error);
      res.status(500).json({ 
        error: '読み込みに失敗しました', 
        details: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });
  
  // 利用可能なモデルファイルの一覧取得
  app.get('/api/models/list', (req, res) => {
    try {
      const modelsDir = path.join(process.cwd(), 'models');
      
      // ディレクトリが存在しない場合は作成
      if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true });
        return res.json({ models: [] });
      }
      
      // ディレクトリ内のファイル一覧を取得
      const files = fs.readdirSync(modelsDir)
        .filter(file => file.endsWith('.sysml'));
      
      // 結果を返す
      res.json({ 
        models: files.map(filename => ({
          filename,
          path: path.join(modelsDir, filename),
          lastModified: fs.statSync(path.join(modelsDir, filename)).mtime
        }))
      });
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
