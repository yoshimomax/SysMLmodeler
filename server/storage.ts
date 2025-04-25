import { 
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  files, type File, type InsertFile,
  models, type Model, type InsertModel
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Project): Promise<Project>;
  deleteProject(id: number): Promise<boolean>;
  
  // File operations
  getFile(id: number): Promise<File | undefined>;
  getFilesByProject(projectId: number): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, file: File): Promise<File>;
  deleteFile(id: number): Promise<boolean>;
  
  // Model operations
  getModel(id: number): Promise<Model | undefined>;
  getModelsByFile(fileId: number): Promise<Model[]>;
  createModel(model: InsertModel): Promise<Model>;
  updateModel(id: number, model: Model): Promise<Model>;
  deleteModel(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private files: Map<number, File>;
  private models: Map<number, Model>;
  
  private userId: number;
  private projectId: number;
  private fileId: number;
  private modelId: number;
  
  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.files = new Map();
    this.models = new Map();
    
    this.userId = 1;
    this.projectId = 1;
    this.fileId = 1;
    this.modelId = 1;
    
    // Initialize with a demo user
    this.createUser({
      username: 'demo',
      password: 'password',
      name: 'Demo User',
      email: 'demo@example.com'
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectId++;
    const project: Project = { ...insertProject, id };
    this.projects.set(id, project);
    return project;
  }
  
  async updateProject(id: number, project: Project): Promise<Project> {
    this.projects.set(id, project);
    return project;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }
  
  // File operations
  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }
  
  async getFilesByProject(projectId: number): Promise<File[]> {
    return Array.from(this.files.values())
      .filter(file => file.projectId === projectId);
  }
  
  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.fileId++;
    const file: File = { ...insertFile, id };
    this.files.set(id, file);
    return file;
  }
  
  async updateFile(id: number, file: File): Promise<File> {
    this.files.set(id, file);
    return file;
  }
  
  async deleteFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }
  
  // Model operations
  async getModel(id: number): Promise<Model | undefined> {
    return this.models.get(id);
  }
  
  async getModelsByFile(fileId: number): Promise<Model[]> {
    return Array.from(this.models.values())
      .filter(model => model.fileId === fileId);
  }
  
  async createModel(insertModel: InsertModel): Promise<Model> {
    const id = this.modelId++;
    const model: Model = { ...insertModel, id };
    this.models.set(id, model);
    return model;
  }
  
  async updateModel(id: number, model: Model): Promise<Model> {
    this.models.set(id, model);
    return model;
  }
  
  async deleteModel(id: number): Promise<boolean> {
    return this.models.delete(id);
  }
}

// データベースを使用したストレージ実装
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }
  
  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }
  
  async updateProject(id: number, project: Project): Promise<Project> {
    const { id: _, ...updateData } = project;
    const [updatedProject] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();
    
    if (!updatedProject) {
      throw new Error(`Project with ID ${id} not found`);
    }
    
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    const [deletedProject] = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();
    
    return !!deletedProject;
  }
  
  // File operations
  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file || undefined;
  }
  
  async getFilesByProject(projectId: number): Promise<File[]> {
    return await db.select().from(files).where(eq(files.projectId, projectId));
  }
  
  async createFile(insertFile: InsertFile): Promise<File> {
    const [file] = await db
      .insert(files)
      .values(insertFile)
      .returning();
    return file;
  }
  
  async updateFile(id: number, file: File): Promise<File> {
    const { id: _, ...updateData } = file;
    const [updatedFile] = await db
      .update(files)
      .set(updateData)
      .where(eq(files.id, id))
      .returning();
    
    if (!updatedFile) {
      throw new Error(`File with ID ${id} not found`);
    }
    
    return updatedFile;
  }
  
  async deleteFile(id: number): Promise<boolean> {
    const [deletedFile] = await db
      .delete(files)
      .where(eq(files.id, id))
      .returning();
    
    return !!deletedFile;
  }
  
  // Model operations
  async getModel(id: number): Promise<Model | undefined> {
    const [model] = await db.select().from(models).where(eq(models.id, id));
    return model || undefined;
  }
  
  async getModelsByFile(fileId: number): Promise<Model[]> {
    return await db.select().from(models).where(eq(models.fileId, fileId));
  }
  
  async createModel(insertModel: InsertModel): Promise<Model> {
    const [model] = await db
      .insert(models)
      .values(insertModel)
      .returning();
    return model;
  }
  
  async updateModel(id: number, model: Model): Promise<Model> {
    const { id: _, ...updateData } = model;
    const [updatedModel] = await db
      .update(models)
      .set(updateData)
      .where(eq(models.id, id))
      .returning();
    
    if (!updatedModel) {
      throw new Error(`Model with ID ${id} not found`);
    }
    
    return updatedModel;
  }
  
  async deleteModel(id: number): Promise<boolean> {
    const [deletedModel] = await db
      .delete(models)
      .where(eq(models.id, id))
      .returning();
    
    return !!deletedModel;
  }
}

// Uncomment to use in-memory storage instead
// export const storage = new MemStorage();

// Use database storage
export const storage = new DatabaseStorage();
