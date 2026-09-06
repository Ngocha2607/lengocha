"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { PortosAppId } from "@/types/portos";
import { PROJECTS } from "./ProjectsWindow";
import { fetchPostList, prefetchPost, type PostMeta } from "./writingClient";

/**
 * A Spotlight-style command palette: ⌘K / Ctrl+K, or the menu bar's magnifier.
 *
 * The menu bar has carried a search glyph since day one because macOS has one;
 * on the live site it was a dead image. This makes it do what a visitor would
 * expect: search everything the desktop can open — windows, the six project
 * cards, and the Writing database — and jump straight there. Keyboard first:
 * arrows to move, Enter to open, Escape to leave.
 *
 * Search is diacritic-insensitive because the content is Vietnamese and a
 * recruiter's keyboard may not be: "phong thi" finds "phòng thi".
 */

interface SpotlightWindowItem {
  app: PortosAppId;
  title: string;
}

interface SpotlightProps {
  /**
   * The palette is MOUNTED only while open (the shell renders it conditionally),
   * so every open starts with fresh query/selection state for free — no reset
   * effect, no stale search from last time.
   */
  onClose: () => void;
  onOpenApp: (app: PortosAppId) => void;
  onOpenWriting: (slug: string) => void;
  windows: readonly SpotlightWindowItem[];
}

interface Item {
  key: string;
  group: "Windows" | "Projects" | "Writing";
  title: string;
  subtitle?: string;
  /** Warmed when the row is highlighted, so Enter lands on a cached article. */
  prefetchSlug?: string;
  run: () => void;
}

const GROUPS = ["Windows", "Projects", "Writing"] as const;

/** Same folding the slugs use, so queries match what the reader sees. */
const fold = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/** Every word of the query must appear somewhere in the haystack. */
function matches(haystack: string, query: string): boolean {
  const folded = fold(haystack);
  return query
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => folded.includes(word));
}

/** How many articles an EMPTY query shows; typing lifts the cap. */
const IDLE_WRITING_LIMIT = 5;

export function Spotlight({ onClose, onOpenApp, onOpenWriting, windows }: SpotlightProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  // Load the article index. `fetchPostList` memoises (and the desktop warms it
  // on boot), so this is almost always an instant cache hit.
  useEffect(() => {
    let cancelled = false;
    fetchPostList()
      .then((list) => {
        if (!cancelled) setPosts(list.posts);
      })
      .catch(() => {
        // No list, no Writing group — the other groups still work.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo<Item[]>(() => {
    const trimmed = fold(query.trim());

    const windowItems: Item[] = windows
      .filter((w) => !trimmed || matches(w.title, trimmed))
      .map((w) => ({
        key: `window:${w.app}`,
        group: "Windows",
        title: w.title,
        run: () => onOpenApp(w.app),
      }));

    const projectItems: Item[] = PROJECTS.filter(
      (p) => !trimmed || matches(`${p.title} ${p.description} ${p.tags.join(" ")}`, trimmed),
    ).map((p) => ({
      key: `project:${p.title}`,
      group: "Projects" as const,
      title: p.title,
      subtitle: p.description,
      prefetchSlug: p.writingSlug,
      run: () => {
        if (p.writingSlug) onOpenWriting(p.writingSlug);
        else if (p.href) window.open(p.href, "_blank", "noreferrer");
        else onOpenApp("projects");
      },
    }));

    const matchedPosts = posts.filter(
      (post) =>
        !trimmed || matches(`${post.title} ${post.description} ${post.tags.join(" ")}`, trimmed),
    );
    const writingItems: Item[] = (trimmed ? matchedPosts : matchedPosts.slice(0, IDLE_WRITING_LIMIT)).map(
      (post) => ({
        key: `post:${post.slug}`,
        group: "Writing" as const,
        title: `${post.emoji ? `${post.emoji} ` : ""}${post.title}`,
        subtitle: post.description,
        prefetchSlug: post.slug,
        run: () => onOpenWriting(post.slug),
      }),
    );

    return [...windowItems, ...projectItems, ...writingItems];
  }, [query, windows, posts, onOpenApp, onOpenWriting]);

  // Clamp the highlight when the result set shrinks under it.
  const activeIndex = Math.min(active, Math.max(items.length - 1, 0));
  const activeItem = items[activeIndex];

  // Warm whichever article the highlight is resting on.
  useEffect(() => {
    if (activeItem?.prefetchSlug) prefetchPost(activeItem.prefetchSlug);
  }, [activeItem]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const select = (item: Item) => {
    onClose();
    item.run();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => (items.length ? (current + 1) % items.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => (items.length ? (current - 1 + items.length) % items.length : 0));
    } else if (event.key === "Enter" && activeItem) {
      event.preventDefault();
      select(activeItem);
    }
  };

  return (
    // Above the dock (z 20) and every window. The backdrop is the close button.
    <div
      className="absolute inset-0 z-40 flex justify-center bg-black/20"
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-label="Spotlight search"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
        className="mt-[18vh] h-fit w-[min(560px,calc(100vw-40px))] overflow-clip rounded-2xl border border-white/40 bg-white/80 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <Search size={20} strokeWidth={2} className="shrink-0 text-black/40" aria-hidden />
          <input
            // eslint-disable-next-line jsx-a11y/no-autofocus -- a command
            // palette exists to be typed into; focusing it IS the interaction.
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            placeholder="Search windows, projects, writing…"
            aria-label="Search"
            className="font-sans w-full bg-transparent text-[17px] leading-[24px] text-black outline-none placeholder:text-black/35"
          />
          <kbd className="font-sans shrink-0 rounded border border-black/15 px-1.5 py-0.5 text-[10px] text-black/40">
            esc
          </kbd>
        </div>

        {items.length > 0 ? (
          <div ref={listRef} className="max-h-[46vh] overflow-y-auto border-t border-black/10 p-2">
            {GROUPS.map((group) => {
              const groupItems = items.filter((item) => item.group === group);
              if (groupItems.length === 0) return null;
              return (
                <div key={group} className="mb-1">
                  <p className="font-sans px-2 pb-1 pt-2 text-[11px] font-medium tracking-[0.14em] text-black/40">
                    {group.toUpperCase()}
                  </p>
                  {groupItems.map((item) => {
                    const index = items.indexOf(item);
                    const isActive = index === activeIndex;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        data-index={index}
                        onClick={() => select(item)}
                        onMouseEnter={() => setActive(index)}
                        className={cn(
                          "flex w-full cursor-pointer flex-col items-start rounded-lg px-2 py-1.5 text-left",
                          isActive ? "bg-[#3478f6] text-white" : "text-black",
                        )}
                      >
                        <span className="font-sans w-full truncate text-[14px] leading-[20px] font-medium">
                          {item.title}
                        </span>
                        {item.subtitle ? (
                          <span
                            className={cn(
                              "font-sans w-full truncate text-[12px] leading-[17px]",
                              isActive ? "text-white/80" : "text-black/50",
                            )}
                          >
                            {item.subtitle}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="font-sans border-t border-black/10 px-4 py-6 text-center text-[13px] text-black/45">
            No results for “{query}”
          </p>
        )}
      </div>
    </div>
  );
}
