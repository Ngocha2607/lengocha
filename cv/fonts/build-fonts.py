"""
Rebuilds the font files in this folder. You only need it to change a weight or
add a character the CV cannot render; the .woff2 files are committed, so
`npm run cv:build` never runs this.

    python -m pip install fonttools brotli
    python cv/fonts/build-fonts.py

Why not load the fonts straight from Google Fonts:

  - Chromium embeds a VARIABLE font in a PDF as Type 3 glyph outlines, which
    some PDF readers and ATS parsers handle badly. Static instances (one file
    per weight) are embedded as ordinary TrueType subsets.
  - The PDF must come out the same on any machine, offline, so the build reads
    fonts from this folder rather than from the network.

Sources are the variable fonts in github.com/google/fonts (SIL Open Font
License 1.1, see OFL-*.txt). Each instance is subset to Latin, Vietnamese and
general punctuation, which is everything the CV uses.

None of the three families has an arrow (U+2192), which the CV uses in every
before -> after number. `arrow-*.woff2` carries only that one glyph, from
Roboto Flex (the same type family); cv.css maps it in with a
`unicode-range` face so it is used for that character and nothing else.
"""

from __future__ import annotations

import io
import pathlib
import urllib.request

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

HERE = pathlib.Path(__file__).resolve().parent
RAW = "https://raw.githubusercontent.com/google/fonts/main/ofl/"

SOURCES = {
    "oswald": "oswald/Oswald%5Bwght%5D.ttf",
    "roboto-condensed": "robotocondensed/RobotoCondensed%5Bwght%5D.ttf",
    "roboto-condensed-italic": "robotocondensed/RobotoCondensed-Italic%5Bwght%5D.ttf",
    "roboto": "roboto/Roboto%5Bwdth,wght%5D.ttf",
    "roboto-flex": "robotoflex/RobotoFlex%5BGRAD,XOPQ,XTRA,YOPQ,YTAS,YTDE,YTFI,YTLC,YTUC,opsz,slnt,wdth,wght%5D.ttf",
}

LICENCES = {
    "OFL-Oswald.txt": "oswald/OFL.txt",
    "OFL-RobotoCondensed.txt": "robotocondensed/OFL.txt",
    "OFL-Roboto.txt": "roboto/OFL.txt",
    "OFL-RobotoFlex.txt": "robotoflex/OFL.txt",
}

# Basic Latin, Latin-1, Latin Extended-A/B (Ơ ơ Ư ư), combining marks, Latin
# Extended Additional (the rest of Vietnamese), general punctuation (• – — …),
# the dong sign, the euro sign, the trade mark sign and the minus sign.
TEXT_RANGES = [
    (0x0020, 0x007E),
    (0x00A0, 0x00FF),
    (0x0100, 0x024F),
    (0x0300, 0x036F),
    (0x1E00, 0x1EFF),
    (0x2000, 0x206F),
    (0x20AB, 0x20AC),
    (0x2122, 0x2122),
    (0x2212, 0x2212),
]
ARROW = [(0x2192, 0x2192)]

# (output file, source, axis location, unicode ranges, family, style)
OUTPUTS = [
    ("oswald-700.woff2", "oswald", {"wght": 700}, TEXT_RANGES, "Oswald", "Bold"),
    ("roboto-condensed-400.woff2", "roboto-condensed", {"wght": 400}, TEXT_RANGES, "Roboto Condensed", "Regular"),
    ("roboto-condensed-700.woff2", "roboto-condensed", {"wght": 700}, TEXT_RANGES, "Roboto Condensed", "Bold"),
    ("roboto-condensed-400-italic.woff2", "roboto-condensed-italic", {"wght": 400}, TEXT_RANGES, "Roboto Condensed", "Italic"),
    ("roboto-400.woff2", "roboto", {"wght": 400, "wdth": 100}, TEXT_RANGES, "Roboto", "Regular"),
    # Roboto Flex at its normal width: the long-shafted arrow the old CV had.
    ("arrow-400.woff2", "roboto-flex", {"wght": 400, "wdth": 100, "opsz": 14}, ARROW, "Roboto Flex Arrow", "Regular"),
    ("arrow-700.woff2", "roboto-flex", {"wght": 700, "wdth": 100, "opsz": 14}, ARROW, "Roboto Flex Arrow", "Bold"),
]


def fetch(path: str) -> bytes:
    with urllib.request.urlopen(RAW + path, timeout=120) as response:
        return response.read()


def static_instance(source: bytes, location: dict[str, float]) -> TTFont:
    # recalcTimestamp=False: the same sources give byte-identical files.
    font = TTFont(io.BytesIO(source), recalcTimestamp=False)
    # Pin every axis: the ones named here to their value, the rest to default.
    axes = {axis.axisTag: axis.defaultValue for axis in font["fvar"].axes}
    axes.update(location)
    return instantiateVariableFont(font, axes, updateFontNames=False)


def rename(font: TTFont, family: str, style: str) -> None:
    """Give an instance its own name, so the PDF lists RobotoCondensed-Bold rather
    than a second "RobotoCondensed-Regular" (what every instance of a variable
    font is called until renamed)."""
    names = font["name"]
    ps_name = f"{family}-{style}".replace(" ", "")
    for name_id in (16, 17, 21, 22, 25):  # typographic / WWS / variations names
        names.removeNames(nameID=name_id)
    for name_id, value in {
        1: family if style in ("Regular", "Bold", "Italic", "Bold Italic") else f"{family} {style}",
        2: style,
        3: f"{ps_name};cv-build",
        4: f"{family} {style}",
        6: ps_name,
    }.items():
        names.setName(value, name_id, 3, 1, 0x409)
        names.setName(value, name_id, 1, 0, 0)


def subset(font: TTFont, ranges: list[tuple[int, int]]) -> TTFont:
    options = Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]  # keep kerning and mark positioning
    options.name_IDs = ["*"]
    options.notdef_outline = True
    subsetter = Subsetter(options=options)
    subsetter.populate(unicodes=[cp for lo, hi in ranges for cp in range(lo, hi + 1)])
    subsetter.subset(font)
    font.flavor = "woff2"
    return font


def main() -> None:
    sources = {name: fetch(path) for name, path in SOURCES.items()}
    for out, source, location, ranges, family, style in OUTPUTS:
        font = static_instance(sources[source], location)
        rename(font, family, style)
        font = subset(font, ranges)
        font.save(HERE / out)
        print(f"{out}: {(HERE / out).stat().st_size:,} bytes")
    for out, path in LICENCES.items():
        (HERE / out).write_bytes(fetch(path))
        print(out)


if __name__ == "__main__":
    main()
