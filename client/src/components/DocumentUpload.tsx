import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";
import { processDocument } from "@/lib/documentProcessor";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DocumentUpload() {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: processDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Document uploaded",
        description: "Your document has been processed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => mutation.mutate(file));
  }, [mutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
      "text/*": [".txt", ".csv", ".md"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"], // Add .docx
    },
  });

  return (
    <Card
      {...getRootProps()}
      className={`cursor-pointer ${
        isDragActive ? "border-primary" : "border-border"
      }`}
    >
      <CardContent className="flex flex-col items-center justify-center p-6">
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-center text-muted-foreground">
          {isDragActive
            ? "Drop files here"
            : "Drag & drop files here, or click to select"}
        </p>
        <Button variant="outline" className="mt-4">
          Select Files
        </Button>
      </CardContent>
    </Card>
  );
}