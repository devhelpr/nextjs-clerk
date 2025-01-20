"use client";

import { useEffect, useState } from "react";
import styles from "./table.module.css";

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

interface Product {
  id: number;
  name: string;
  price: number | null;
  description: string | null;
  createdAt: string;
}

const LoadingSpinner = () => (
  <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-10">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
  </div>
);

const LoadingRow = () => (
  <tr>
    <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-gray-300">
      <div className={styles.shimmerContainer} style={{ width: "2rem" }}>
        <div className={styles.shimmerEffect} />
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-gray-300">
      <div className={styles.shimmerContainer} style={{ width: "8rem" }}>
        <div className={styles.shimmerEffect} />
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-gray-300">
      <div className={styles.shimmerContainer} style={{ width: "5rem" }}>
        <div className={styles.shimmerEffect} />
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-gray-300">
      <div className={styles.shimmerContainer} style={{ width: "12rem" }}>
        <div className={styles.shimmerEffect} />
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-gray-300">
      <div className="flex gap-2">
        <div className={styles.shimmerContainer} style={{ width: "3rem" }}>
          <div className={styles.shimmerEffect} />
        </div>
        <div className={styles.shimmerContainer} style={{ width: "3rem" }}>
          <div className={styles.shimmerEffect} />
        </div>
      </div>
    </td>
  </tr>
);

export default function ProductTable() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});
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
      const response = await fetch(`/api/product?page=${page}&limit=${limit}`);
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

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm(product);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async (id: number) => {
    try {
      const response = await fetch("/api/product", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editForm }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      await fetchData(pagination.page, pagination.limit);
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/product?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      await fetchData(pagination.page, pagination.limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      await fetchData(pagination.page, pagination.limit);
      setNewProduct({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add product");
    }
  };

  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="p-4 w-full">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold dark:text-white">Products</h1>
            <div className="flex items-center gap-4">
              <form onSubmit={handleAdd} className="flex gap-2">
                <input
                  type="text"
                  value={newProduct.name || ""}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder="Product name"
                  className="border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                  required
                  disabled={loading}
                />
                <input
                  type="number"
                  value={newProduct.price || ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      price: parseFloat(e.target.value),
                    })
                  }
                  placeholder="Price"
                  className="border rounded px-2 py-1 w-24 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                  disabled={loading}
                />
                <input
                  type="text"
                  value={newProduct.description || ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  placeholder="Description"
                  className="border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-600 dark:hover:bg-green-700"
                  disabled={loading || !newProduct.name}
                >
                  Add Product
                </button>
              </form>
              <select
                className="border rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500 dark:text-gray-400 border-b border-gray-300 dark:border-gray-700"
                    >
                      No products found
                    </td>
                  </tr>
                ) : (
                  data.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700">
                        {product.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700">
                        {editingId === product.id ? (
                          <input
                            type="text"
                            value={editForm.name || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            autoFocus
                            disabled={loading}
                          />
                        ) : (
                          product.name
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700">
                        {editingId === product.id ? (
                          <input
                            type="number"
                            value={editForm.price || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                price: parseFloat(e.target.value),
                              })
                            }
                            className="border rounded px-2 py-1 w-24 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            disabled={loading}
                          />
                        ) : (
                          product.price?.toFixed(2)
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700">
                        {editingId === product.id ? (
                          <input
                            type="text"
                            value={editForm.description || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                description: e.target.value,
                              })
                            }
                            className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            disabled={loading}
                          />
                        ) : (
                          product.description
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-gray-300 dark:border-gray-700">
                        {editingId === product.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(product.id)}
                              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={loading || !editForm.name}
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="text-sm text-gray-700 dark:text-gray-300">
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
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                Previous
              </button>
              <span className="px-3 py-1 dark:text-white">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasMore || loading}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.page === pagination.totalPages || loading}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
