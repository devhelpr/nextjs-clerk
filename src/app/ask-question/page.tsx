"use client";

import { useState, useEffect, useRef } from "react";
import { AskQuestionForm } from "@/components/molecules/AskQuestionForm";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Send, Upload } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AskQuestionPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (query: string) => {
    setIsLoading(true);

    // Add user message immediately
    const userMessage: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("/api/ask-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          history: messages,
        }),
      });

      const data = await res.json();

      // Add assistant response
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Error: Failed to process query",
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Error processing query:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-6 flex flex-col h-full">
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-4 flex-shrink-0"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
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
            <span>•</span>
            <span>Prompt Engineering</span>
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-6 pb-[15rem]">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 ${
                    message.role === "user" ? "mr-12" : "ml-12"
                  }`}
                >
                  <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    {message.role === "user" ? "Vraag" : "Antwoord"}
                  </h2>
                  <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 prose-pre:p-4 prose-pre:rounded-lg prose-headings:text-gray-800 dark:prose-headings:text-gray-200 prose-a:text-purple-600 dark:prose-a:text-purple-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-900 pt-6 z-20">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6"
            >
              <AskQuestionForm onSubmit={handleSubmit} isLoading={isLoading} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center mb-6"
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
      </div>
    </div>
  );
}
