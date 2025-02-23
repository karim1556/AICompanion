import * as pdfjs from "pdfjs-dist";

// Initialize PDF.js worker
const workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
);

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc.toString();

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    fullText += strings.join(" ") + "\n";
  }

  return fullText;
}