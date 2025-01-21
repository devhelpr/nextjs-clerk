"use client";

import React, { useState, useCallback } from "react";
import { Product } from "@/types/product";
import { ProductForm } from "@/components/molecules/ProductForm";
import { DataTable } from "@/components/organisms/DataTable";
import { Column } from "@/types/table";

export default function ProductView() {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchData = async (page: number, limit: number) => {
    const response = await fetch(`/api/product?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    const result = await response.json();
    console.log("API Response:", result); // Debug log
    return {
      data: Array.isArray(result.data) ? result.data : [],
      total:
        typeof result.total === "number"
          ? result.total
          : result.data?.length || 0,
    };
  };

  const refreshTable = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

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
    refreshTable();
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
    refreshTable();
  };

  const handleAdd = async (product: Partial<Product>) => {
    const response = await fetch("/api/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    refreshTable();
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
      accessor: (item: Product) =>
        new Date(item.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <div className="p-4 w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold dark:text-white">Products</h1>
          <div className="flex items-center gap-4">
            <ProductForm onSubmit={handleAdd} />
          </div>
        </div>

        <DataTable<Product>
          columns={columns}
          fetchData={fetchData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          keyExtractor={(item: Product) => item.id}
          editingItem={editingProduct}
          onSave={handleSave}
          onCancelEdit={handleCancel}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </main>
  );
}
