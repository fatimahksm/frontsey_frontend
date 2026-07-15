"use client";

import { useState } from "react";

import { aiApi } from "@/lib/api/ai";
import { ApiError } from "@/lib/api/client";
import type { AiSuggestionFieldType, TemplateType } from "@/lib/api/types";

interface Props {
  accessToken: string;
  businessName: string;
  templateType?: TemplateType | null;
  fieldType: AiSuggestionFieldType;
  currentText: string;
  onSuggestion(text: string): void;
}

/** A small inline "Suggest with AI" affordance next to a text field - calls the AI assistant and hands the result back for the caller to fill in (still editable afterward). */
export function SuggestButton({ accessToken, businessName, templateType, fieldType, currentText, onSuggestion }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setIsLoading(true);
    try {
      const { suggestion } = await aiApi.suggest(accessToken, {
        businessName,
        templateType,
        fieldType,
        existingText: currentText || null,
      });
      onSuggestion(suggestion);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to get a suggestion.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-solid)] hover:underline disabled:opacity-50"
      >
        {isLoading ? "Thinking…" : "✨ Suggest with AI"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}
