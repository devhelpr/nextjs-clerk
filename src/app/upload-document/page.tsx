"use client";

import { useState } from "react";
import { FileUploadForm } from "@/components/molecules/FileUploadForm";

export default function UploadDocumentPage() {
  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error" | "none";
  }>({ message: "", type: "none" });

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload document");
      }

      setStatus({
        message: "Document uploaded and processed successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Upload error:", error);
      setStatus({
        message:
          error instanceof Error ? error.message : "Failed to upload document",
        type: "error",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">
        Upload Document
      </h1>

      <div className="mb-6">
        <FileUploadForm onSubmit={handleUpload} />
      </div>

      {status.type !== "none" && (
        <div
          className={`p-4 rounded-lg ${
            status.type === "success"
              ? "bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-200"
              : "bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-200"
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
