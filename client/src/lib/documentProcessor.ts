import { createWorker } from "tesseract.js";
import { extractTextFromDocx } from "./pdfProcessor"; // Updated import
import { apiRequest } from "./queryClient";
import type { Document } from "@shared/schema";

export async function processDocument(file: File): Promise<Document> {
  let text = "";
  let type = file.type;

  if (file.type === "application/pdf") {
    // If you still need to handle PDFs, you can add the logic here
    throw new Error("PDF processing is not supported at the moment.");
  } else if (file.type.startsWith("image/")) {
    const worker = await createWorker();
    const { data: { text: ocrText } } = await worker.recognize(file);
    await worker.terminate();
    text = ocrText;
  } else if (file.type.startsWith("text/")) {
    text = await file.text();
  } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    text = await extractTextFromDocx(file); // Use the updated function
  } else {
    throw new Error("Unsupported file type");
  }

  const response = await apiRequest("POST", "/api/documents", {
    title: file.name,
    content: text,
    type,
  });

  return response.json();
}