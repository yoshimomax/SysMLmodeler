// Common types used throughout the application

// Re-export all types from sysml.ts
export * from './sysml';

export interface User {
  id: number;
  username: string;
  name?: string;
  email?: string;
}

export interface TreeItemData {
  id: string;
  name: string;
  type: 'file' | 'folder';
  icon?: string;
  path?: string;
  children?: TreeItemData[];
  expanded?: boolean;
  selected?: boolean;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface File {
  id: number;
  path: string;
  name: string;
  type: string;
  content?: string;
  projectId: number;
  parentId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tab {
  id: string;
  name: string;
  type: string;
  path: string;
  active: boolean;
}

export interface StatusMessage {
  text: string;
  type: 'info' | 'error' | 'warning' | 'success';
}
