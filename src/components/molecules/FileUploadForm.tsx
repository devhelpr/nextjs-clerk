"use client";

import { useState } from "react";
import Button from "../atoms/Button";

interface FileUploadFormProps {
  onSubmit: (file: File) => Promise<void>;
  accept?: string;
}

export function FileUploadForm({
  onSubmit,
  accept = ".pdf",
}: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    try {
      await onSubmit(file);
      setFile(null);
      // Reset the file input
      const form = e.target as HTMLFormElement;
      form.reset();
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="file"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Upload PDF Document
        </label>
        <input
          type="file"
          id="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={isLoading}
          className="block w-full text-sm text-gray-500 dark:text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            dark:file:bg-blue-900/50 dark:file:text-blue-200
            hover:file:bg-blue-100 dark:hover:file:bg-blue-900
            disabled:opacity-50 disabled:cursor-not-allowed"
          required
        />
      </div>
      <Button type="submit" disabled={!file || isLoading} variant="primary">
        {isLoading ? "Uploading..." : "Upload Document"}
      </Button>
    </form>
  );
}
