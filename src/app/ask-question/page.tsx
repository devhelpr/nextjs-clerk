"use client";

import { useState } from "react";
import { AskQuestionForm } from "@/components/molecules/AskQuestionForm";
import Link from "next/link";

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
        AI chatbot die vragen beantwoordt gebaseerd op een vantevoren ingegeven
        context (pdf kan geupload worden)
      </h1>
      <h2>
        Implementatie mbv RAG , Vectordatabase , Typescript, Prisma/Postgresql,
        Langchain en Vercel
      </h2>

      <div className="my-6">
        <AskQuestionForm onSubmit={handleSubmit} />
      </div>

      {response && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-800 dark:text-gray-200">{response}</p>
        </div>
      )}

      <div className="mt-6">
        <Link
          href="/upload-document"
          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          Klik hier om een pdf te uploaden
        </Link>
      </div>
    </div>
  );
}
