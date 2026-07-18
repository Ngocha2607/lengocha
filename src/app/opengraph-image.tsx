import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Lê Ngọc Hà — Senior Frontend Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social preview card, rendered statically at build time. Fonts are bundled
// under _fonts and read from disk (offline-safe). The name needs both the latin
// subset (L, ê, à…) and the vietnamese subset (ọ) — Satori falls back across them.
export default async function OpengraphImage() {
  const fontDir = join(process.cwd(), "src", "app", "_fonts");
  const [latin700, viet700, latin400] = await Promise.all([
    readFile(join(fontDir, "inter-latin-700.woff")),
    readFile(join(fontDir, "inter-vietnamese-700.woff")),
    readFile(join(fontDir, "inter-latin-400.woff")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          fontFamily: "Inter",
          background:
            "radial-gradient(circle at 88% 12%, rgba(45,212,191,0.20), #0f172a 46%)",
        }}
      >
        {/* "H" mark */}
        <div style={{ display: "flex", alignItems: "center", height: 64, marginBottom: 44 }}>
          <div style={{ width: 16, height: 64, background: "#5eead4" }} />
          <div style={{ display: "flex", alignItems: "center", width: 28, height: 64 }}>
            <div style={{ width: 28, height: 16, background: "#5eead4" }} />
          </div>
          <div style={{ width: 16, height: 64, background: "#5eead4" }} />
        </div>

        <div style={{ display: "flex", fontWeight: 700, fontSize: 96, color: "#e2e8f0", lineHeight: 1.1 }}>
          Lê Ngọc Hà
        </div>
        <div style={{ display: "flex", fontWeight: 700, fontSize: 46, color: "#5eead4", marginTop: 18 }}>
          Senior Frontend Engineer
        </div>
        <div style={{ display: "flex", fontWeight: 400, fontSize: 30, color: "#94a3b8", marginTop: 30 }}>
          React · Next.js · TypeScript · Spring Boot
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 80,
            left: 80,
            fontWeight: 400,
            fontSize: 26,
            color: "#64748b",
          }}
        >
          github.com/Ngocha2607
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: latin700, weight: 700, style: "normal" },
        { name: "Inter", data: viet700, weight: 700, style: "normal" },
        { name: "Inter", data: latin400, weight: 400, style: "normal" },
      ],
    }
  );
}
