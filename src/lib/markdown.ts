import { Marked } from "marked";

/**
 * Notion Markdown -> HTML, rendered on the SERVER so the window ships no
 * client-side markdown runtime.
 *
 * Deliberate behaviours:
 *
 *  - Raw HTML in the source is escaped, not passed through. `marked` passes it
 *    through by default; that would let anything pasted into a Notion page
 *    execute in this document, so `html` is overridden to escape instead.
 *  - Absolute links open in a new tab with `noreferrer noopener` — EXCEPT links
 *    that the caller can resolve to another article of this site. Articles
 *    cross-reference each other with Notion URLs (the database is the source of
 *    truth), and bouncing a reader out to notion.com mid-article — possibly into
 *    a login wall — is the worst version of that. Resolved links become
 *    `/writing/<slug>` with a `data-post` attribute the Writing window
 *    intercepts, and still work as real URLs when opened in a new tab.
 *  - h2/h3 headings get stable ids and are collected into a table of contents,
 *    so the window can offer in-article navigation.
 */

export interface TocEntry {
  id: string;
  text: string;
  depth: 2 | 3;
}

export interface RenderedMarkdown {
  html: string;
  toc: TocEntry[];
}

export interface RenderOptions {
  /**
   * Given an absolute href from the source, return the slug of the article it
   * refers to, or null for "not ours". Only consulted for http(s) links.
   */
  resolveInternalLink?: (href: string) => string | null;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const isExternal = (href: string) => /^https?:\/\//i.test(href);

/** Same normalisation the slugs use, so heading anchors look like the URLs do. */
function slugifyHeading(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[đĐ]/g, (c) => (c === "đ" ? "d" : "D"))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Flattens a heading's inline tokens to plain text for the id and the TOC label. */
interface InlineTokenLike {
  text?: string;
  tokens?: InlineTokenLike[];
}

function tokensToText(tokens: InlineTokenLike[]): string {
  return tokens
    .map((token) =>
      token.tokens && token.tokens.length > 0
        ? tokensToText(token.tokens)
        : (token.text ?? ""),
    )
    .join("");
}

/**
 * Render a Notion-sourced Markdown string to HTML plus its table of contents.
 *
 * A fresh `Marked` per call because the heading renderer accumulates into the
 * TOC and the link renderer closes over the caller's resolver — shared parser
 * state across concurrent route invocations would bleed one article's TOC into
 * another's. The construction cost is nothing next to the Notion fetch this
 * always sits behind, and the result is cached upstream anyway.
 */
export function renderMarkdown(
  markdown: string,
  options: RenderOptions = {},
): RenderedMarkdown {
  const toc: TocEntry[] = [];
  const seenIds = new Map<string, number>();
  const { resolveInternalLink } = options;

  const renderer = new Marked({
    gfm: true,
    breaks: false,
    renderer: {
      html({ text }) {
        return escapeHtml(text);
      },

      heading({ tokens, depth }) {
        const label = this.parser.parseInline(tokens);
        const text = tokensToText(tokens as InlineTokenLike[]).trim();

        // Only h2/h3 are anchored: h1 is the article title's job, and Notion
        // content rarely nests deeper than h3.
        if (depth !== 2 && depth !== 3) {
          return `<h${depth}>${label}</h${depth}>`;
        }

        const base = slugifyHeading(text) || `section-${toc.length + 1}`;
        const taken = seenIds.get(base) ?? 0;
        seenIds.set(base, taken + 1);
        const id = taken === 0 ? base : `${base}-${taken + 1}`;

        toc.push({ id, text, depth });
        return `<h${depth} id="${escapeHtml(id)}">${label}</h${depth}>`;
      },

      link({ href, title, tokens }) {
        // `this.parser` renders the link's own inline children (bold, code, ...).
        const label = this.parser.parseInline(tokens);

        if (isExternal(href) && resolveInternalLink) {
          const slug = resolveInternalLink(href);
          if (slug) {
            const attrs = [
              `href="/writing/${escapeHtml(slug)}"`,
              `data-post="${escapeHtml(slug)}"`,
            ];
            if (title) attrs.push(`title="${escapeHtml(title)}"`);
            return `<a ${attrs.join(" ")}>${label}</a>`;
          }
        }

        const attrs = [`href="${escapeHtml(href)}"`];
        if (title) attrs.push(`title="${escapeHtml(title)}"`);
        if (isExternal(href)) attrs.push('target="_blank"', 'rel="noreferrer noopener"');
        return `<a ${attrs.join(" ")}>${label}</a>`;
      },
    },
  });

  const html = renderer.parse(markdown, { async: false }) as string;
  return { html, toc };
}
