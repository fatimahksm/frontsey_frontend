"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { AddonGroupsManager } from "@/components/menu/AddonGroupsManager";
import { BoxVariantsManager } from "@/components/menu/BoxVariantsManager";
import { MenuItemForm } from "@/components/menu/MenuItemForm";
import { SizesManager } from "@/components/menu/SizesManager";
import { friendlyMessage } from "@/lib/api/client";
import { menuApi } from "@/lib/api/menu";
import type { CategoryDto, MenuItemRequest, MenuItemResponse } from "@/lib/api/types";
import { useWebsite } from "@/lib/website/website-context";

export default function EditMenuItemPage() {
  const router = useRouter();
  const params = useParams<{ itemId: string }>();
  const { website, accessToken } = useWebsite();

  const [item, setItem] = useState<MenuItemResponse | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // One item by its id. This used to fetch every item the website had and
    // find its one in the array, which on a shop with real stock is hundreds
    // of rows assembled and sent to open one form.
    Promise.all([
      menuApi.listCategories(accessToken, website.id),
      menuApi.getItem(accessToken, website.id, params.itemId),
    ])
      .then(([fetchedCategories, fetchedItem]) => {
        setCategories(fetchedCategories);
        setItem(fetchedItem);
      })
      .catch((err) => setError(friendlyMessage(err, "This item could not be found.")));
  }, [accessToken, website.id, params.itemId]);

  async function handleUpdate(request: MenuItemRequest) {
    if (!item) return;
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      const updated = await menuApi.updateItem(accessToken, website.id, item.id, request);
      setItem(updated);
      setMessage("Item updated.");
    } catch (err) {
      setError(friendlyMessage(err, "Failed to update item."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTrash() {
    if (!item) return;
    await menuApi.trashItem(accessToken, website.id, item.id);
    router.push(`/manage/${website.id}/menu`);
  }

  if (error && !item) {
    return <Alert tone="error">{error}</Alert>;
  }

  if (!item) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">{item.name}</h1>
        <button type="button" onClick={handleTrash} className="text-sm text-red-600 hover:underline">
          Move to trash
        </button>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      <Card title="Details">
        <MenuItemForm
          categories={categories}
          initial={{
            categoryId: item.categoryId,
            name: item.name,
            description: item.description,
            ingredients: item.ingredients,
            price: String(item.price),
            discountPrice: item.discountPrice != null ? String(item.discountPrice) : null,
            imageUrl: item.imageUrl,
            maxOrderQuantity: item.maxOrderQuantity,
            fixedBoxItem: item.fixedBoxItem,
          }}
          submitLabel="Save changes"
          isSubmitting={isSubmitting}
          onSubmit={handleUpdate}
        />
      </Card>

      {item.fixedBoxItem ? (
        <Card title="Box variants" description="Fixed quantities/prices for this box item (BRD 9.7).">
          <BoxVariantsManager accessToken={accessToken} websiteId={website.id} itemId={item.id} currency={website.currency} />
        </Card>
      ) : (
        <>
          <Card title="Sizes" description="Optional size options with their own price.">
            <SizesManager accessToken={accessToken} websiteId={website.id} itemId={item.id} currency={website.currency} />
          </Card>
          <Card title="Add-on groups" description="Optional extras customers can add, grouped with a selection limit.">
            <AddonGroupsManager accessToken={accessToken} websiteId={website.id} itemId={item.id} currency={website.currency} />
          </Card>
        </>
      )}
    </div>
  );
}
