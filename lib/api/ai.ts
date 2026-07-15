import { apiFetch } from "@/lib/api/client";
import type { AiSuggestionRequest, AiSuggestionResponse } from "@/lib/api/types";

/** `/api/ai/**` - short website-copy suggestions via OpenRouter (see backend AiProperties for the model). */
export const aiApi = {
  suggest(accessToken: string, request: AiSuggestionRequest): Promise<AiSuggestionResponse> {
    return apiFetch<AiSuggestionResponse>("/ai/suggestions", { method: "POST", body: request, accessToken });
  },
};
