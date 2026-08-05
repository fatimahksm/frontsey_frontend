"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { MenuItemForm } from "@/components/menu/MenuItemForm";
import { friendlyMessage } from "@/lib/api/client";
import { menuApi } from "@/lib/api/menu";
import type { CategoryDto, MenuItemRequest } from "@/lib/api/types";
import { useWebsite } from "@/lib/website/website-context";

const EMPTY: MenuItemRequest = {
  categoryId: "",
  name: "",
  description: "",
  ingredients: "",
  price: "0",
  discountPrice: null,
  imageUrl: "",
  maxOrderQuantity: null,
  fixedBoxItem: false,
};

export default function NewMenuItemPage() {
  const router = useRouter();
  const { website, accessToken } = useWebsite();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    menuApi.listCategories(accessToken, website.id).then(setCategories).catch(() => setCategories([]));
  }, [accessToken, website.id]);

  async function handleSubmit(request: MenuItemRequest) {
    setError(null);
    setIsSubmitting(true);
    try {
      const item = await menuApi.createItem(accessToken, website.id, request);
      router.push(`/dashboard/websites/${website.id}/menu/items/${item.id}`);
    } catch (err) {
      setError(friendlyMessage(err, "Failed to create item."));
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Add menu item</h1>
      {error && <Alert tone="error">{error}</Alert>}
      {categories.length === 0 ? (
        <p className="text-sm text-zinc-500">Create a category first before adding items.</p>
      ) : (
        <MenuItemForm categories={categories} initial={EMPTY} submitLabel="Create item" isSubmitting={isSubmitting} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
