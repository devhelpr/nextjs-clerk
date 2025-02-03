import { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface FormTextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export function FormTextArea({ className, ...props }: FormTextAreaProps) {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        "text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
        "placeholder:text-gray-500 dark:placeholder:text-gray-400",
        "focus-visible:ring-purple-500 dark:focus-visible:ring-purple-400",
        "focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900",
        className
      )}
      {...props}
    />
  );
}
