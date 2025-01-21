import { useState } from "react";
import { Column } from "../organisms/DataTable";
import TableCell from "../atoms/TableCell";
import Button from "../atoms/Button";

interface EditableRowProps<T> {
  item: T;
  columns: Column<T>[];
  onSave: (item: T) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function EditableRow<T extends Record<string, any>>({
  item,
  columns,
  onSave,
  onCancel,
  loading,
}: EditableRowProps<T>) {
  const [editedItem, setEditedItem] = useState<T>({ ...item });

  const handleChange = (key: keyof T, value: any) => {
    setEditedItem((prev: T) => ({ ...prev, [key]: value }));
  };

  return (
    <tr className="bg-blue-50 dark:bg-blue-900/20">
      {columns.map((column, index) => {
        if (typeof column.accessor === "function") {
          return (
            <TableCell key={index} className={column.className}>
              {column.accessor(editedItem)}
            </TableCell>
          );
        }

        const value = editedItem[column.accessor];
        return (
          <TableCell key={index} className={column.className}>
            <input
              type={typeof value === "number" ? "number" : "text"}
              value={value ?? ""}
              onChange={(e) =>
                handleChange(
                  column.accessor as keyof T,
                  typeof value === "number"
                    ? Number(e.target.value)
                    : e.target.value
                )
              }
              className="w-full px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              autoFocus={index === 0}
            />
          </TableCell>
        );
      })}
      <TableCell>
        <div className="flex gap-2">
          <Button
            onClick={() => onSave(editedItem)}
            variant="primary"
            size="sm"
            disabled={loading}
          >
            Save
          </Button>
          <Button
            onClick={onCancel}
            variant="secondary"
            size="sm"
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </TableCell>
    </tr>
  );
}

export default EditableRow;
