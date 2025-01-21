import React, { useEffect, useState } from "react";
import LoadingSpinner from "../atoms/LoadingSpinner";
import TableCell from "../atoms/TableCell";
import Button from "../atoms/Button";
import Pagination from "../molecules/Pagination";
import EditableRow from "../molecules/EditableRow";
import { Column } from "@/types/table";

export interface DataTableProps<T> {
  columns: Column<T>[];
  fetchData: (
    page: number,
    limit: number
  ) => Promise<{
    data: T[];
    total: number;
  }>;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => Promise<void>;
  onSave?: (item: T) => Promise<void>;
  onCancelEdit?: () => void;
  keyExtractor: (item: T) => string | number;
  editingItem?: T | null;
  refreshTrigger?: number;
}

export function DataTable<T>({
  columns,
  fetchData,
  onEdit,
  onDelete,
  onSave,
  onCancelEdit,
  keyExtractor,
  editingItem,
  refreshTrigger = 0,
}: DataTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(10);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await fetchData(page, limit);
      setData(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, limit, refreshTrigger]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-end">
        <select
          className="border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={limit}
          onChange={(e) => {
            setLimit(parseInt(e.target.value));
            setPage(1);
          }}
          disabled={isLoading}
        >
          <option value="5">5 per page</option>
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
        </select>
      </div>

      <div className="relative overflow-x-auto">
        {isLoading && <LoadingSpinner />}
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <TableCell key={index} isHeader className={column.className}>
                  {column.header}
                </TableCell>
              ))}
              {(onEdit || onDelete) && <TableCell isHeader>Actions</TableCell>}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const isEditing =
                editingItem && keyExtractor(editingItem) === keyExtractor(item);

              if (isEditing && editingItem && onSave && onCancelEdit) {
                return (
                  <EditableRow
                    key={keyExtractor(item)}
                    item={editingItem}
                    columns={columns}
                    onSave={onSave}
                    onCancel={onCancelEdit}
                    loading={isLoading}
                  />
                );
              }

              return (
                <tr
                  key={keyExtractor(item)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {columns.map((column, index) => (
                    <TableCell key={index} className={column.className}>
                      {typeof column.accessor === "function"
                        ? column.accessor(item)
                        : String(item[column.accessor] ?? "")}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell>
                      <div className="flex gap-2">
                        {onEdit && (
                          <Button
                            onClick={() => onEdit(item)}
                            variant="secondary"
                            size="sm"
                            disabled={isLoading || !!editingItem}
                          >
                            Edit
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            onClick={() => onDelete(item)}
                            variant="danger"
                            size="sm"
                            disabled={isLoading || !!editingItem}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{" "}
          {total} results
        </div>
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            loading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

export default DataTable;
