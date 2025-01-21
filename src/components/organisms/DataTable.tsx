import { useEffect, useState } from "react";
import LoadingSpinner from "../atoms/LoadingSpinner";
import TableCell from "../atoms/TableCell";
import Button from "../atoms/Button";
import Pagination from "../molecules/Pagination";
import EditableRow from "../molecules/EditableRow";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  fetchData: (
    page: number,
    limit: number
  ) => Promise<{ data: T[]; pagination: PaginationData }>;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onSave?: (item: T) => Promise<void>;
  onCancelEdit?: () => void;
  editingItem?: T | null;
  keyExtractor: (item: T) => string | number;
  defaultLimit?: number;
}

export function DataTable<T>({
  columns,
  fetchData,
  onEdit,
  onDelete,
  onSave,
  onCancelEdit,
  editingItem,
  keyExtractor,
  defaultLimit = 10,
}: DataTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: defaultLimit,
    totalPages: 0,
    hasMore: false,
  });

  const loadData = async (page: number, limit: number) => {
    try {
      setLoading(true);
      const result = await fetchData(page, limit);
      setData(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(event.target.value);
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handleSave = async (item: T) => {
    try {
      setLoading(true);
      await onSave?.(item);
      await loadData(pagination.page, pagination.limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: T) => {
    try {
      setLoading(true);
      await onDelete?.(item);
      await loadData(pagination.page, pagination.limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancelEdit?.();
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-end">
        <select
          className="border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={pagination.limit}
          onChange={handleLimitChange}
          disabled={loading}
        >
          <option value="5">5 per page</option>
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
        </select>
      </div>

      <div className="relative overflow-x-auto">
        {loading && <LoadingSpinner />}
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

              if (isEditing && editingItem) {
                return (
                  <EditableRow
                    key={keyExtractor(item)}
                    item={editingItem}
                    columns={columns}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    loading={loading}
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
                            disabled={loading || !!editingItem}
                          >
                            Edit
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            onClick={() => handleDelete(item)}
                            variant="danger"
                            size="sm"
                            disabled={loading || !!editingItem}
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
          Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
          {pagination.total} results
        </div>
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
          {error}
        </div>
      )}
    </div>
  );
}

export default DataTable;
