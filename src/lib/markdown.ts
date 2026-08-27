import { Marked } from "marked";

/**
 * Notion Markdown -> HTML, rendered on the SERVER so the window ships no
 * client-side markdown runtime.
 *
 * Two deliberate behaviours:
 *
 *  - Raw HTML in the source is escaped, not passed through. `marked` passes it
 *    through by default; that would let anything pasted into a Notion page
 *    execute in this document, so `html` is overridden to escape instead.
 *  - Absolute links open in a new tab with `noreferrer noopener`. Relative links
 *    are left alone — inside this window they would go nowhere useful, but
 *    rewriting them would be guessing at intent.
 */

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const isExternal = (href: string) => /^https?:\/\//i.test(href);

const renderer = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    html({ text }) {
      return escapeHtml(text);
    },

    link({ href, title, tokens }) {
      // `this.parser` renders the link's own inline children (bold, code, ...).
      const label = this.parser.parseInline(tokens);
      const attrs = [`href="${escapeHtml(href)}"`];
      if (title) attrs.push(`title="${escapeHtml(title)}"`);
      if (isExternal(href)) attrs.push('target="_blank"', 'rel="noreferrer noopener"');
      return `<a ${attrs.join(" ")}>${label}</a>`;
    },
  },
});

/** Render a Notion-sourced Markdown string to HTML. */
export function renderMarkdown(markdown: string): string {
  return renderer.parse(markdown, { async: false }) as string;
}
