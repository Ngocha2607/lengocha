# CV

The source of the two CV PDFs the site serves:

| Language   | Content file      | Output                                       |
| ---------- | ----------------- | -------------------------------------------- |
| Vietnamese | `content.vi.json` | `public/Le-Ngoc-Ha-Fullstack-Developer.pdf`    |
| English    | `content.en.json` | `public/Le-Ngoc-Ha-Fullstack-Developer-EN.pdf` |

The PDFs are build output, committed so the site can serve them as static files. Edit the
content, rebuild, and commit the content file and the PDF together.

## Editing the text

Every word on the CV is in the two content files. Nothing in `template.html`, `cv.css` or
`build.mjs` is text you would want to change.

- `pages` is the CV page by page, each with a `sidebar` and a `main` column, listed top to
  bottom. To move a block to the other page, move it in the file.
- `**double asterisks**` make text bold. That is the only markup.
- Headings and entry titles are written in normal case and set in capitals by the stylesheet.
- Keep the two languages in step: same blocks, same entries, same numbers.

The other text that has to agree with the CV: the Experience window
(`src/components/.../ExperienceWindow.tsx`) and `src/i18n/en.ts` carry the experience
bullets word for word.

## Rebuilding

```sh
npx playwright install chromium-headless-shell   # once per machine
npm run cv:build                                 # both languages
npm run cv:build -- en                           # one language
```

The build renders each content file into the template, prints it with headless Chromium,
checks it, and only then writes the PDF to `public/`. It stops with a message if:

- a column runs past the bottom of its page (the message says which, and by how much), or a
  line runs past the edge;
- the PDF does not have the expected number of pages;
- a font or the photo does not load, or the PDF embeds a font other than the ones in
  `fonts/` (a character none of them has, which would fall back to whatever the machine has);
- a content file has a misspelt or missing key.

Each successful build also prints the free space left at the bottom of every column, so you
can see how much room an edit has. A PDF whose content did not change is left as it is (only
its timestamp would differ), so rebuilding never creates a diff on its own. Whether it passes or not, the HTML and the PDF are written
to `cv/.out/` (git-ignored): open `cv/.out/cv.vi.pdf` to see what overflowed.

If something no longer fits, shorten the text, move a block to the other page, or as a last
resort tighten the spacing in `cv.css` (the leading is `--body-lh`).

## Files

- `template.html`: the page shell and the contact icons.
- `cv.css`: the look. Colours were sampled and sizes measured from the Figma CV this
  replaced; the comments say where a number came from.
- `build.mjs`: renders, prints and checks. The portfolio QR codes are generated here from the
  `href` of the `qr` block, so they always point where the content says.
- `fonts/`: Oswald (name), Roboto Condensed (everything else), Roboto (title line and
  footer), and one arrow glyph from Roboto Flex. They are static, subset files made by
  `fonts/build-fonts.py`, which says why. All are under the SIL Open Font License
  (`fonts/OFL-*.txt`).
- The photo is the portrait the About window uses
  (`public/sites/.../images/Le_Ngoc_Ha.jpg`), cropped to a circle by `cv.css`.

Playwright and `qrcode` are devDependencies: they are never part of the site's bundle.
