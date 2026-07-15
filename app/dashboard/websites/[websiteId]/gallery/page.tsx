"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { ApiError } from "@/lib/api/client";
import { galleryApi } from "@/lib/api/gallery";
import type { GalleryImageResponse } from "@/lib/api/types";
import { useWebsite } from "@/lib/website/website-context";

function moved<T>(list: T[], from: number, to: number): T[] {
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export default function GalleryPage() {
  const { website, accessToken } = useWebsite();
  const [images, setImages] = useState<GalleryImageResponse[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  async function load() {
    const list = await galleryApi.list(accessToken, website.id);
    setImages([...list].sort((a, b) => a.sortOrder - b.sortOrder));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load()
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load the gallery."))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, website.id]);

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    if (!imageUrl.trim()) return;
    setError(null);
    setIsBusy(true);
    try {
      await galleryApi.add(accessToken, website.id, imageUrl.trim());
      setImageUrl("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add image.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setIsBusy(true);
    try {
      await galleryApi.delete(accessToken, website.id, id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete image.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSetCover(id: string) {
    setError(null);
    setIsBusy(true);
    try {
      await galleryApi.setCover(accessToken, website.id, id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to set cover image.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const reordered = moved(images, index, target);
    setImages(reordered);
    setError(null);
    setIsBusy(true);
    try {
      await galleryApi.reorder(accessToken, website.id, reordered.map((i) => i.id));
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reorder gallery.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Gallery</h1>
      {error && <Alert tone="error">{error}</Alert>}

      <Card title="Images">
        {isLoading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {images.map((image, index) => (
              <li key={image.id} className="overflow-hidden rounded-lg border border-black/[.08] dark:border-white/[.145]">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URLs; next/image would need a configured remote pattern per business */}
                <img src={image.imageUrl} alt="" className="h-40 w-full object-cover" />
                <div className="flex items-center justify-between p-2 text-xs">
                  <div className="flex gap-2">
                    <button type="button" disabled={index === 0} onClick={() => handleMove(index, -1)} className="disabled:opacity-30">
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === images.length - 1}
                      onClick={() => handleMove(index, 1)}
                      className="disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetCover(image.id)}
                      className={image.cover ? "font-medium text-foreground" : "text-zinc-500 hover:underline"}
                    >
                      {image.cover ? "Cover" : "Set cover"}
                    </button>
                  </div>
                  <button type="button" className="text-red-600 hover:underline" onClick={() => handleDelete(image.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {images.length === 0 && <p className="text-sm text-zinc-500">No images yet.</p>}
          </ul>
        )}

        <form onSubmit={handleAdd} className="mt-5 flex items-end gap-2">
          <TextField id="imageUrl" label="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="flex-1" />
          <Button type="submit" isLoading={isBusy} className="w-auto px-5">
            Add image
          </Button>
        </form>
      </Card>
    </div>
  );
}
