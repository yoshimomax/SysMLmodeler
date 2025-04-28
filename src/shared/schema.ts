import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Files table for storing project files
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "folder", "diagram", "model", etc.
  content: text("content"),
  projectId: integer("project_id").references(() => projects.id),
  parentId: integer("parent_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Models table for storing diagram models
export const models = pgTable("models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "block", "package", "requirement", etc.
  data: jsonb("data").notNull(),
  fileId: integer("file_id").references(() => files.id),
});

// Define the Zod schemas for insertion
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFileSchema = createInsertSchema(files).pick({
  path: true,
  name: true,
  type: true,
  content: true,
  projectId: true,
  parentId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModelSchema = createInsertSchema(models).pick({
  name: true,
  type: true,
  data: true,
  fileId: true,
});

// Define types for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;

export type Model = typeof models.$inferSelect;
export type InsertModel = z.infer<typeof insertModelSchema>;
