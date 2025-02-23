import { createWorker } from "tesseract.js";
import { extractTextFromPdf } from "./pdfProcessor";
import { apiRequest } from "./queryClient";
import type { Document } from "@shared/schema";

export async function processDocument(file: File): Promise<Document> {
  let text = "";
  let type = file.type;

  try {
    if (file.type === "application/pdf") {
      text = await extractTextFromPdf(file);
    } else if (file.type.startsWith("image/")) {
      const worker = await createWorker();
      const { data: { text: ocrText } } = await worker.recognize(file);
      await worker.terminate();
      text = ocrText;
    } else {
      text = await file.text();
    }

    if (!text.trim()) {
      throw new Error("No text could be extracted from the file");
    }

    const response = await apiRequest("POST", "/api/documents", {
      title: file.name,
      content: text,
      type,
    });

    const document = await response.json();
    console.log("Document processed successfully:", document);
    return document;
  } catch (error) {
    console.error("Error processing document:", error);
    throw error;
  }
}