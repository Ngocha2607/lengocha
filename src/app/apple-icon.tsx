import { ImageResponse } from "next/og";

// Route segment config
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon — teal "H" on the portfolio's slate-900 background.
// Drawn with divs (no font) so it renders reliably via Satori.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "row", alignItems: "center", height: 80 }}
        >
          <div style={{ width: 20, height: 80, background: "#5eead4" }} />
          <div style={{ display: "flex", alignItems: "center", width: 36, height: 80 }}>
            <div style={{ width: 36, height: 20, background: "#5eead4" }} />
          </div>
          <div style={{ width: 20, height: 80, background: "#5eead4" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
