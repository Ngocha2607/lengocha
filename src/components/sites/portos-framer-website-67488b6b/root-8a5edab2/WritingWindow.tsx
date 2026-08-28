"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Body of the "Writing" window — the chrome comes from `WindowFrame`.
 *
 * REPLACES the template's "Journal" window entirely. That one was a two-slide
 * carousel plus six stock-photo cards of invented design essays. This reads the
 * owner's real Writing database in Notion — the same database that drives
 * lengocha.vercel.app/#writing — so editing a post there updates this window too.
 *
 * The window is a master-detail pair rather than a second browser tab: clicking a
 * card swaps the body for the article and offers "← Writing" back, which mirrors
 * how the owner's own article pages are laid out.
 *
 * Nothing here imports `@/lib/notion`. That module holds `NOTION_TOKEN`, and a
 * `"use client"` component's imports are shipped to the browser, so the window
 * only ever talks to `/api/writing`.
 *
 * The one part of this site that needs the network. Everything else is
 * same-origin and works offline; posts and their cover images do not.
 */

interface PostMeta {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  emoji: string;
  coverUrl: string;
}

interface PostDetail extends PostMeta {
  /** Rendered on the server, with raw HTML from the Notion source escaped. */
  html: string;
}

/** Matches the article dates on the owner's own site. */
function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

const LABEL_CLASS = "font-sans text-[11px] leading-[15px] font-medium tracking-[0.14em] text-black/45";
const TAG_CLASS =
  "font-sans rounded-full border border-black/10 px-2 py-[2px] text-[11px] leading-[15px] text-black/55";
const NOTE_CLASS = "font-sans text-[12px] leading-[16.8px] text-black/50";

export function WritingWindow() {
  const [posts, setPosts] = useState<PostMeta[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const [openSlug, setOpenSlug] = useState<string | null>(null);

  /**
   * The loaded article is TAGGED with the slug it belongs to, rather than being
   * cleared when a new one opens. Clearing would mean a synchronous `setState`
   * in the effect body, which `react-hooks/set-state-in-effect` rejects — and it
   * is right to: that is a second render pass for something the render can just
   * work out. A tag mismatch already means "not loaded yet".
   */
  const [loaded, setLoaded] = useState<{
    slug: string;
    post?: PostDetail;
    error?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/writing")
      .then((r) => r.json())
      .then((data: { posts?: PostMeta[]; configured?: boolean }) => {
        if (cancelled) return;
        setPosts(data.posts ?? []);
        if (data.configured === false) {
          setListError("Notion is not configured, so there is nothing to show yet.");
        }
      })
      .catch(() => {
        if (!cancelled) setListError("Could not reach Notion. Check the connection and try again.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch whichever article is open. `cancelled` plus the slug tag means a fast
  // second click cannot have its result overwritten by the first request landing
  // late.
  useEffect(() => {
    if (!openSlug) return;
    let cancelled = false;

    fetch(`/api/writing/${openSlug}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data: { post: PostDetail }) => {
        if (!cancelled) setLoaded({ slug: openSlug, post: data.post });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ slug: openSlug, error: "That article could not be loaded." });
      });

    return () => {
      cancelled = true;
    };
  }, [openSlug]);

  // Only trust what was loaded if it belongs to the article currently open.
  const current = loaded && loaded.slug === openSlug ? loaded : null;

  const close = useCallback(() => setOpenSlug(null), []);

  /**
   * Warm the server's cache before the click lands.
   *
   * A cold article costs 1-11s depending on how nested it is, because
   * `pageToMarkdown` walks the block tree one level per request. Pointing at a
   * card is a strong enough signal to start that walk, and by the time the click
   * arrives the route usually answers from cache instead. Fire-and-forget: the
   * response is deliberately discarded, since the point is the SERVER cache, not
   * anything this component holds.
   */
  const prefetched = useRef<Set<string>>(new Set());
  const prefetch = useCallback((slug: string) => {
    if (prefetched.current.has(slug)) return;
    prefetched.current.add(slug);
    void fetch(`/api/writing/${slug}`).catch(() => {
      // A failed warm-up is not worth surfacing — the real click will retry and
      // report properly. Just allow another attempt.
      prefetched.current.delete(slug);
    });
  }, []);

  // Escape returns to the list. `WindowFrame` owns Escape for closing the
  // window, so this listener stops the event when a detail view is open.
  useEffect(() => {
    if (!openSlug) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      close();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [openSlug, close]);

  if (openSlug) {
    return (
      <div data-no-drag className="px-5 pb-[60px]">
        {/* The article deliberately does NOT follow `--portos-content-max`. Every
            other window widens when maximised; prose should not. At 13px, 1112px
            is roughly 150 characters a line, well past the point where the eye
            loses its place returning to the left margin. This stays a reading
            measure whatever the frame does. */}
        <div className="mx-auto w-full min-[880px]:max-w-[824px]">
          <button
            type="button"
            onClick={close}
            className="font-sans cursor-pointer rounded-full border border-black/15 px-3 py-[3px] text-[11px] leading-[16px] text-black/70 transition-colors hover:border-black/40 hover:text-black"
          >
            ← Back
          </button>

          {current?.error ? (
            <p className={cn(NOTE_CLASS, "mt-8")}>{current.error}</p>
          ) : !current?.post ? (
            // Says what is happening, because it can genuinely take a while: a
            // cold article costs one Notion request per level of block nesting,
            // measured at 1-11s across these four posts. A bare "Loading…" that
            // sits there for eleven seconds reads as broken.
            <p className={cn(NOTE_CLASS, "mt-8")}>
              Fetching from Notion… a long article can take a few seconds the first time.
            </p>
          ) : (
            <article className="mt-8">
              <header className="border-b border-black/10 pb-6">
                <h1 className="font-display text-[26px] leading-[32px] font-bold tracking-[-0.52px] text-black">
                  {current.post.emoji ? `${current.post.emoji} ` : ""}
                  {current.post.title}
                </h1>
                {formatDate(current.post.date) ? (
                  <p className={cn(LABEL_CLASS, "mt-4")}>
                    <time dateTime={current.post.date}>{formatDate(current.post.date)}</time>
                  </p>
                ) : null}
                {current.post.tags.length > 0 ? (
                  <ul className="mt-4 flex flex-wrap gap-[6px]" aria-label="Topics">
                    {current.post.tags.map((tag) => (
                      <li key={tag} className={TAG_CLASS}>
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </header>

              {/* Server-rendered from Notion Markdown; raw HTML in the source is
                  escaped by `renderMarkdown`, so this cannot inject script. */}
              <div
                className="portos-prose mt-8"
                dangerouslySetInnerHTML={{ __html: current.post.html }}
              />
            </article>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pb-[60px]">
      {/* The card list DOES follow the frame — cards are art, not prose. */}
      <div className="mx-auto w-full min-[880px]:max-w-[var(--portos-content-max)]">
        {listError ? (
          <p className={cn(NOTE_CLASS, "mt-6")}>{listError}</p>
        ) : posts === null ? (
          <p className={cn(NOTE_CLASS, "mt-6")}>Loading…</p>
        ) : posts.length === 0 ? (
          <p className={cn(NOTE_CLASS, "mt-6")}>No published posts yet.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 min-[560px]:grid-cols-2 min-[880px]:grid-cols-3">
            {posts.map((post) => (
              <button
                key={post.id}
                type="button"
                data-no-drag
                onClick={() => setOpenSlug(post.slug)}
                onPointerEnter={() => prefetch(post.slug)}
                onFocus={() => prefetch(post.slug)}
                className="group flex w-full cursor-pointer flex-col items-start text-left"
              >
                {post.coverUrl ? (
                  // `min-h-0`: this is a flex item, so its automatic minimum is
                  // the image's intrinsic height, which overrides `aspect-ratio`
                  // for anything flatter than 2:1.
                  <div className="aspect-[2] w-full min-h-0 overflow-clip">
                    <Image
                      src={post.coverUrl}
                      alt=""
                      width={1200}
                      height={600}
                      sizes="(min-width: 880px) 548px, 100vw"
                      className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                    />
                  </div>
                ) : null}

                <p className={cn(LABEL_CLASS, "mt-3")}>{formatDate(post.date)}</p>

                <p className="font-display mt-[6px] text-[15px] leading-[21px] font-medium tracking-[-0.3px] text-black">
                  {post.emoji ? `${post.emoji} ` : ""}
                  {post.title}
                </p>

                {post.description ? (
                  <p className="font-sans mt-2 text-[12px] leading-[16.8px] text-black/70">
                    {post.description}
                  </p>
                ) : null}

                {post.tags.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-[6px]">
                    {post.tags.slice(0, 4).map((tag) => (
                      <li key={tag} className={TAG_CLASS}>
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
