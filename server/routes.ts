import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, insertChatSchema } from "@shared/schema";
import { ZodError } from "zod";
import OpenAI from "openai";

// Set the OpenAI API key directly
const openai = new OpenAI({
  apiKey: "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",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Document routes
  app.post("/api/documents", async (req, res) => {
    try {
      const docData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(docData);
      res.json(document);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/api/documents", async (_req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(Number(req.params.id));
      if (!document) {
        res.status(404).json({ error: "Document not found" });
        return;
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  // Chat routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, documentId } = req.body;
      const document = documentId ? await storage.getDocument(documentId) : null;

      const context = document ? `Context from document "${document.title}": ${document.content}\n\n` : "";

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant that helps users understand documents and answer questions.",
          },
          {
            role: "user",
            content: context + message,
          },
        ],
      });

      const response = completion.choices[0].message.content || "";

      const chat = await storage.createChat({
        message,
        response,
        context: document ? { documentId, title: document.title } : null,
      });

      res.json(chat);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Internal server error";
      res.status(500).json({ error: errorMessage });
    }
  });

  app.get("/api/chat/history", async (_req, res) => {
    try {
      const history = await storage.getChatHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
