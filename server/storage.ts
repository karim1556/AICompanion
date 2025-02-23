import { type Document, type InsertDocument, type Chat, type InsertChat } from "@shared/schema";

export interface IStorage {
  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  createDocument(doc: InsertDocument): Promise<Document>;

  // Chat operations
  getChat(id: number): Promise<Chat | undefined>;
  getChatHistory(): Promise<Chat[]>;
  createChat(chat: InsertChat): Promise<Chat>;
}

export class MemStorage implements IStorage {
  private documents: Map<number, Document>;
  private chats: Map<number, Chat>;
  private docCurrentId: number;
  private chatCurrentId: number;

  constructor() {
    this.documents = new Map();
    this.chats = new Map();
    this.docCurrentId = 1;
    this.chatCurrentId = 1;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const id = this.docCurrentId++;
    const document: Document = {
      ...doc,
      id,
      uploadedAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async getChat(id: number): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async getChatHistory(): Promise<Chat[]> {
    return Array.from(this.chats.values());
  }

  async createChat(chat: InsertChat): Promise<Chat> {
    const id = this.chatCurrentId++;
    const newChat: Chat = {
      ...chat,
      id,
      createdAt: new Date(),
      context: chat.context || null,
    };
    this.chats.set(id, newChat);
    return newChat;
  }
}

export const storage = new MemStorage();