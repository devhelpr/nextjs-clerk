import Button from "../atoms/Button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export const Pagination = ({
  page,
  totalPages,
  onPageChange,
  loading,
}: PaginationProps) => {
  return (
    <div className="flex gap-2">
      <Button
        onClick={() => onPageChange(1)}
        disabled={page === 1 || loading}
        variant="secondary"
        size="sm"
      >
        First
      </Button>
      <Button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1 || loading}
        variant="secondary"
        size="sm"
      >
        Previous
      </Button>
      <span className="px-3 py-1 dark:text-white">
        Page {page} of {totalPages}
      </span>
      <Button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages || loading}
        variant="secondary"
        size="sm"
      >
        Next
      </Button>
      <Button
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages || loading}
        variant="secondary"
        size="sm"
      >
        Last
      </Button>
    </div>
  );
};

export default Pagination;
