"use client";

import { useState } from "react";
import { FormTextArea } from "../atoms/FormTextArea";
import Button from "../atoms/Button";

interface AskQuestionFormProps {
  onSubmit: (query: string) => Promise<void>;
}

export function AskQuestionForm({ onSubmit }: AskQuestionFormProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      await onSubmit(query);
      setQuery("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <FormTextArea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Stel een vraag..."
        required
        disabled={isLoading}
        className="w-full"
      />
      <Button
        type="submit"
        disabled={!query.trim() || isLoading}
        variant="primary"
        className="self-end"
      >
        {isLoading ? "Processing..." : "Verzend"}
      </Button>
    </form>
  );
}
