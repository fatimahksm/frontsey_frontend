import type { CategoryDto } from "@/lib/api/types";

/**
 * The menu's category hierarchy is one level deep: top-level categories, each
 * with zero or more sub-categories (Coffee -> Hot / Iced). The backend returns
 * a flat list with a `parentId`, so every admin surface that shows categories
 * would otherwise re-derive the same grouping and the same "Parent › Child"
 * labels. These helpers are that single derivation.
 */

export interface CategoryNode {
  category: CategoryDto;
  subcategories: CategoryDto[];
}

/** Groups a flat category list into top-level categories each holding their sub-categories. */
export function buildCategoryTree(categories: CategoryDto[]): CategoryNode[] {
  return categories
    .filter((category) => !category.parentId)
    .map((category) => ({
      category,
      subcategories: categories.filter((candidate) => candidate.parentId === category.id),
    }));
}

/** "Coffee › Iced" for a sub-category, plain "Coffee" for a top-level one. */
export function categoryPathLabel(category: CategoryDto, categories: CategoryDto[]): string {
  if (!category.parentId) return category.name;
  const parent = categories.find((candidate) => candidate.id === category.parentId);
  return parent ? `${parent.name} › ${category.name}` : category.name;
}

/**
 * Categories in tree order (each parent immediately followed by its own
 * sub-categories), labelled by full path - the order and wording every
 * category `<select>` in the dashboard uses.
 */
export function categorySelectOptions(categories: CategoryDto[]): { id: string; label: string }[] {
  return buildCategoryTree(categories).flatMap(({ category, subcategories }) => [
    { id: category.id, label: category.name },
    ...subcategories.map((sub) => ({ id: sub.id, label: `${category.name} › ${sub.name}` })),
  ]);
}
