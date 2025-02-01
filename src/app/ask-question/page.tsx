"use client";

import { useState } from "react";
import { AskQuestionForm } from "@/components/molecules/AskQuestionForm";

export default function AskQuestionPage() {
  const [response, setResponse] = useState("");

  const handleSubmit = async (query: string) => {
    setResponse("Loading...");

    try {
      const res = await fetch("/api/ask-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      setResponse("Error: Failed to process query");
      console.error("Error processing query:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">
        RAG Chatbot with LangChain & Prisma
      </h1>

      <div className="mb-6">
        <AskQuestionForm onSubmit={handleSubmit} />
      </div>

      {response && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-800 dark:text-gray-200">{response}</p>
        </div>
      )}
    </div>
  );
}
