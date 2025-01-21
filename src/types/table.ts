export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => string | number);
  className?: string;
}
