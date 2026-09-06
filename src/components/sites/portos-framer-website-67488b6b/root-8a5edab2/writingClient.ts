"use client";

/**
 * The Writing window's client-side view of `/api/writing`, shared with Spotlight.
 *
 * Lives at module scope ON PURPOSE: the Writing window remounts every time a
 * project card points it at a new article (it is keyed by slug in DesktopShell),
 * so any cache held in component state dies exactly when it would start paying
 * off. Module scope survives remounts and is shared by every consumer, so an
 * article read once opens instantly for the rest of the visit.
 *
 * Nothing here imports `@/lib/notion` — that module holds `NOTION_TOKEN`, and a
 * client module's imports ship to the browser. This talks to the API routes only.
 */

export interface PostMeta {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  emoji: string;
  coverUrl: string;
  /**
   * Absent until the server has rendered the body at least once — reading time
   * is measured from the markdown, and the list endpoint does not fetch bodies.
   * The server warms every body right after the first list request, so this
   * fills in within a minute of the first visit.
   */
  readingMinutes?: number;
}

export interface TocEntry {
  id: string;
  text: string;
  depth: 2 | 3;
}

export interface PostDetail extends PostMeta {
  /** Rendered on the server, with raw HTML from the Notion source escaped. */
  html: string;
  toc: TocEntry[];
}

export interface PostList {
  posts: PostMeta[];
  configured: boolean;
}

/**
 * Matches the server's own list memo. Shorter would refetch for nothing; longer
 * would keep serving cards without reading times after the server has them.
 */
const LIST_TTL_MS = 60_000;

let listCache: { at: number; list: PostList } | null = null;
let listInFlight: Promise<PostList> | null = null;

export async function fetchPostList(force = false): Promise<PostList> {
  if (!force && listCache && Date.now() - listCache.at < LIST_TTL_MS) {
    return listCache.list;
  }
  if (listInFlight) return listInFlight;

  listInFlight = fetch("/api/writing")
    .then(async (r) => {
      if (!r.ok) throw new Error(String(r.status));
      const data = (await r.json()) as { posts?: PostMeta[]; configured?: boolean };
      const list: PostList = {
        posts: data.posts ?? [],
        configured: data.configured !== false,
      };
      listCache = { at: Date.now(), list };
      return list;
    })
    .finally(() => {
      listInFlight = null;
    });

  return listInFlight;
}

const postCache = new Map<string, PostDetail>();
const postInFlight = new Map<string, Promise<PostDetail>>();

export function getCachedPost(slug: string): PostDetail | undefined {
  return postCache.get(slug);
}

export async function fetchPost(slug: string): Promise<PostDetail> {
  const hit = postCache.get(slug);
  if (hit) return hit;

  const existing = postInFlight.get(slug);
  if (existing) return existing;

  const pending = fetch(`/api/writing/${slug}`)
    .then(async (r) => {
      if (!r.ok) throw new Error(String(r.status));
      const data = (await r.json()) as { post: PostDetail };
      postCache.set(slug, data.post);
      return data.post;
    })
    .finally(() => {
      postInFlight.delete(slug);
    });

  postInFlight.set(slug, pending);
  return pending;
}

/** Fire-and-forget: warms the server render AND this cache before a click. */
export function prefetchPost(slug: string): void {
  void fetchPost(slug).catch(() => {
    // The real click will retry and report properly.
  });
}

/** Drops one article so a retry actually refetches instead of replaying the miss. */
export function invalidatePost(slug: string): void {
  postCache.delete(slug);
}
