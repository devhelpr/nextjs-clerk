"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/organisms/DataTable";
import Button from "@/components/atoms/Button";

interface Product {
  id: number;
  name: string;
  price: number | null;
  description: string | null;
  createdAt: string;
}

export default function ProductView() {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});

  const fetchData = async (page: number, limit: number) => {
    const response = await fetch(`/api/product?page=${page}&limit=${limit}`);
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    return result;
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleSave = async (product: Product) => {
    const response = await fetch("/api/product", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    setEditingProduct(null);
  };

  const handleCancel = () => {
    setEditingProduct(null);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const response = await fetch(`/api/product?id=${product.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProduct.name) return;

    const response = await fetch("/api/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    setNewProduct({});
  };

  const columns: Column<Product>[] = [
    { header: "ID", accessor: "id" },
    { header: "Name", accessor: "name" },
    {
      header: "Price",
      accessor: "price",
      className: "text-right",
    },
    { header: "Description", accessor: "description" },
    {
      header: "Created At",
      accessor: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
  ];

  return (
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
              />
              <input
                type="number"
                value={newProduct.price || ""}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    price: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                placeholder="Price"
                className="border rounded px-2 py-1 w-24 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
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
              />
              <Button type="submit" disabled={!newProduct.name}>
                Add Product
              </Button>
            </form>
          </div>
        </div>

        <DataTable<Product>
          columns={columns}
          fetchData={fetchData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          keyExtractor={(item) => item.id}
          editingItem={editingProduct}
          onSave={handleSave}
          onCancelEdit={handleCancel}
        />
      </div>
    </main>
  );
}
