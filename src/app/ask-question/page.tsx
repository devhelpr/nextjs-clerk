"use client";

import { useState } from "react";
import { AskQuestionForm } from "@/components/molecules/AskQuestionForm";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Send, Upload } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AskQuestionPage() {
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (query: string) => {
    setIsLoading(true);
    setResponse("");

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            AI Document Assistant
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            Krijg direct antwoord op je vragen over je documenten
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" /> RAG
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Send className="w-4 h-4" /> LangChain
            </span>
            <span>•</span>
            <span>Vector DB</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8"
        >
          <AskQuestionForm onSubmit={handleSubmit} isLoading={isLoading} />
        </motion.div>

        {response && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Antwoord
            </h2>
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 prose-pre:p-4 prose-pre:rounded-lg prose-headings:text-gray-800 dark:prose-headings:text-gray-200 prose-a:text-purple-600 dark:prose-a:text-purple-400">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {response}
              </ReactMarkdown>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Link
            href="/upload-document"
            className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload een nieuw document
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
