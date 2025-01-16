"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function ChatSessionsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/chat/sessions?sort=desc");
      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Handle empty sessions as a valid state
      setSessions(result.data || []);
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
          title: `Chat ${new Date().toLocaleDateString()}`,
        }),
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      await fetchSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chat Sessions</h1>
        <button
          onClick={createNewSession}
          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          New Chat
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No chat sessions yet
          </p>
          <button
            onClick={createNewSession}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-md"
          >
            Start your first chat
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/chat/${session.id}`}
              className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {session.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Created {new Date(session.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated{" "}
                  {new Date(session.updated_at).toLocaleTimeString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
