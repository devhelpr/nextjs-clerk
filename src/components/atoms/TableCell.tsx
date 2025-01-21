interface TableCellProps {
  children: React.ReactNode;
  isHeader?: boolean;
  className?: string;
  preventClickPropagation?: boolean;
}

export const TableCell = ({
  children,
  isHeader = false,
  className = "",
  preventClickPropagation = false,
}: TableCellProps) => {
  const Tag = isHeader ? "th" : "td";
  const baseClasses =
    "px-6 py-4 text-sm border-b border-gray-300 dark:border-gray-700";
  const headerClasses = isHeader
    ? "bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider"
    : "";

  const handleClick = (e: React.MouseEvent) => {
    if (preventClickPropagation) {
      e.stopPropagation();
    }
  };

  return (
    <Tag
      className={`${baseClasses} ${headerClasses} ${className}`}
      onClick={handleClick}
    >
      {children}
    </Tag>
  );
};

export default TableCell;
