"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ChatSession {
  id: string;
  session_name: string;
  created_at: string;
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/chat/sessions?sort=desc");
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setSessions(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_name: `Chat ${new Date().toLocaleDateString()}`,
        }),
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      await fetchSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    }
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.32))]">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={createNewSession}
            className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : error ? (
            <div className="p-4 text-red-500">{error}</div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-gray-500 dark:text-gray-400">
              No chat sessions yet
            </div>
          ) : (
            <nav className="space-y-1 p-2">
              {sessions.map((chatSession) => (
                <Link
                  key={chatSession.id}
                  href={`/chat/${chatSession.id}`}
                  className={`block px-3 py-2 rounded-md text-sm ${
                    pathname === `/chat/${chatSession.id}`
                      ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="font-medium truncate">
                    {chatSession.session_name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(chatSession.created_at).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {children}
      </div>
    </div>
  );
}
