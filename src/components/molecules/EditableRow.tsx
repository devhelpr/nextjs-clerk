import { useState } from "react";
import { Column } from "@/types/table";
import TableCell from "../atoms/TableCell";
import Button from "../atoms/Button";

interface EditableRowProps<T> {
  item: T;
  columns: Column<T>[];
  onSave: (item: T) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function EditableRow<T>({
  item: initialItem,
  columns,
  onSave,
  onCancel,
  loading = false,
}: EditableRowProps<T>) {
  const [item, setItem] = useState<T>(initialItem);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(item);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: keyof T, value: any) => {
    setItem((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <tr className="bg-blue-50 dark:bg-blue-900/20">
      {columns.map((column, index) => (
        <TableCell key={index}>
          {typeof column.accessor === "function" ? (
            column.accessor(item)
          ) : (
            <input
              type="text"
              value={String(item[column.accessor] ?? "")}
              onChange={(e) =>
                handleChange(column.accessor as keyof T, e.target.value)
              }
              className="w-full px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          )}
        </TableCell>
      ))}
      <TableCell>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            variant="primary"
            size="sm"
            disabled={loading || isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            onClick={onCancel}
            variant="secondary"
            size="sm"
            disabled={loading || isSaving}
          >
            Cancel
          </Button>
        </div>
      </TableCell>
    </tr>
  );
}

export default EditableRow;
