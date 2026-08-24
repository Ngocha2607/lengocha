import { Marked } from "marked";

/**
 * Notion Markdown -> HTML, rendered on the server so an article page ships no
 * client-side markdown runtime. This replaces react-markdown + remark-gfm.
 *
 * Two deliberate behaviours carried over from the react-markdown setup:
 *
 *  - Raw HTML in the source is escaped, not passed through. react-markdown
 *    skipped raw HTML unless rehype-raw was added, and it never was; marked
 *    passes it through by default, so `html` is overridden to keep the old,
 *    safer posture.
 *  - Absolute links open in a new tab with noreferrer noopener.
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
      if (isExternal(href)) {
        attrs.push('target="_blank"', 'rel="noreferrer noopener"');
      }
      return `<a ${attrs.join(" ")}>${label}</a>`;
    },
  },
});

/** Render a Notion-sourced Markdown string to HTML. */
export function renderMarkdown(markdown: string): string {
  return renderer.parse(markdown, { async: false }) as string;
}
