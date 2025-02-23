import { useQuery } from "@tanstack/react-query";
import DocumentUpload from "@/components/DocumentUpload";
import FloatingButton from "@/components/FloatingButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Document } from "@shared/schema";

export default function Home() {
  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Document Assistant</h1>

      <div className="mb-8">
        <DocumentUpload />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardHeader>
              <CardTitle>{doc.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {doc.content.slice(0, 100)}...
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <FloatingButton />
    </div>
  );
}