"use client";

import { track } from "@vercel/analytics";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  fetchPost,
  fetchPostList,
  getCachedPost,
  invalidatePost,
  prefetchPost,
  type PostDetail,
  type PostMeta,
} from "./writingClient";

/**
 * Body of the "Writing" window — the chrome comes from `WindowFrame`.
 *
 * REPLACES the template's "Journal" window entirely. That one was a two-slide
 * carousel plus six stock-photo cards of invented design essays. This reads the
 * owner's real Writing database in Notion, through `/api/writing` and the shared
 * client cache in `writingClient.ts` (which is also what Spotlight searches).
 *
 * The window is a master-detail pair rather than a second browser tab: clicking a
 * card swaps the body for the article and offers "← Back". Opening an article
 * also updates the address bar to `/writing/<slug>` (via `onSlugChange`, owned by
 * DesktopShell) so what the visitor reads is what they would copy.
 *
 * Articles cross-reference each other with Notion URLs; the server rewrites the
 * ones it recognises to `/writing/<slug>` anchors tagged `data-post`, and this
 * window intercepts those clicks to navigate in place instead of leaving.
 */

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
const PILL_BUTTON_CLASS =
  "font-sans cursor-pointer rounded-full border border-black/15 px-3 py-[3px] text-[11px] leading-[16px] text-black/70 transition-colors hover:border-black/40 hover:text-black";

/** One `article_view` per slug per visit, however many times it is reopened. */
const viewedSlugs = new Set<string>();

/** The card list's placeholder while `/api/writing` answers. */
function ListSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 min-[560px]:grid-cols-2 min-[880px]:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[2] w-full rounded bg-black/10" />
          <div className="mt-3 h-3 w-24 rounded bg-black/10" />
          <div className="mt-2 h-4 w-full rounded bg-black/10" />
          <div className="mt-2 h-3 w-3/4 rounded bg-black/10" />
        </div>
      ))}
    </div>
  );
}

/**
 * The article placeholder. Shaped like an article rather than a spinner, plus a
 * line saying WHY it can take a moment: a cold article costs one Notion request
 * per level of block nesting, measured at 1-11s across these posts. The server
 * pre-warms every body after the first list request, so most visitors never see
 * this for long — but the first one after a deploy does.
 */
function ArticleSkeleton() {
  return (
    <div className="mt-8 animate-pulse">
      <div className="h-7 w-4/5 rounded bg-black/10" />
      <div className="mt-4 h-3 w-40 rounded bg-black/10" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className={cn("h-3 rounded bg-black/10", i % 3 === 2 ? "w-2/3" : "w-full")} />
        ))}
      </div>
      <p className={cn(NOTE_CLASS, "mt-8")}>
        Fetching from Notion… a long article can take a few seconds the first time.
      </p>
    </div>
  );
}

interface WritingWindowProps {
  /**
   * Opens directly on this article instead of the list. Set when something else
   * links to a write-up — a project card, Spotlight, or the /writing/[slug] route.
   */
  initialSlug?: string | null;
  /**
   * Reports every navigation (article opened, back to list) so the shell can
   * keep the address bar honest. Null means "showing the list".
   */
  onSlugChange?: (slug: string | null) => void;
}

export function WritingWindow({ initialSlug = null, onSlugChange }: WritingWindowProps) {
  const [posts, setPosts] = useState<PostMeta[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const [openSlug, setOpenSlug] = useState<string | null>(initialSlug);

  /**
   * The loaded article is TAGGED with the slug it belongs to, rather than being
   * cleared when a new one opens — a tag mismatch already means "not loaded yet",
   * and clearing would need a second render pass from inside an effect.
   */
  const [loaded, setLoaded] = useState<{
    slug: string;
    post?: PostDetail;
    error?: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  /** Bumped by "Try again" so the fetch effect re-runs for the SAME slug. */
  const [retryNonce, setRetryNonce] = useState(0);
  const articleTopRef = useRef<HTMLDivElement>(null);
  const proseRef = useRef<HTMLDivElement>(null);

  // No synchronous setState in here — the lint rule (and React) want effects to
  // only set state from async callbacks. The retry button clears state itself.
  const loadList = useCallback((force = false) => {
    fetchPostList(force)
      .then((list) => {
        setPosts(list.posts);
        setListError(
          list.configured ? null : "Notion is not configured, so there is nothing to show yet.",
        );
      })
      .catch(() => {
        setPosts((current) => current ?? []);
        setListError("Could not reach Notion. Check the connection and try again.");
      });
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  // Fetch whichever article is open, unless the shared cache already holds it.
  // The slug tag means a fast second click cannot have its result overwritten
  // by the first request landing late.
  useEffect(() => {
    if (!openSlug || getCachedPost(openSlug)) return;
    let cancelled = false;

    fetchPost(openSlug)
      .then((post) => {
        if (!cancelled) setLoaded({ slug: openSlug, post });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ slug: openSlug, error: "That article could not be loaded." });
      });

    return () => {
      cancelled = true;
    };
  }, [openSlug, retryNonce]);

  // Trust the shared cache first, then whatever this window loaded — but only
  // if it belongs to the article currently open.
  const cachedPost = openSlug ? getCachedPost(openSlug) : undefined;
  const current = cachedPost
    ? { slug: openSlug as string, post: cachedPost, error: undefined }
    : loaded && loaded.slug === openSlug
      ? loaded
      : null;

  const openArticle = useCallback(
    (slug: string) => {
      setOpenSlug(slug);
      setCopied(false);
      onSlugChange?.(slug);
    },
    [onSlugChange],
  );

  const close = useCallback(() => {
    setOpenSlug(null);
    onSlugChange?.(null);
  }, [onSlugChange]);

  // Landed at the top of every article, including when one article links to the
  // next: the scroll position of a 4,000-word read must not carry over.
  useEffect(() => {
    if (openSlug) articleTopRef.current?.scrollIntoView({ block: "start" });
  }, [openSlug]);

  // The per-article pageview. Vercel counts /writing/<slug> visits on its own;
  // this event is what covers articles opened INSIDE the desktop, where the
  // path never navigates.
  useEffect(() => {
    if (!openSlug || !current?.post || viewedSlugs.has(openSlug)) return;
    viewedSlugs.add(openSlug);
    track("article_view", { slug: openSlug, title: current.post.title });
  }, [openSlug, current?.post]);

  /** Warm the caches before the click lands. Pointing at a card is signal enough. */
  const prefetch = useCallback((slug: string) => {
    prefetchPost(slug);
  }, []);

  // Escape returns to the list. `WindowFrame` owns Escape for closing the
  // window, so this listener stops the event while a detail view is open.
  useEffect(() => {
    if (!openSlug) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Escape inside an overlay (Spotlight, the gallery lightbox) belongs to
      // that overlay — this capture listener would otherwise eat it first.
      if ((event.target as HTMLElement | null)?.closest?.('[role="dialog"]')) return;
      event.stopPropagation();
      close();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [openSlug, close]);

  /** Cross-article links (`data-post`, rewritten on the server) stay in-window. */
  const onProseClick = useCallback(
    (event: React.MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest("a[data-post]");
      const slug = anchor?.getAttribute("data-post");
      if (!slug) return;
      event.preventDefault();
      openArticle(slug);
    },
    [openArticle],
  );

  const scrollToHeading = useCallback((id: string) => {
    proseRef.current
      ?.querySelector(`#${CSS.escape(id)}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const copyLink = useCallback(() => {
    if (!openSlug) return;
    const url = `${window.location.origin}/writing/${openSlug}`;
    void navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {
        // Clipboard can be denied in odd contexts; the URL bar has it anyway.
      });
  }, [openSlug]);

  if (openSlug) {
    const post = current?.post;
    return (
      <div data-no-drag className="px-5 pb-[60px]">
        {/* The article deliberately does NOT follow `--portos-content-max`. Every
            other window widens when maximised; prose should not. At 13px, 1112px
            is roughly 150 characters a line, well past the point where the eye
            loses its place returning to the left margin. This stays a reading
            measure whatever the frame does. */}
        <div ref={articleTopRef} className="mx-auto w-full min-[880px]:max-w-[824px]">
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={close} className={PILL_BUTTON_CLASS}>
              ← Back
            </button>
            {/* Only offered once the article exists — a copied link to a 404 helps nobody. */}
            {post ? (
              <button type="button" onClick={copyLink} className={PILL_BUTTON_CLASS}>
                {copied ? "Copied ✓" : "Copy link"}
              </button>
            ) : null}
          </div>

          {current?.error ? (
            <div className="mt-8">
              <p className={NOTE_CLASS}>{current.error}</p>
              <button
                type="button"
                onClick={() => {
                  invalidatePost(openSlug);
                  setLoaded(null);
                  setRetryNonce((nonce) => nonce + 1);
                }}
                className={cn(PILL_BUTTON_CLASS, "mt-4")}
              >
                Try again
              </button>
            </div>
          ) : !post ? (
            <ArticleSkeleton />
          ) : (
            <article className="mt-8">
              <header className="border-b border-black/10 pb-6">
                <h1 className="font-display text-[26px] leading-[32px] font-bold tracking-[-0.52px] text-black">
                  {post.emoji ? `${post.emoji} ` : ""}
                  {post.title}
                </h1>
                <p className={cn(LABEL_CLASS, "mt-4")}>
                  {formatDate(post.date) ? (
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                  ) : null}
                  {post.readingMinutes ? <> · {post.readingMinutes} min read</> : null}
                </p>
                {post.tags.length > 0 ? (
                  <ul className="mt-4 flex flex-wrap gap-[6px]" aria-label="Topics">
                    {post.tags.map((tag) => (
                      <li key={tag} className={TAG_CLASS}>
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </header>

              {/* Only long reads earn a table of contents; two headings is not
                  navigation, it is clutter. */}
              {post.toc.length >= 3 ? (
                <nav
                  aria-label="Contents"
                  className="mt-6 rounded-lg border border-black/10 bg-black/[0.03] px-4 py-3"
                >
                  <p className={LABEL_CLASS}>CONTENTS</p>
                  <ul className="mt-2 space-y-1">
                    {post.toc.map((entry) => (
                      <li key={entry.id} className={entry.depth === 3 ? "pl-4" : undefined}>
                        <button
                          type="button"
                          onClick={() => scrollToHeading(entry.id)}
                          className="font-sans cursor-pointer text-left text-[12px] leading-[18px] text-black/60 transition-colors hover:text-black"
                        >
                          {entry.text}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : null}

              {/* Server-rendered from Notion Markdown; raw HTML in the source is
                  escaped by `renderMarkdown`, so this cannot inject script. */}
              <div
                ref={proseRef}
                onClick={onProseClick}
                className="portos-prose mt-8"
                dangerouslySetInnerHTML={{ __html: post.html }}
              />
            </article>
          )}
        </div>
      </div>
    );
  }

  const tags = posts
    ? [...new Set(posts.flatMap((post) => post.tags))].sort((a, b) => a.localeCompare(b))
    : [];
  const visiblePosts =
    posts && activeTag ? posts.filter((post) => post.tags.includes(activeTag)) : posts;

  return (
    <div className="px-5 pb-[60px]">
      {/* The card list DOES follow the frame — cards are art, not prose. */}
      <div className="mx-auto w-full min-[880px]:max-w-[var(--portos-content-max)]">
        {listError ? (
          <div className="mt-6">
            <p className={NOTE_CLASS}>{listError}</p>
            <button
              type="button"
              onClick={() => {
                setListError(null);
                setPosts(null);
                loadList(true);
              }}
              className={cn(PILL_BUTTON_CLASS, "mt-4")}
            >
              Try again
            </button>
          </div>
        ) : posts === null ? (
          <ListSkeleton />
        ) : posts.length === 0 ? (
          <p className={cn(NOTE_CLASS, "mt-6")}>No published posts yet.</p>
        ) : (
          <>
            {/* Topic filter. Only shown when there is something to narrow. */}
            {tags.length > 1 ? (
              <div className="mt-6 flex flex-wrap gap-[6px]" role="group" aria-label="Filter by topic">
                {[null, ...tags].map((tag) => {
                  const isActive = activeTag === tag;
                  return (
                    <button
                      key={tag ?? "all"}
                      type="button"
                      data-no-drag
                      onClick={() => setActiveTag(tag)}
                      className={cn(
                        TAG_CLASS,
                        "cursor-pointer transition-colors",
                        isActive
                          ? "border-black/60 bg-black text-white"
                          : "hover:border-black/40 hover:text-black",
                      )}
                    >
                      {tag ?? "All"}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {visiblePosts && visiblePosts.length === 0 ? (
              <p className={cn(NOTE_CLASS, "mt-6")}>Nothing tagged “{activeTag}” yet.</p>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 min-[560px]:grid-cols-2 min-[880px]:grid-cols-3">
                {(visiblePosts ?? []).map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    data-no-drag
                    onClick={() => openArticle(post.slug)}
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

                    <p className={cn(LABEL_CLASS, "mt-3")}>
                      {formatDate(post.date)}
                      {post.readingMinutes ? <> · {post.readingMinutes} min read</> : null}
                    </p>

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
          </>
        )}
      </div>
    </div>
  );
}
