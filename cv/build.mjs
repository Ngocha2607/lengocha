/**
 * Builds the CV PDFs in public/ from the content files in this folder.
 *
 *   npm run cv:build          both languages
 *   npm run cv:build -- en    one language
 *
 * For each language: content.<lang>.json is rendered into template.html (styled
 * by cv.css) and printed to PDF by headless Chromium. The HTML and the PDF are
 * always written to cv/.out/ for previewing; the PDF is copied to public/ only
 * if it passes every check. The build fails rather than ship a broken CV: if a
 * column runs past the bottom of its page, a line runs past the edge, a font
 * or the photo fails to load, the PDF has the wrong number of pages, or the PDF
 * embeds a font that is not one of ours (meaning some character fell back to a
 * system font, which would look different on every machine).
 *
 * Needs Playwright's Chromium once per machine: `npx playwright install chromium-headless-shell`.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";
import QRCode from "qrcode";

const CV_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(CV_DIR, "..");
const OUT_DIR = path.join(CV_DIR, ".out");

/** The portrait the About window uses; the CV crops it to a circle in cv.css. */
const PORTRAIT = path.join(
  ROOT,
  "public/sites/portos-framer-website-67488b6b/root-8a5edab2/images/Le_Ngoc_Ha.jpg",
);

const TARGETS = {
  vi: { content: "content.vi.json", pdf: "public/Le-Ngoc-Ha-Fullstack-Developer.pdf" },
  en: { content: "content.en.json", pdf: "public/Le-Ngoc-Ha-Fullstack-Developer-EN.pdf" },
};

/** PostScript names of the fonts in cv/fonts. Anything else in the PDF is a fallback. */
const OUR_FONTS = new Set([
  "Oswald-Bold",
  "Roboto-Regular",
  "RobotoCondensed-Regular",
  "RobotoCondensed-Bold",
  "RobotoCondensed-Italic",
  "RobotoFlexArrow-Regular",
  "RobotoFlexArrow-Bold",
]);

const NAVY = "#0d4559";

// ---- Content checks ---------------------------------------------------------

/** Which keys each kind of object may have; the first list is required. */
const SHAPES = {
  root: [["lang", "documentTitle", "name", "headline", "photoAlt", "footer", "pages"], []],
  footer: [["name", "site", "href"], []],
  page: [["sidebar", "main"], []],
  contact: [["type", "heading", "items"], []],
  contactItem: [["icon", "text"], ["href"]],
  list: [["type", "heading", "items"], []],
  rows: [["type", "heading", "rows"], []],
  text: [["type", "heading", "paragraphs"], []],
  entries: [["type", "heading", "entries"], ["variant"]],
  entry: [["title"], ["period", "org", "notes", "text", "bullets", "tags"]],
  qr: [["type", "heading", "text", "href"], []],
};
const ICONS = new Set(["phone", "mail", "pin", "globe", "github", "linkedin"]);

/** Fails on a missing or misspelt key, so a typo cannot silently drop text. */
function checkShape(value, shape, where) {
  const [required, optional] = SHAPES[shape];
  if (typeof value !== "object" || value === null) throw new Error(`${where}: expected an object`);
  for (const key of required) {
    if (!(key in value)) throw new Error(`${where}: missing "${key}"`);
  }
  for (const key of Object.keys(value)) {
    if (!required.includes(key) && !optional.includes(key)) {
      throw new Error(`${where}: unknown key "${key}" (allowed: ${[...required, ...optional].join(", ")})`);
    }
  }
}

function checkContent(content, file) {
  checkShape(content, "root", file);
  checkShape(content.footer, "footer", `${file} footer`);
  content.pages.forEach((page, p) => {
    checkShape(page, "page", `${file} page ${p + 1}`);
    for (const column of ["sidebar", "main"]) {
      page[column].forEach((block, b) => {
        const where = `${file} page ${p + 1} ${column} block ${b + 1}`;
        if (!(block.type in SHAPES) || ["root", "footer", "page", "entry", "contactItem"].includes(block.type)) {
          throw new Error(`${where}: unknown block type "${block.type}"`);
        }
        checkShape(block, block.type, where);
        if (block.type === "contact") {
          block.items.forEach((item, i) => {
            checkShape(item, "contactItem", `${where} item ${i + 1}`);
            if (!ICONS.has(item.icon)) throw new Error(`${where} item ${i + 1}: unknown icon "${item.icon}"`);
          });
        }
        if (block.type === "entries") {
          block.entries.forEach((entry, e) => checkShape(entry, "entry", `${where} entry ${e + 1}`));
        }
      });
    }
  });
}

// ---- Rendering --------------------------------------------------------------

const escapeHtml = (text) =>
  text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** Content strings are plain text with one markup: **bold**. */
const inline = (text) => escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

const icon = (name) => `<svg aria-hidden="true"><use href="#icon-${name}"></use></svg>`;

const link = (href, html) => (href ? `<a href="${escapeHtml(href)}">${html}</a>` : html);

function renderEntry(entry) {
  const parts = [
    `<div class="entry-head"><h3 class="entry-title">${inline(entry.title)}</h3>`,
    entry.period ? `<span class="entry-period">${inline(entry.period)}</span>` : "",
    `</div>`,
    entry.org ? `<p class="entry-org">${inline(entry.org)}</p>` : "",
    ...(entry.notes ?? []).map((note) => `<p class="entry-note">${inline(note)}</p>`),
    entry.text
      ? `<div class="entry-text">${entry.text.map((p) => `<p>${inline(p)}</p>`).join("")}</div>`
      : "",
    entry.bullets
      ? `<ul class="bullets">${entry.bullets.map((b) => `<li>${inline(b)}</li>`).join("")}</ul>`
      : "",
    entry.tags ? `<p class="entry-tags">${inline(entry.tags)}</p>` : "",
  ];
  return `<article class="entry">${parts.join("")}</article>`;
}

function renderBlock(block, qrCodes) {
  const heading = `<h2 class="heading">${inline(block.heading)}</h2>`;
  const variant = block.variant ? ` block--${block.variant}` : "";
  let body;
  switch (block.type) {
    case "contact":
      body = `<ul class="contact">${block.items
        .map((item) => `<li>${icon(item.icon)}${link(item.href, inline(item.text))}</li>`)
        .join("")}</ul>`;
      break;
    case "list":
      body = `<ul class="plain">${block.items.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`;
      break;
    case "rows":
      body = `<ul class="rows">${block.rows.map((row) => `<li>${inline(row)}</li>`).join("")}</ul>`;
      break;
    case "text":
      body = block.paragraphs.map((p) => `<p>${inline(p)}</p>`).join("");
      break;
    case "entries":
      body = block.entries.map(renderEntry).join("");
      break;
    case "qr":
      body = `${link(block.href, qrCodes.get(block.href))}<p class="qr-link">${link(block.href, inline(block.text))}</p>`;
      break;
  }
  return `<section class="block block--${block.type}${variant}">${heading}${body}</section>`;
}

function renderPages(content, qrCodes, photoSrc) {
  const total = content.pages.length;
  return content.pages
    .map((page, index) => {
      const first = index === 0;
      const photo = first
        ? `<div class="photo"><img src="${escapeHtml(photoSrc)}" alt="${escapeHtml(content.photoAlt)}" /></div>`
        : "";
      const masthead = first
        ? `<header class="masthead"><h1 class="name">${inline(content.name)}</h1><p class="headline">${inline(
            content.headline,
          )}</p></header>`
        : "";
      const { footer } = content;
      return `<section class="page">
  <div class="col side">${photo}${page.sidebar.map((b) => renderBlock(b, qrCodes)).join("")}</div>
  <div class="col main">${masthead}${page.main.map((b) => renderBlock(b, qrCodes)).join("")}</div>
  <footer class="foot"><span class="foot-name">${inline(footer.name)}</span><span class="sep">·</span>${link(
    footer.href,
    inline(footer.site),
  )}<span class="sep">·</span><span>${index + 1}/${total}</span></footer>
</section>`;
    })
    .join("\n");
}

async function qrCodesFor(content) {
  const hrefs = content.pages
    .flatMap((page) => [...page.sidebar, ...page.main])
    .filter((block) => block.type === "qr")
    .map((block) => block.href);
  const codes = new Map();
  for (const href of hrefs) {
    const svg = await QRCode.toString(href, {
      type: "svg",
      margin: 0,
      errorCorrectionLevel: "M",
      color: { dark: NAVY, light: "#ffffff00" },
    });
    codes.set(href, svg.replace(/^<svg /, `<svg role="img" aria-label="QR: ${escapeHtml(href)}" `));
  }
  return codes;
}

async function renderHtml(lang) {
  const file = TARGETS[lang].content;
  const content = JSON.parse(await readFile(path.join(CV_DIR, file), "utf8"));
  checkContent(content, file);
  if (content.lang !== lang) throw new Error(`${file}: "lang" is "${content.lang}", expected "${lang}"`);

  const template = await readFile(path.join(CV_DIR, "template.html"), "utf8");
  const photoSrc = path.relative(OUT_DIR, PORTRAIT).split(path.sep).join("/");
  const slots = {
    lang: escapeHtml(content.lang),
    title: escapeHtml(content.documentTitle),
    css: "../cv.css",
    pages: renderPages(content, await qrCodesFor(content), photoSrc),
  };
  const html = template.replace(/\{\{(\w+)\}\}/g, (_, slot) => {
    if (!(slot in slots)) throw new Error(`template.html: unknown slot {{${slot}}}`);
    return slots[slot];
  });
  const htmlPath = path.join(OUT_DIR, `cv.${lang}.html`);
  await writeFile(htmlPath, html);
  return { htmlPath, pageCount: content.pages.length };
}

// ---- Printing and checks ----------------------------------------------------

/** Everything that can go wrong on the rendered page, measured in the browser. */
function inspectPage() {
  const PT = 96 / 72; // CSS px per pt
  const problems = [];
  for (const face of document.fonts) {
    if (face.status === "error") problems.push(`font failed to load: ${face.family} ${face.weight} ${face.style}`);
  }
  for (const img of document.images) {
    if (!img.complete || img.naturalWidth === 0) problems.push(`image failed to load: ${img.src}`);
  }
  const columns = [];
  document.querySelectorAll(".page").forEach((page, p) => {
    page.querySelectorAll(".col").forEach((col) => {
      const name = `page ${p + 1} ${col.classList.contains("side") ? "sidebar" : "main"}`;
      const box = col.getBoundingClientRect();
      const last = col.lastElementChild?.getBoundingClientRect();
      const free = (last ? box.bottom - last.bottom : box.height) / PT;
      columns.push(`${name} ${free.toFixed(1)}pt free`);
      // Strict: the column clips, so even a fraction of a line past its end is lost.
      if (free < 0 || col.scrollHeight > col.clientHeight) {
        const over = Math.max(-free, (col.scrollHeight - col.clientHeight) / PT);
        problems.push(`${name} overflows by ${over.toFixed(1)}pt`);
      }
    });
    page.querySelectorAll(".col *, .foot").forEach((el) => {
      if (getComputedStyle(el).overflowX !== "visible") return; // clipped on purpose (the photo)
      if (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1) {
        problems.push(`page ${p + 1}: text runs past the edge of <${el.tagName.toLowerCase()} class="${el.className}">: "${el.textContent.trim().slice(0, 60)}"`);
      }
    });
  });
  return { problems, columns };
}

/** Page count and embedded font names, read from the PDF bytes (Skia writes them uncompressed). */
function inspectPdf(buffer) {
  const raw = buffer.toString("latin1");
  const pages = (raw.match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;
  const fonts = new Set([...raw.matchAll(/\/BaseFont\s*\/(?:[A-Z]{6}\+)?([^\s/<>[\]()]+)/g)].map((m) => m[1]));
  return { pages, fonts };
}

/**
 * Two builds of the same content differ only in the PDF's creation and
 * modification dates. Comparing without them lets a rebuild with nothing new
 * leave the committed PDF alone, so `git status` stays clean.
 */
const withoutDates = (buffer) => buffer.toString("latin1").replace(/D:\d{14}[+-]\d\d'\d\d'/g, "");

async function main() {
  const langs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(TARGETS);
  for (const lang of langs) {
    if (!(lang in TARGETS)) throw new Error(`Unknown language "${lang}" (expected: ${Object.keys(TARGETS).join(", ")})`);
  }
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  let failed = false;
  try {
    const page = await browser.newPage();
    for (const lang of langs) {
      const { htmlPath, pageCount } = await renderHtml(lang);
      await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.emulateMedia({ media: "print" });

      const { problems, columns } = await page.evaluate(inspectPage);
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
        tagged: true,
      });

      const { pages, fonts } = inspectPdf(pdf);
      if (pages !== pageCount) problems.push(`PDF has ${pages} pages, expected ${pageCount}`);
      const foreign = [...fonts].filter((font) => !OUR_FONTS.has(font));
      if (foreign.length) problems.push(`PDF embeds fonts that are not in cv/fonts: ${foreign.join(", ")}`);
      if (fonts.size === 0) problems.push("PDF embeds no fonts: is the text there?");

      const target = TARGETS[lang].pdf;
      await writeFile(path.join(OUT_DIR, `cv.${lang}.pdf`), pdf);
      if (problems.length) {
        failed = true;
        console.error(`✗ ${lang}: ${target} not written (preview: cv/.out/cv.${lang}.pdf)\n  ${problems.join("\n  ")}`);
      } else {
        const targetPath = path.join(ROOT, target);
        const current = await readFile(targetPath).catch(() => null);
        const unchanged = current !== null && withoutDates(current) === withoutDates(pdf);
        if (!unchanged) await writeFile(targetPath, pdf);
        console.log(
          `✓ ${lang} → ${target} (${pages} pages, ${(pdf.length / 1024).toFixed(0)} KB${unchanged ? ", unchanged" : ""})`,
        );
      }
      console.log(`  ${columns.join(" · ")}`);
    }
  } finally {
    await browser.close();
  }
  if (failed) process.exitCode = 1;
}

await main();
