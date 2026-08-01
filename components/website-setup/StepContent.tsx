"use client";

import { MenuManager } from "@/components/menu/MenuManager";
import { ServicesManager } from "@/components/services/ServicesManager";
import { Button } from "@/components/ui/Button";
import { useWebsite } from "@/lib/website/website-context";

/** Wizard Step 4 - content step changes shape by website type (Menu vs Portfolio). */
export function StepContent({ onContinue }: { onContinue(): void }) {
  const { website } = useWebsite();
  const isMenu = website.templateType === "MENU_ORDERING";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{isMenu ? "Add your menu" : "Add your services"}</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {isMenu
            ? "Create categories, then add items with prices, images, sizes and add-ons."
            : "List the services you offer, with prices and images customers can browse."}
        </p>
      </div>

      {isMenu ? <MenuManager /> : <ServicesManager />}

      <Button onClick={onContinue} className="w-auto self-start px-6">
        Continue
      </Button>
    </div>
  );
}
