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
  
  // Load a SysML model file
  app.get('/api/sysml/load', (req, res) => {
    try {
      const filePath = req.query.path as string;
      
      if (!filePath) {
        return res.status(400).json({ error: 'File path is required' });
      }
      
      // In a production implementation, this would parse SysML files
      // For now, we return a placeholder response
      res.json({
        id: 'model1',
        name: path.basename(filePath, path.extname(filePath)),
        diagrams: [],
        elements: [],
        relationships: []
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to load SysML model' });
    }
  });
  
  // Save a SysML model file
  app.post('/api/sysml/save', (req, res) => {
    try {
      const { model, path } = req.body;
      
      if (!model || !path) {
        return res.status(400).json({ error: 'Model and path are required' });
      }
      
      // In a production implementation, this would serialize and save the model
      // For now, we just return success
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save SysML model' });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
