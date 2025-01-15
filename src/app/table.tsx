"use client";
import { useEffect, useState } from "react";

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!data.length) return <div className="p-4">No data found</div>;

  return (
    <>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="p-4 w-full">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Database Records</h1>
            <div className="flex items-center gap-4">
              <select
                className="border rounded px-2 py-1"
                value={pagination.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto mb-4">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  {Object.keys(data[0]).map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 border-b border-gray-300 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {Object.values(row).map((value: any, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-300"
                      >
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasMore}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.page === pagination.totalPages}
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
