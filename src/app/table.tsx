"use client";

import { useEffect, useState } from "react";

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

interface User {
  id: number;
  name: string;
}

const LoadingSpinner = () => (
  <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

// Add shimmer animation styles
const shimmer = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

const LoadingRow = () => (
  <tr>
    <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-gray-300">
      <div
        className="h-4 rounded relative overflow-hidden bg-gray-100"
        style={{ width: "2rem" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-[shimmer_1.5s_infinite]" />
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-gray-300">
      <div
        className="h-4 rounded relative overflow-hidden bg-gray-100"
        style={{ width: "8rem" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-[shimmer_1.5s_infinite]" />
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-gray-300">
      <div className="flex gap-2">
        <div
          className="h-4 rounded relative overflow-hidden bg-gray-100"
          style={{ width: "3rem" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-[shimmer_1.5s_infinite]" />
        </div>
        <div
          className="h-4 rounded relative overflow-hidden bg-gray-100"
          style={{ width: "3rem" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>
    </td>
  </tr>
);

export default function Home() {
  // Add shimmer keyframes to document
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = shimmer;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasMore: false,
  });

  const fetchData = async (page: number, limit: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/db?page=${page}&limit=${limit}`);
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setData(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setEditName(user.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSaveEdit = async (id: number) => {
    try {
      const response = await fetch("/api/db", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      await fetchData(pagination.page, pagination.limit);
      setEditingId(null);
      setEditName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update record");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      const response = await fetch(`/api/db?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      await fetchData(pagination.page, pagination.limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete record");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      await fetchData(pagination.page, pagination.limit);
      setNewName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add record");
    }
  };

  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="p-4 w-full">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Database Records</h1>
            <div className="flex items-center gap-4">
              <form onSubmit={handleAdd} className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter new name"
                  className="border rounded px-2 py-1"
                  required
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Add New
                </button>
              </form>
              <select
                className="border rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                value={pagination.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                disabled={loading}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto mb-4 relative">
            {loading && !initialLoading && <LoadingSpinner />}
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b border-gray-300 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 border-b border-gray-300 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 border-b border-gray-300 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {initialLoading ? (
                  Array.from({ length: pagination.limit }).map((_, index) => (
                    <LoadingRow key={index} />
                  ))
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-center text-gray-500 border-b border-gray-300"
                    >
                      No data found
                    </td>
                  </tr>
                ) : (
                  data.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-300">
                        {row.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-300">
                        {editingId === row.id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="border rounded px-2 py-1 w-full"
                            autoFocus
                            disabled={loading}
                          />
                        ) : (
                          row.name
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-gray-300">
                        {editingId === row.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(row.id)}
                              className="text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={loading}
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(row)}
                              className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(row.id)}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              {!initialLoading && (
                <>
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} results
                </>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1 || loading}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasMore || loading}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.page === pagination.totalPages || loading}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
