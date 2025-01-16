"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

// Dynamic import of TipTap editor to avoid SSR issues
const RichTextEditor = dynamic(() => import("../components/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-32 bg-gray-50 dark:bg-gray-800 animate-pulse rounded-md" />
  ),
});

interface ChatMessage {
  id: string;
  sender: "user" | "owner";
  message: string;
  created_at: string;
  files?: {
    id: string;
    file_url: string;
    file_name: string;
    uploaded_at: string;
  }[];
}

interface FileUpload {
  file: File;
  previewUrl: string;
}

export default function ChatSessionPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/chat/messages?session_id=${id}&sort=asc`
      );
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setMessages(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newUploads = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setFileUploads((prev) => [...prev, ...newUploads]);
  };

  const removeFile = (index: number) => {
    setFileUploads((prev) => {
      const newUploads = [...prev];
      URL.revokeObjectURL(newUploads[index].previewUrl);
      newUploads.splice(index, 1);
      return newUploads;
    });
  };

  const uploadFile = async (
    file: File
  ): Promise<{ url: string; name: string }> => {
    // TODO: Implement actual file upload to your storage service
    // This is a placeholder that simulates a file upload
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          url: URL.createObjectURL(file),
          name: file.name,
        });
      }, 1000);
    });
  };

  const handleSubmit = async (content: string) => {
    if (!content.trim() && fileUploads.length === 0) return;

    try {
      setSending(true);

      // Upload files first
      const uploadedFiles = await Promise.all(
        fileUploads.map(async ({ file }) => {
          const { url, name } = await uploadFile(file);
          return { file_url: url, file_name: name };
        })
      );

      // Send message with files
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: id,
          message: content,
          files: uploadedFiles,
        }),
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      // Clear files and add new message
      setFileUploads([]);
      setMessages((prev) => [...prev, result.data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-4 ${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: message.message }}
              />
              {message.files && message.files.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      {file.file_name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img
                          src={file.file_url}
                          alt={file.file_name}
                          className="max-w-sm rounded"
                        />
                      ) : (
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-300 hover:text-blue-200"
                        >
                          📎 {file.file_name}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div
                className={`text-xs mt-1 ${
                  message.sender === "user"
                    ? "text-blue-200"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {new Date(message.created_at).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* File previews */}
      {fileUploads.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4">
            {fileUploads.map((upload, index) => (
              <div key={index} className="relative group">
                {upload.file.type.startsWith("image/") ? (
                  <img
                    src={upload.previewUrl}
                    alt={upload.file.name}
                    className="h-20 w-20 object-cover rounded"
                  />
                ) : (
                  <div className="h-20 w-20 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                    📄
                  </div>
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-2">
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
              📎
            </span>
          </label>
        </div>
        <RichTextEditor onSubmit={handleSubmit} disabled={sending} />
      </div>
    </div>
  );
}
