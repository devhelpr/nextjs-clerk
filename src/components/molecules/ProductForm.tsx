import React from "react";
import { FormInput } from "../atoms/FormInput";
import { Button } from "../atoms/Button";
import { Product } from "@/types/product";

interface ProductFormProps {
  onSubmit: (product: Partial<Product>) => Promise<void>;
  initialProduct?: Partial<Product>;
}

export const ProductForm = ({
  onSubmit,
  initialProduct = {},
}: ProductFormProps) => {
  const [product, setProduct] =
    React.useState<Partial<Product>>(initialProduct);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.name) return;

    setIsLoading(true);
    try {
      await onSubmit(product);
      setProduct({});
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <FormInput
        value={product.name || ""}
        onChange={(e) => setProduct({ ...product, name: e.target.value })}
        placeholder="Product name"
        required
      />
      <FormInput
        type="number"
        value={product.price || ""}
        onChange={(e) =>
          setProduct({
            ...product,
            price: e.target.value ? parseFloat(e.target.value) : undefined,
          })
        }
        placeholder="Price"
        className="w-24"
      />
      <FormInput
        value={product.description || ""}
        onChange={(e) =>
          setProduct({
            ...product,
            description: e.target.value,
          })
        }
        placeholder="Description"
      />
      <Button
        type="submit"
        disabled={!product.name || isLoading}
        variant="primary"
      >
        {isLoading ? "Adding..." : "Add Product"}
      </Button>
    </form>
  );
};
