/**
 * The "who is this for" row under a template's name in the picker.
 *
 * Both places an owner chooses a template - the creation wizard and the Layout
 * tab - render it, because the choice is the same choice and a person who read
 * the list in one place should not meet a bare description in the other.
 */
export function BestForChips({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-black/[.08] px-2 py-0.5 text-[11px] text-zinc-600 dark:border-white/[.14] dark:text-zinc-400"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
