"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import type { CategoryDto, MenuItemRequest } from "@/lib/api/types";
import { useWebsite } from "@/lib/website/website-context";

interface Props {
  categories: CategoryDto[];
  initial: MenuItemRequest;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit(request: MenuItemRequest): void;
}

export function MenuItemForm({ categories, initial, submitLabel, isSubmitting, onSubmit }: Props) {
  const { accessToken } = useWebsite();
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description ?? "");
  const [ingredients, setIngredients] = useState(initial.ingredients ?? "");
  const [price, setPrice] = useState(String(initial.price));
  const [discountPrice, setDiscountPrice] = useState(initial.discountPrice != null ? String(initial.discountPrice) : "");
  const [imageUrl, setImageUrl] = useState(initial.imageUrl ?? "");
  const [maxOrderQuantity, setMaxOrderQuantity] = useState(
    initial.maxOrderQuantity != null ? String(initial.maxOrderQuantity) : "",
  );
  const [fixedBoxItem, setFixedBoxItem] = useState(initial.fixedBoxItem);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({
      categoryId,
      name,
      description: description || null,
      ingredients: ingredients || null,
      price,
      discountPrice: discountPrice || null,
      imageUrl: imageUrl || null,
      maxOrderQuantity: maxOrderQuantity ? Number(maxOrderQuantity) : null,
      fixedBoxItem,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select id="categoryId" label="Category" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value="" disabled>
          Choose a category…
        </option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      <TextField id="name" label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
      <Textarea id="description" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Textarea id="ingredients" label="Ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="price"
          label="Price"
          type="number"
          step="0.01"
          min="0"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <TextField
          id="discountPrice"
          label="Discount price (optional)"
          type="number"
          step="0.01"
          min="0"
          value={discountPrice}
          onChange={(e) => setDiscountPrice(e.target.value)}
        />
        <ImageUploadField id="imageUrl" label="Image" value={imageUrl} onChange={setImageUrl} accessToken={accessToken} />
        <TextField
          id="maxOrderQuantity"
          label="Max order quantity (optional)"
          type="number"
          min="1"
          value={maxOrderQuantity}
          onChange={(e) => setMaxOrderQuantity(e.target.value)}
        />
      </div>

      <Checkbox
        id="fixedBoxItem"
        label="This is a fixed box item (uses box variants instead of sizes/add-ons)"
        checked={fixedBoxItem}
        onChange={(e) => setFixedBoxItem(e.target.checked)}
      />

      <Button type="submit" isLoading={isSubmitting} className="mt-2 w-auto px-5">
        {submitLabel}
      </Button>
    </form>
  );
}
